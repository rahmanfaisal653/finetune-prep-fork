#!/usr/bin/env python3
"""
RAG Ingest: Convert your PDFs into a searchable vector store.
Run once. Takes ~1-2 minutes for 6 PDFs.

Usage:
  pip install chromadb sentence-transformers -q --break-system-packages
  python3 rag_ingest.py --input datasets/ --store ./vector_db
"""

import argparse
import subprocess
import json
import os
import re
from pathlib import Path

# ============================================================
# TEXT EXTRACTION
# ============================================================
def extract_text(filepath: Path) -> str:
    ext = filepath.suffix.lower()
    if ext == '.pdf':
        try:
            result = subprocess.run(
                ['pdftotext', '-layout', str(filepath), '-'],
                capture_output=True, text=True, timeout=60
            )
            return result.stdout.strip()
        except Exception:
            return ""
    elif ext in ('.txt', '.md'):
        return filepath.read_text(encoding='utf-8', errors='replace')
    return ""


def clean_text(text: str) -> str:
    text = re.sub(r'\f', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {3,}', '  ', text)
    return text.strip()


# ============================================================
# CHUNKING (better than word-based for RAG)
# ============================================================
def chunk_by_paragraphs(text: str, max_chars: int = 1200, overlap_chars: int = 200) -> list:
    """
    Split by paragraph boundaries, merge into ~max_chars chunks.
    Keeps sentences together — better for search relevance.
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    current = ""
    
    for para in paragraphs:
        if len(current) + len(para) < max_chars:
            current = (current + '\n\n' + para).strip()
        else:
            if current:
                chunks.append(current)
            # Overlap: carry last part forward
            words = para.split()
            if len(words) > 20:
                current = ' '.join(words[-overlap_chars:][:30]) if len(' '.join(words)) > overlap_chars else para
            else:
                current = para
    
    if current:
        chunks.append(current)
    
    return chunks


# ============================================================
# INGEST PIPELINE
# ============================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, required=True, help='Folder with PDFs')
    parser.add_argument('--store', type=str, default='./vector_db', help='Where to save vector DB')
    parser.add_argument('--model', type=str, default='all-MiniLM-L6-v2',
                        help='Embedding model (default: tiny, fast, free)')
    parser.add_argument('--chunk-size', type=int, default=1200, help='Max chars per chunk')
    args = parser.parse_args()
    
    # Step 1: Extract text
    print("=" * 60)
    print("STEP 1: Extracting text from PDFs...")
    print("=" * 60)
    
    input_path = Path(args.input)
    files = sorted(input_path.rglob('*.pdf')) if input_path.is_dir() else [input_path]
    
    documents = []  # [{text, file, chunk_id}]
    
    for f in files:
        print(f"\n📄 {f.name}")
        raw = extract_text(f)
        if not raw:
            print("   → EMPTY")
            continue
        
        clean = clean_text(raw)
        chunks = chunk_by_paragraphs(clean, max_chars=args.chunk_size)
        
        for i, chunk in enumerate(chunks):
            documents.append({
                "text": chunk,
                "file": f.name,
                "chunk_id": i,
            })
        
        print(f"   → {len(raw):,} chars → {len(chunks)} chunks")
    
    print(f"\n✅ Total: {len(documents)} chunks from {len(files)} files")
    
    # Step 2: Embed + store
    print(f"\n{'=' * 60}")
    print(f"STEP 2: Embedding chunks ({args.model})...")
    print(f"{'=' * 60}")
    
    from sentence_transformers import SentenceTransformer
    import chromadb
    from chromadb.config import Settings
    
    model = SentenceTransformer(args.model)
    print(f"   Model loaded: {args.model}")
    
    client = chromadb.PersistentClient(path=args.store)
    collection = client.get_or_create_collection(
        name="pdf_docs",
        metadata={"hnsw:space": "cosine"}
    )
    
    batch_size = 50
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        ids = [f"doc_{j}" for j in range(i, i + len(batch))]
        texts = [d["text"] for d in batch]
        metadatas = [{"file": d["file"], "chunk_id": d["chunk_id"], "source": d["file"]} for d in batch]
        
        print(f"   Embedding {i+1}-{min(i+batch_size, len(documents))}/{len(documents)}...", end=" ", flush=True)
        embeddings = model.encode(texts).tolist()
        
        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )
        print("✅")
    
    print(f"\n✅ DONE!")
    print(f"   Vector DB: {args.store}")
    print(f"   Chunks: {collection.count()}")
    print(f"   Files: {len(files)}")
    print(f"\nNow run: python3 rag_chat.py --store {args.store}")


if __name__ == '__main__':
    main()
