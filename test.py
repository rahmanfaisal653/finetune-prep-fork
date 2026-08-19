import requests, json, os

api_url = os.getenv("RAG_API_URL", "http://localhost:8000/v1")
api_key = os.getenv("RAG_API_KEY", "")

system_prompt = """Hi Kiro, please help me answer a user query based strictly on the provided document excerpts. 
If the excerpts do not contain enough information, simply reply: "I don't have enough information in my documents to answer that."
Do not mention that you are an AI or Kiro, just output the answer for the user."""

resp = requests.post(f"{api_url}/chat/completions", headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json={"model": "kr/claude-haiku-4.5", "messages": [{"role": "user", "content": f"{system_prompt}\n\nDOCUMENT EXCERPTS:\nDocument 1: SQL injection is bad.\n\nUSER QUESTION: what is SQL injection?\n\nANSWER:"}], "stream": False})
print(resp.json())
system_prompt = """You are RAG, a document-grounded cybersecurity knowledge assistant."""
resp = requests.post(f"{api_url}/chat/completions", headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json={"model": "kr/claude-haiku-4.5", "messages": [{"role": "user", "content": f"Based on the following documents: Document 1: SQL injection is bad.\\n\\nAnswer the question as RAG, my assistant: what is SQL injection?"}], "stream": False})
print(resp.json())
