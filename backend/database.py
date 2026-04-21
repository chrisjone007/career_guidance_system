import os
import sqlite3

def get_db_connection():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "career_guidance.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('DROP TABLE IF EXISTS opportunities')
    cursor.execute('DROP TABLE IF EXISTS skills')
    cursor.execute('DROP TABLE IF EXISTS fields')
    cursor.execute('DROP TABLE IF EXISTS departments')
    cursor.execute('DROP TABLE IF EXISTS students')

    cursor.execute('CREATE TABLE departments (id INTEGER PRIMARY KEY AUTOINCREMENT, dept_name TEXT NOT NULL, code_prefix TEXT NOT NULL)')
    cursor.execute('CREATE TABLE fields (id INTEGER PRIMARY KEY, name TEXT, description TEXT)')
    cursor.execute('CREATE TABLE students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, matric_no TEXT UNIQUE NOT NULL, dept_name TEXT, course_code TEXT, level TEXT)')
    cursor.execute('CREATE TABLE skills (id INTEGER PRIMARY KEY AUTOINCREMENT, skill_name TEXT, field_id INTEGER, FOREIGN KEY(field_id) REFERENCES fields(id))')
    cursor.execute('CREATE TABLE opportunities (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, company TEXT, location TEXT, field_id INTEGER, FOREIGN KEY(field_id) REFERENCES fields(id))')

    departments = [('Computer Science', 'CSC'), ('Cybersecurity', 'CYB'), ('Software Engineering', 'SEN'), ('Data Science', 'DSA')]
    fields = [
        (1, 'Computer Science', 'Foundational computing and systems.'),
        (2, 'Cybersecurity', 'Digital defense and network security.'),
        (3, 'Software Engineering', 'Building and scaling applications.'),
        (4, 'Data Science', 'Data analysis and AI modeling.')
    ]
    skills = [
        ('Data Structures', 1), ('Operating Systems', 1),
        ('Ethical Hacking', 2), ('Network Security', 2),
        ('React & Next.js', 3), ('System Architecture', 3),
        ('Machine Learning', 4), ('Python for Data', 4)
    ]
    opportunities = [
        ('Systems Researcher', 'Google', 'Remote', 1),
        ('SOC Analyst', 'CrowdStrike', 'Lagos', 2),
        ('Frontend Engineer', 'Vercel', 'Remote', 3),
        ('Data Strategist', 'Netflix', 'Remote', 4)
    ]

    cursor.executemany("INSERT INTO departments (dept_name, code_prefix) VALUES (?,?)", departments)
    cursor.executemany("INSERT INTO fields VALUES (?,?,?)", fields)
    cursor.executemany("INSERT INTO skills (skill_name, field_id) VALUES (?,?)", skills)
    cursor.executemany("INSERT INTO opportunities (title, company, location, field_id) VALUES (?,?,?,?)", opportunities)

    conn.commit()
    conn.close()
    print("✅ Database Synchronized!")

if __name__ == "__main__":
    init_db()