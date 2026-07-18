import json
import time

from dotenv import load_dotenv
from google import genai
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

load_dotenv()
client = genai.Client()


class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=input,
        )
        return [e.values for e in result.embeddings]


with open('problems.json', 'r', encoding="utf-8") as problem_file:
    problems = json.load(problem_file)

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    'problems',
    embedding_function=GeminiEmbeddingFunction()
)

ids = [p['id'] for p in problems]
documents = [f"{p['title']}. Pattern: {p['pattern']}. Trick: {p['trick']}" for p in problems]

batch_size = 15
for i in range(0, len(ids), batch_size):
    collection.add(
        ids=ids[i:i + batch_size],
        documents=documents[i:i + batch_size],
    )
    print(f"embedded {min(i + batch_size, len(ids))}/{len(ids)}")
    time.sleep(15)

print(f"Done. Embedded {len(ids)} problems into ./chroma_db")