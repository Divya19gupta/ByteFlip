import json
import random
from pathlib import Path

import chromadb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client()

from chromadb import Documents, EmbeddingFunction, Embeddings

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=input,
        )
        return [e.values for e in result.embeddings]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_tasks():
    if not Path("solved.json").exists():
        with open("solved.json", "w", encoding="utf-8") as f:
            json.dump([], f)

    if not Path("session.json").exists():
        with open("session.json", "w", encoding="utf-8") as f:
            json.dump({"queue": [], "seen": []}, f)

    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection(
        name="problems",
        embedding_function=GeminiEmbeddingFunction()
    )
    if collection.count() == 0:
        with open("problems.json", encoding="utf-8") as f:
            problems = json.load(f)
        ids = [p["id"] for p in problems]
        documents = [f"{p['title']}. Pattern: {p['pattern']}. Trick: {p['trick']}" for p in problems]
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            collection.add(ids=ids[i:i + batch_size], documents=documents[i:i + batch_size])


@app.get("/")
async def root():
    return {"message": "DSAForge API running"}

@app.get("/problems")
async def getAllProblems():
    try:
        with open("problems.json", encoding="utf-8") as f:
            problems = json.load(f)
        return problems
    except FileNotFoundError:
        return {"error": "Problems file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in problems file"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/solved/{id}")
async def addSolvedProblemById(id: str):
    try:
        with open("solved.json", "r+", encoding="utf-8") as solved_file, open("session.json", "r+", encoding="utf-8") as session_file:
            solved_problems = json.load(solved_file)
            session_data = json.load(session_file)
            if id not in solved_problems:
                solved_problems.append(id)
                session_data["queue"].append(id)
                session_file.seek(0)
                solved_file.seek(0)
                json.dump(solved_problems, solved_file, indent=4)
                json.dump(session_data, session_file, indent=4)
                solved_file.truncate()
                session_file.truncate()
                return {"message": f"Problem {id} marked as solved and added to session queue"}
            else:
                return {"message": f"Problem {id} is already marked as solved and in the session queue"}
    except FileNotFoundError:
        return {"error": "Solved problems file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in solved problems file"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/solved/{id}")
async def removeSolvedProblemById(id: str):
    try:
        with open("solved.json", "r+", encoding="utf-8") as solved_file, open("session.json", "r+", encoding="utf-8") as session_file:
            solved_problems = json.load(solved_file)
            session_data = json.load(session_file)
            if id in solved_problems:
                solved_problems.remove(id)
                if id in session_data["queue"]:
                    session_data["queue"].remove(id)
                if id in session_data["seen"]:
                    session_data["seen"].remove(id)
                solved_file.seek(0)
                session_file.seek(0)
                json.dump(solved_problems, solved_file, indent=4)
                json.dump(session_data, session_file, indent=4)
                solved_file.truncate()
                session_file.truncate()
                return {"message": f"Problem {id} removed from solved problems and session queue/seen"}
            else:
                return {"message": f"Problem {id} is not marked as solved"}
    except FileNotFoundError:
        return {"error": "Solved problems file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in solved problems file"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/solved")
async def getAllSolvedProblemsByIds():
    try:
        problems = get_solved_problems()
        return problems
    except FileNotFoundError:
        return {"error": "Solved problems or problems file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in solved problems or problems file"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/quiz")
async def getQuizProblems():
    try:
        randomise_problems = get_solved_problems()
        quiz_problems = random.choice(randomise_problems)
        return quiz_problems
    except Exception as e:
        return {"error": str(e)}

def get_solved_problems():
    with open("solved.json", encoding="utf-8") as solved_file:
        solved_problems = json.load(solved_file)
    with open("problems.json", encoding="utf-8") as problems_file:
        problems = json.load(problems_file)
    problem_details = [p for p in problems if p["id"] in solved_problems]
    return problem_details

@app.post("/session/current")
async def advanceToNextProblem():
    try:
        with open('session.json', 'r+', encoding="utf-8") as session_file, open('problems.json', 'r', encoding="utf-8") as problem_file:
            session_data = json.load(session_file)
            problem_data = json.load(problem_file)
            if session_data["queue"]:
                currentId = session_data["queue"].pop(0)
                session_data["seen"].append(currentId)
            if not session_data["queue"]:
                session_data["queue"] = session_data["seen"]
                random.shuffle(session_data["queue"])
                session_data["seen"] = []
            next_id = session_data["queue"][0]
            next_problem = findProblem(next_id, problem_data)
            remaining_after = len(session_data["queue"]) - 1

            session_file.seek(0)
            json.dump(session_data, session_file, indent=4)
            session_file.truncate()

            return {"current_problem": next_problem, "remaining_after": remaining_after}
    except Exception as e:
        return {"error": str(e)}

@app.get("/session/current")
async def setCurrentProblemInSession():
    try:
        with open("session.json", "r", encoding="utf-8") as session_file, open("problems.json", "r", encoding="utf-8") as problem_file:
            problem_data = json.load(problem_file)
            session_data = json.load(session_file)
            queueId = session_data["queue"][0]
            current_problem = findProblem(queueId, problem_data)
            remaining_after = len(session_data["queue"]) - 1
        return {"current_problem": current_problem, "remaining_after": remaining_after}
    except Exception as e:
        return {"error": str(e)}

def findProblem(problem_id, problem_data):
    for problem in problem_data:
        if problem["id"] == problem_id:
            return problem
    return None

@app.post("/hint/{id}")
async def getHints(id: str):
    try:
        with open('problems.json', encoding="utf-8") as problems_file:
            problems = json.load(problems_file)
        current_problem = findProblem(id, problems)

        text = f"{current_problem['title']}. Pattern: {current_problem['pattern']}. Trick: {current_problem['trick']}"
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        collection = chroma_client.get_or_create_collection(
            name="problems",
            embedding_function=GeminiEmbeddingFunction()
        )

        results = collection.query(
            query_texts=[text],
            n_results=4
        )

        similar_problems = results['documents'][0]
        prompt = f"""
            The user is stuck in a DSA problem. Just give them hints based on the following:
            Title: {current_problem['title']}
            Pattern: {current_problem['pattern']}

            Similar titles = {similar_problems}
            Give useful hints in 2-3 lines, just for the user to understand the approach
            without revealing the whole solution. Never reveal the whole solution.
            Write in plain sentences only — no markdown, no asterisks, no bullet points.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {'hint': response.text}

    except Exception as e:
        return {"error": str(e)}

@app.get("/session/status")
async def getSessionStatus():
    try:
        with open("session.json", encoding="utf-8") as session_file:
            session_data = json.load(session_file)
        return {
            "seen": len(session_data["seen"]),
            "remaining": len(session_data["queue"]),
        }
    except FileNotFoundError:
        return {"seen": 0, "remaining": 0}
    except Exception as e:
        return {"error": str(e)}