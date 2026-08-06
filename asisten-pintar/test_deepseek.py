import os
from openai import OpenAI
import json

client = OpenAI(api_key="sk-c60b5b633b8ba408-ekg39z-70bf55ae", base_url="http://43.159.43.50:20128/v1")

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
