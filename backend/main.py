from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import google.generativeai as genai
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini with System Instructions
# REPLACE "YOUR_API_KEY" with your actual key from Google AI Studio
genai.configure(api_key="YOUR_API_KEY")

# Adding system_instruction forces the AI to follow your faculty rules
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    system_instruction="You are a strict Career Mentor for the Faculty of Computing. You MUST recommend ONLY one of these 5 fields: Software Engineering, Data Science, Cybersecurity, AI & Robotics, or Cloud Computing. Do not be generic."
)

class QuizSubmission(BaseModel):
    name: str
    answers: List[str]

def get_db_connection():
    conn = sqlite3.connect('career_guidance.db')
    conn.row_factory = sqlite3.Row
    return conn

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
        cursor.execute('SELECT skill_name FROM skills WHERE field_id = ?', (field["id"],))
        skills = [row["skill_name"] for row in cursor.fetchall()]
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
    # SMARTER PROMPT: Adds constraints to ensure variety
    prompt = (
        f"The student {submission.name} selected these interests: {', '.join(submission.answers)}. "
        "Based strictly on these specific interests, which of the 5 Computing fields fits best? "
        "If they like patterns/data, choose Data Science. If they like threats/security, choose Cybersecurity. "
        "If they like automation/AI, choose AI & Robotics. If they like architecture/servers, choose Cloud Computing. "
        "Otherwise, choose Software Engineering. "
        "Return the result as: 'FIELD_NAME: [Reasoning]'"
    )
    
    try:
        response = model.generate_content(prompt)
        return {"data": response.text}
    except Exception as e:
        print(f"Gemini Error: {e}")
        
        # 2. IMPROVED FALLBACK LOGIC (Ensures different answers even if AI fails)
        ans_str = " ".join(submission.answers).lower()
        
        if any(word in ans_str for word in ["security", "threats", "defending", "encryption"]):
            return {"data": "Cybersecurity: Your focus on digital defense and system integrity makes this the perfect path."}
        elif any(word in ans_str for word in ["patterns", "data", "statistics", "predictive"]):
            return {"data": "Data Science: Your talent for analyzing information and finding hidden insights is ideal for this field."}
        elif any(word in ans_str for word in ["robotics", "neural", "automation", "intelligence"]):
            return {"data": "AI & Robotics: Your interest in intelligent systems and automation points directly to this career."}
        elif any(word in ans_str for word in ["cloud", "architecture", "compilers", "infrastructure"]):
            return {"data": "Cloud Computing: Your passion for high-performance systems and digital infrastructure is a great match."}
        else:
            return {"data": "Software Engineering: Your drive to build visible applications and design logic is the hallmark of a great developer."}

# --- CURRENT STUDENT ROUTES ---

@app.get("/current/skills/{field_id}")
async def get_required_skills(field_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT skill_name FROM skills WHERE field_id = ?', (field_id,))
    skills = [row["skill_name"] for row in cursor.fetchall()]
    conn.close()
    return {"required_skills": skills}

@app.get("/current/opportunities/{field_id}")
async def get_opportunities(field_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM opportunities WHERE field_id = ?', (field_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]