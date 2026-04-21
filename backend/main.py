import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv
from database import init_db

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY") 
genai.configure(api_key=API_KEY)

app = FastAPI()
@app.get("/api/test")
async def test_api():
    return {"status": "The API is alive and reachable!"}
# Auto-initialize database on startup to ensure tables exist on Render
@app.on_event("startup")
async def startup_event():
    print("Initializing Database...")
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    system_instruction="You are a strict Career Mentor for the Faculty of Computing."
)

class QuizSubmission(BaseModel):
    name: str
    answers: List[str]

class RegistrationRequest(BaseModel):
    name: str
    matric_no: str
    dept_id: int
    course_code: str
    level: str

def get_db_connection():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "career_guidance.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api") # Changed to /api
async def root():
    return {"message": "Career Guidance API is running 🚀"}

@app.get("/api/departments", tags=["General"])
@app.get("/api/departments/", include_in_schema=False) # Ensured /api prefix
async def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM departments')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/auth/register") # Added /api
async def register_student(data: RegistrationRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM departments WHERE id = ?", (data.dept_id,))
        dept = cursor.fetchone()
        if not dept:
            raise HTTPException(status_code=400, detail="Invalid Department.")

        prefix = dept['code_prefix']
        if not data.course_code.upper().startswith(prefix):
            raise HTTPException(status_code=400, detail=f"Code must start with {prefix}")

        cursor.execute('''
            INSERT INTO students (name, matric_no, dept_name, course_code, level) 
            VALUES (?, ?, ?, ?, ?)
        ''', (data.name, data.matric_no, dept['dept_name'], data.course_code.upper(), data.level))
        conn.commit()
        return {"message": "Success"}
    finally:
        conn.close()

# --- PROSPECTIVE ROUTES (All prefixed with /api) ---

@app.get("/api/prospective/fields")
async def get_all_fields():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fields')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/prospective/field/{field_id}")
async def get_field_details(field_id: int): 
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fields WHERE id = ?', (field_id,))
    field = cursor.fetchone()
    
    if field:
        try:
            cursor.execute('SELECT skill_name FROM skills WHERE field_id = ?', (field["id"],))
            skills = [row["skill_name"] for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            skills = ["Foundational Computing", "Logic & Problem Solving"]
        
        conn.close()
        return {
            "name": field["name"],
            "description": field["description"],
            "skills": skills
        }
    conn.close()
    raise HTTPException(status_code=404, detail="Field not found")

@app.post("/api/prospective/quiz")
async def process_quiz(submission: QuizSubmission):
    prompt = (
        f"The student {submission.name} selected these interests: {', '.join(submission.answers)}. "
        "Based strictly on these specific interests, which of the 5 Computing fields fits best? "
        "Return the result as: 'FIELD_NAME: [Reasoning]'"
    )
    
    try:
        response = model.generate_content(prompt)
        return {"data": response.text}
    except Exception as e:
        ans_str = " ".join(submission.answers).lower()
        if "security" in ans_str:
            return {"data": "Cybersecurity: Focused on digital defense."}
        return {"data": "Software Engineering: Great for general development."}

# --- CURRENT STUDENT ROUTES (All prefixed with /api) ---

@app.get("/api/current/opportunities/{field_id}")
async def get_opportunities(field_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM opportunities WHERE field_id = ?', (field_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/current/opportunities/details/{job_id}")
async def get_job_details(job_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM opportunities WHERE id = ?', (job_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        job = dict(row)
        if job.get("requirements") and isinstance(job["requirements"], str):
            job["requirements"] = [r.strip() for r in job["requirements"].split(',')]
        else:
            job["requirements"] = []
        return job
    
    raise HTTPException(status_code=404, detail="Job not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)