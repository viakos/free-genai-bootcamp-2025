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
        """Parse XML-like formatted questions into structured data"""
        questions = []
        print(f"Parsing XML text: {xml_text[:200]}...")
        
        try:
            # Remove Markdown code block markers if present
            clean_xml = xml_text.strip()
            if clean_xml.startswith("```"):
                clean_xml = "\n".join(clean_xml.split("\n")[1:-1])
            
            # Split into items
            items = clean_xml.split('</item>')
            print(f"Found {len(items)} potential items")
            
            def extract_tag_content(text: str, tag: str) -> str:
                try:
                    start_tag = f"<{tag}>"
                    end_tag = f"</{tag}>"
                    start = text.index(start_tag) + len(start_tag)
                    end = text.index(end_tag, start)
                    return text[start:end].strip()
                except (ValueError, IndexError):
                    return ""
            
            for item in items:
                if not item.strip() or '<item>' not in item:
                    continue
                    
                try:
                    # Extract content for each tag
                    introduction = extract_tag_content(item, "introduction")
                    conversation = extract_tag_content(item, "conversation")
                    question = extract_tag_content(item, "question")
                    
                    # Validate all fields are present
                    if introduction and conversation and question:
                        questions.append({
                            "introduction": introduction,
                            "conversation": conversation,
                            "question": question,
                            "full_text": f"{introduction}\n{conversation}\n{question}"
                        })
                        print(f"Successfully parsed question with intro: {introduction[:50]}...")
                    else:
                        print(f"Skipping item: missing required content")
                        
                except Exception as e:
                    print(f"Error parsing item: {e}")
                    continue
            
        except Exception as e:
            print(f"Error parsing XML: {e}")
        
        print(f"Total questions parsed: {len(questions)}")
        return questions

    def add_questions(self, xml_text: str, video_id: str) -> bool:
        """Add questions from XML text to the vector store"""
        try:
            questions = self.parse_question_xml(xml_text)
            
            if not questions:
                print("No questions parsed because parse_question_xml returned None")
                return False
            print(f"Successfully parsed {len(questions)} questions")
            
            try:
                # Prepare data for ChromaDB
                documents = [q["full_text"] for q in questions]
                print(f"Prepared {len(documents)} documents")
                
                metadatas = [{
                    "video_id": video_id,
                    "introduction": q["introduction"],
                    "conversation": q["conversation"],
                    "question": q["question"]
                } for q in questions]
                print(f"Prepared {len(metadatas)} metadata entries")
                
                ids = [f"{video_id}_{i}" for i in range(len(questions))]
                print(f"Generated {len(ids)} IDs")
                
                # Add to collection
                try:
                    self.collection.add(
                        documents=documents,
                        metadatas=metadatas,
                        ids=ids
                    )
                    print(f"Successfully added {len(documents)} questions to vector store")
                    return True
                except Exception as e:
                    print(f"Failed to add to collection: {str(e)}")
                    print(f"First document sample: {documents[0][:100]}...")
                    print(f"First metadata sample: {metadatas[0]}")
                    return False
                    
            except Exception as e:
                print(f"Failed to prepare data for vector store: {str(e)}")
                return False
                
        except Exception as e:
            print(f"Failed to parse questions: {str(e)}")
            return False

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
                "question": results['metadatas'][0][i].get("question", ""),
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
