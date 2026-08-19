#!/usr/bin/env python3
"""
RAG Chat: Ask questions about your documents.
Searches vector DB, finds relevant chunks, asks 9router to answer.

Usage:
  pip install chromadb sentence-transformers openai -q --break-system-packages
  python3 rag_chat.py --store ./vector_db [--model ...]
"""

import argparse
import sys
import os
from pathlib import Path

DEFAULT_SYSTEM = """You are a cybersecurity expert assistant. You have access to documents about penetration testing, Burp Suite, SQL injection, fuzzing, crash analysis, and Google Dorking.

Answer the user's question using ONLY the document excerpts provided below. If the excerpts don't contain enough information, say "I don't have enough information in my documents to answer that" — do NOT guess or hallucinate.

Cite which file the information comes from when possible.
Be detailed, technical, and accurate."""


def search(collection, model, query: str, top_k: int = 15):
    """Find the most relevant chunks for a query."""
    query_embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
    )
    return results


def build_prompt(query: str, results, system_prompt: str) -> str:
    """Build the full prompt with retrieved context."""
    contexts = []
    for i, (doc, meta) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
        file = meta.get("file", "unknown")
        contexts.append(f"[EXCERPT {i+1} — from {file}]\n{doc}\n")
    
    context_block = "\n".join(contexts)
    
    return f"""{system_prompt}

DOCUMENT EXCERPTS:
{context_block}

USER QUESTION: {query}

ANSWER:"""


def chat_terminal(collection, embedding_model, client, model_name, system_prompt, top_k=15):
    """Interactive chat loop with RAG."""
    print("=" * 60)
    print("  RAG PENTESTING CHATBOT")
    print(f"  Model: {model_name} | Docs: {collection.count()} chunks")
    print("  Type 'quit' to exit | 'sources' to toggle source display")
    print("=" * 60)
    
    show_sources = True
    history = []
    
    while True:
        try:
            query = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break
        
        if not query:
            continue
        if query.lower() == 'quit':
            break
        if query.lower() == 'sources':
            show_sources = not show_sources
            print(f"Show sources: {show_sources}")
            continue
        
        # Search vector DB
        results = search(collection, embedding_model, query, top_k=top_k)
        
        # Build prompt with context
        prompt = build_prompt(query, results, system_prompt)
        
        # Show sources
        if show_sources:
            print(f"\n📚 Found {len(results['documents'][0])} relevant chunks:")
            for i, meta in enumerate(results["metadatas"][0]):
                print(f"   {i+1}. {meta.get('file', '?')} (chunk {meta.get('chunk_id', '?')})")
        
        # Generate response
        print("\n", end="", flush=True)
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.5,
                max_tokens=1024,
                stream=True,
            )
            
            full = ""
            for chunk in response:
                delta = chunk.choices[0].delta.content if chunk.choices[0].delta else ""
                if delta:
                    print(delta, end="", flush=True)
                    full += delta
            print()
            
        except Exception as e:
            print(f"API Error: {e}")


def main():
    parser = argparse.ArgumentParser(description='RAG Chat with your documents')
    parser.add_argument('--store', type=str, required=True, help='Path to vector DB (from rag_ingest.py)')
    parser.add_argument('--model', type=str, default='kr/claude-haiku-4.5',
                        help='9router model to use')
    parser.add_argument('--api-url', type=str, default=os.getenv('RAG_API_URL', 'http://localhost:8000/v1'))
    parser.add_argument('--api-key', type=str, default=os.getenv('RAG_API_KEY', ''))
    parser.add_argument('--embed-model', type=str, default='all-MiniLM-L6-v2')
    parser.add_argument('--top-k', type=int, default=15, help='Chunks to retrieve per query')
    parser.add_argument('--system', type=str, default=DEFAULT_SYSTEM)
    
    args = parser.parse_args()
    
    # Load vector DB
    print("Loading vector database...", end=" ", flush=True)
    from sentence_transformers import SentenceTransformer
    import chromadb
    
    embedding_model = SentenceTransformer(args.embed_model)
    client_db = chromadb.PersistentClient(path=args.store)
    collection = client_db.get_or_create_collection(name="pdf_docs")
    
    print(f"✅ ({collection.count()} chunks)")
    
    # Setup API client
    from openai import OpenAI
    api_client = OpenAI(api_key=args.api_key, base_url=args.api_url)
    
    # Start chat
    chat_terminal(collection, embedding_model, api_client, args.model, args.system, top_k=args.top_k)


if __name__ == '__main__':
    main()
