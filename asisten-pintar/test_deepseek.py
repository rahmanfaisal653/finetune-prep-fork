import os
from openai import OpenAI
import json

api_key = os.getenv("RAG_API_KEY", "")
base_url = os.getenv("RAG_API_URL", "http://localhost:8000/v1")

client = OpenAI(api_key=api_key, base_url=base_url)

response = client.chat.completions.create(
    model="cbcn/glm-5.0-turbo",
    messages=[{"role": "user", "content": "hello"}],
    temperature=0.3,
    max_tokens=100,
    stream=True
)

for chunk in response:
    print(repr(chunk))
    delta = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else ""
    print(f"delta: {repr(delta)}")
