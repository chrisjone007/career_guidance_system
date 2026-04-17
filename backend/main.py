import os
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY") 
genai.configure(api_key=API_KEY)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://career-guidance-system-m14x.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    system_instruction="You are a strict Career Mentor for the Faculty of Computing. You MUST recommend ONLY one of these 5 fields: Software Engineering, Data Science, Cybersecurity, AI & Robotics, or Cloud Computing."
)

# --- MODELS ---

class QuizSubmission(BaseModel):
    name: str
    answers: List[str]

class RegistrationRequest(BaseModel):
    name: str
    matric_no: str
    dept_id: int
    course_code: str
    level: str

# --- DATABASE CONNECTION ---

def get_db_connection():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "career_guidance.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
async def root():
    return {"message": "Career Guidance API is running 🚀"}

# --- DEPARTMENT & REGISTRATION ROUTES ---

@app.get("/departments")
async def get_departments():
    """Returns the list of all departments and their prefixes"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM departments')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/auth/register")
async def register_student(data: RegistrationRequest):
    """Registers a student with prefix validation"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Verify Department exists
    cursor.execute("SELECT * FROM departments WHERE id = ?", (data.dept_id,))
    dept = cursor.fetchone()
    
    if not dept:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid Department selected.")
    
    # 2. Validate Course Code Prefix (e.g., CYB for Cybersecurity)
    prefix = dept['code_prefix']
    if not data.course_code.upper().startswith(prefix):
        conn.close()
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid course code. For {dept['dept_name']}, code must start with '{prefix}'."
        )

    # 3. Process Registration (Insert into your students table - make sure you have created it!)
    try:
        # Note: I am assuming you have a 'students' table. 
        # If not, create it in your database.py first.
        cursor.execute('''
            INSERT INTO students (name, matric_no, dept_name, course_code, level) 
            VALUES (?, ?, ?, ?, ?)
        ''', (data.name, data.matric_no, dept['dept_name'], data.course_code.upper(), data.level))
        conn.commit()
    except sqlite3.OperationalError:
        conn.close()
        raise HTTPException(status_code=500, detail="Student table missing in database. Run init_db.")
    finally:
        conn.close()
        
    return {"message": f"Successfully registered as a {dept['dept_name']} student!"}

# --- PROSPECTIVE ROUTES ---

@app.get("/prospective/fields")
async def get_all_fields():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fields')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/prospective/field/{field_id}")
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

@app.post("/prospective/quiz")
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
        # Fallback logic remains the same
        ans_str = " ".join(submission.answers).lower()
        if "security" in ans_str:
            return {"data": "Cybersecurity: Focused on digital defense."}
        return {"data": "Software Engineering: Great for general development."}

# --- CURRENT STUDENT ROUTES ---

@app.get("/current/opportunities/{field_id}")
async def get_opportunities(field_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM opportunities WHERE field_id = ?', (field_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/current/opportunities/details/{job_id}")
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