import json
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection('problems')
id = []
documents = []

# async def getProblems():
with open('problems.json', 'r', encoding="utf-8") as problem_file:
    problems = json.load(problem_file)
    for p in problems:
        id.append(p['id'])
        text = f"{p['title']}. Pattern: {p['pattern']}. Trick: {p['trick']}"
        documents.append(text)




collection.add(
    ids = id,
    documents = documents
)
