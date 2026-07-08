import json
import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        with open("solved.json", "r+", encoding="utf-8") as f:
            solved_problems = json.load(f)
            if id not in solved_problems:
                solved_problems.append(id)
                f.seek(0)
                json.dump(solved_problems, f, indent=4)
                f.truncate()
                return {"message": f"Problem {id} marked as solved"}
            else:
                return {"message": f"Problem {id} is already marked as solved"}
    except FileNotFoundError:
        return {"error": "Solved problems file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in solved problems file"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/solved/{id}")  
async def removeSolvedProblemById(id: str):
    try:
        with open("solved.json", "r+", encoding="utf-8") as f:
            solved_problems = json.load(f)
            if id in solved_problems:
                solved_problems.remove(id)
                f.seek(0)
                json.dump(solved_problems, f, indent=4)
                f.truncate()
                return {"message": f"Problem {id} removed from solved list"}
            else:
                return {"message": f"Problem {id} was not in the solved list"}
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
    with open("solved.json", encoding="utf-8") as f:
            solved_problems = json.load(f)
    with open("problems.json", encoding="utf-8") as f:
            problems = json.load(f)
        # problem_details = []
        # for problem in problems:
        #     for solved_id in solved_problems:
        #         if problem["id"] == solved_id:
        #             problem_details.append(problem)
    problem_details = [p for p in problems if p["id"] in solved_problems]
    return problem_details