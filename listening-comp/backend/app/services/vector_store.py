import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import os
from typing import List, Dict, Any
import json
from ..core.config import settings
import xml.etree.ElementTree as ET
from . import bedrock_client

class BedrockEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self):
        self.bedrock_client = bedrock_client
        self.model_id = "amazon.titan-embed-text-v1"  # Amazon's embedding model

    def __call__(self, input: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using Amazon Titan"""
        embeddings = []
        for text in input:
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    "inputText": text
                })
            )
            embedding = json.loads(response['body'].read())['embedding']
            embeddings.append(embedding)
        return embeddings

class QuestionVectorStore:
    def __init__(self, persist_directory: str = "chroma_db"):
        """Initialize ChromaDB client with persistence"""
        # Initialize embedding function with Bedrock
        self.embedding_function = BedrockEmbeddingFunction()
        
        # Ensure the persist directory exists
        os.makedirs(persist_directory, exist_ok=True)
        
        self.client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            is_persistent=True
        ))
        
        # Delete existing collection if it exists
        try:
            self.client.delete_collection(name="japanese_questions")
        except ValueError:
            pass
        
        # Create collection with custom embedding function
        self.collection = self.client.create_collection(
            name="japanese_questions",
            metadata={"hnsw:space": "cosine"},
            embedding_function=self.embedding_function
        )

    def parse_question_xml(self, xml_text: str) -> List[Dict[str, str]]:
        """Parse XML formatted questions into structured data"""
        questions = []
        try:
            # Split multiple questions if present
            xml_texts = xml_text.split('</question>')
            for text in xml_texts:
                if not text.strip():
                    continue
                    
                # Add closing tag if missing
                if '</question>' not in text:
                    text += '</question>'
                
                # Ensure the text starts with <question>
                if not text.strip().startswith('<question>'):
                    text = '<question>' + text
                
                root = ET.fromstring(text)
                
                # Extract components
                introduction = root.find('Introduction').text.strip() if root.find('Introduction') is not None else ""
                conversation = root.find('Conversation').text.strip() if root.find('Conversation') is not None else ""
                question = root.find('Question').text.strip() if root.find('Question') is not None else ""
                
                questions.append({
                    "introduction": introduction,
                    "conversation": conversation,
                    "question": question,
                    "full_text": f"{introduction}\n{conversation}\n{question}"
                })
                
        except ET.ParseError as e:
            print(f"Error parsing XML: {e}")
        
        return questions

    def add_questions(self, xml_text: str, video_id: str):
        """Add questions from XML text to the vector store"""
        questions = self.parse_question_xml(xml_text)
        
        if not questions:
            return
        
        # Prepare data for ChromaDB
        documents = [q["full_text"] for q in questions]
        metadatas = [{
            "video_id": video_id,
            "introduction": q["introduction"],
            "conversation": q["conversation"],
            "question": q["question"]
        } for q in questions]
        ids = [f"{video_id}_{i}" for i in range(len(questions))]
        
        # Add to collection
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def add_question(self, text: str, answer: str, topic: str = "general"):
        """Add a single question to the vector store"""
        try:
            self.collection.add(
                documents=[text],
                metadatas=[{"answer": answer, "topic": topic}],
                ids=[f"q_{len(self.collection.get()['ids']) + 1}"]
            )
            return True
        except Exception as e:
            print(f"Error adding question: {e}")
            return False

    def find_similar_questions(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Find similar questions using vector similarity"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results
        similar_questions = []
        for i in range(len(results['ids'][0])):
            similar_questions.append({
                "id": results['ids'][0][i],
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None
            })
            
        return similar_questions

    def get_all_questions(self) -> List[Dict[str, Any]]:
        """Get all questions from the vector store"""
        try:
            result = self.collection.get()
            questions = []
            for i in range(len(result['ids'])):
                questions.append({
                    'id': result['ids'][i],
                    'text': result['documents'][i],
                    'metadata': result['metadatas'][i]
                })
            return questions
        except Exception as e:
            print(f"Error getting questions: {e}")
            return []

    def clear_questions(self):
        """Clear all questions from the collection"""
        try:
            self.client.delete_collection(name="japanese_questions")
            self.collection = self.client.create_collection(
                name="japanese_questions",
                metadata={"hnsw:space": "cosine"},
                embedding_function=self.embedding_function
            )
            return True
        except Exception as e:
            print(f"Error clearing questions: {e}")
            return False
