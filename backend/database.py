import os
import sqlite3

def get_db_connection():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "career_guidance.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "career_guidance.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop tables to start fresh
    cursor.execute('DROP TABLE IF EXISTS opportunities')
    cursor.execute('DROP TABLE IF EXISTS skills')
    cursor.execute('DROP TABLE IF EXISTS fields')
    cursor.execute('DROP TABLE IF EXISTS departments')
    cursor.execute('DROP TABLE IF EXISTS students') # Added this

    # 1. Departments Table
    cursor.execute('''
        CREATE TABLE departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_name TEXT NOT NULL,
            code_prefix TEXT NOT NULL
        )
    ''')

    # 2. Fields Table
    cursor.execute('''
        CREATE TABLE fields (
            id INTEGER PRIMARY KEY, 
            name TEXT, 
            description TEXT
        )
    ''')

    # 3. Students Table (CRITICAL MISSING PIECE)
    # This matches your main.py registration logic
    cursor.execute('''
        CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            matric_no TEXT UNIQUE NOT NULL,
            dept_name TEXT,
            course_code TEXT,
            level TEXT
        )
    ''')

    # 4. Skills Table
    cursor.execute('''
        CREATE TABLE skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            skill_name TEXT, 
            field_id INTEGER, 
            FOREIGN KEY(field_id) REFERENCES fields(id)
        )
    ''')

    # 5. Opportunities Table
    cursor.execute('''
        CREATE TABLE opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            title TEXT, 
            company TEXT, 
            location TEXT,
            field_id INTEGER, 
            FOREIGN KEY(field_id) REFERENCES fields(id)
        )
    ''')

    # --- DATA INSERTION ---
    departments = [
        ('Computer Science', 'CSC'),
        ('Cybersecurity', 'CYB'),
        ('Software Engineering', 'SWE'),
        ('Information Technology', 'IFT'),
        ('Data Science', 'DSC')
    ]

    fields = [
        (1, 'Software Engineering', 'Designing and building software systems.'),
        (2, 'Data Science', 'Analyzing data for insights.'),
        (3, 'Cybersecurity', 'Protecting digital assets.'),
        (4, 'Artificial Intelligence', 'Creating intelligent machines.'),
        (5, 'Cloud Computing', 'Internet-based computing services.')
    ]

    skills = [
        ('React & Next.js', 1), ('Python Backend', 1),
        ('Machine Learning', 2), ('Data Visualization', 2),
        ('Ethical Hacking', 3), ('Network Security', 3),
        ('Neural Networks', 4), ('Natural Language Processing', 4),
        ('AWS/Azure', 5), ('Docker/Kubernetes', 5)
    ]

    opportunities = [
        ('Full Stack Intern', 'Microsoft', 'Lagos', 1),
        ('Junior Data Analyst', 'KPMG', 'Remote', 2),
        ('Security Consultant', 'Check Point', 'Abuja', 3),
        ('AI Resident', 'Google Research', 'Remote', 4),
        ('Cloud Architect Intern', 'MainOne', 'Lagos', 5)
    ]

    cursor.executemany("INSERT INTO departments (dept_name, code_prefix) VALUES (?,?)", departments)
    cursor.executemany("INSERT INTO fields VALUES (?,?,?)", fields)
    cursor.executemany("INSERT INTO skills (skill_name, field_id) VALUES (?,?)", skills)
    cursor.executemany("INSERT INTO opportunities (title, company, location, field_id) VALUES (?,?,?,?)", opportunities)

    conn.commit()
    conn.close()
    print("✅ Database Initialized with all tables and data!")

if __name__ == "__main__":
    init_db()