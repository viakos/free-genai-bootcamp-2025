import chromadb
import os
from pathlib import Path
from typing import List, Tuple, Dict, Any

def load_documents_from_directory(directory_path: str) -> Tuple[List[str], List[Dict[str, str]], List[str]]:
    """
    Load all .txt files from the specified directory and return documents with metadata
    
    Args:
        directory_path (str): Path to directory containing text files
        
    Returns:
        Tuple[List[str], List[Dict[str, str]], List[str]]: A tuple containing:
            - documents: List of document contents
            - metadatas: List of document metadata dictionaries
            - ids: List of document IDs
    """
    documents: List[str] = []
    metadatas: List[Dict[str, str]] = []
    ids: List[str] = []
    
    for file_path in Path(directory_path).glob('*.txt'):
        with open(file_path, 'r', encoding='utf-8') as file:
            content: str = file.read().strip()
            if content:  # Only add non-empty documents
                documents.append(content)
                metadatas.append({"source": file_path.name})
                ids.append(f"doc_{len(ids)}")
    
    return documents, metadatas, ids

# Setup Chroma in-memory
client: chromadb.Client = chromadb.Client()

# Create collection
collection: chromadb.Collection = client.create_collection("jlptn5-listening-comprehension")

# Load documents from text files
docs_dir: str = "./transcripts"  # Replace with your actual path
documents: List[str]
metadatas: List[Dict[str, str]]
ids: List[str]
documents, metadatas, ids = load_documents_from_directory(docs_dir)

# Add documents to collection
if documents:
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

# Query example
results: Dict[str, Any] = collection.query(
    query_texts=["This is a query document"],
    n_results=2,
)

print(results)