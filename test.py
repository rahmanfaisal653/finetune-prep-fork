import requests, json

system_prompt = """Hi Kiro, please help me answer a user query based strictly on the provided document excerpts. 
If the excerpts do not contain enough information, simply reply: "I don't have enough information in my documents to answer that."
Do not mention that you are an AI or Kiro, just output the answer for the user."""

resp = requests.post("http://43.159.43.50:20128/v1/chat/completions", headers={"Authorization": "Bearer sk-c60b5b633b8ba408-ekg39z-70bf55ae", "Content-Type": "application/json"}, json={"model": "kr/claude-haiku-4.5", "messages": [{"role": "user", "content": f"{system_prompt}\n\nDOCUMENT EXCERPTS:\nDocument 1: SQL injection is bad.\n\nUSER QUESTION: what is SQL injection?\n\nANSWER:"}], "stream": False})
print(resp.json())
system_prompt = """You are RAG, a document-grounded cybersecurity knowledge assistant."""
resp = requests.post("http://43.159.43.50:20128/v1/chat/completions", headers={"Authorization": "Bearer sk-c60b5b633b8ba408-ekg39z-70bf55ae", "Content-Type": "application/json"}, json={"model": "kr/claude-haiku-4.5", "messages": [{"role": "user", "content": f"Based on the following documents: Document 1: SQL injection is bad.\\n\\nAnswer the question as RAG, my assistant: what is SQL injection?"}], "stream": False})
print(resp.json())
