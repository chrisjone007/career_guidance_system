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
    cursor.execute('DROP TABLE IF EXISTS students')

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

    # 3. Students Table
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
        ('Computer Science', 'CSC'),        # ID 1
        ('Cybersecurity', 'CYB'),           # ID 2
        ('Software Engineering', 'SEN'),    # ID 3
        ('Data Science', 'DSA')             # ID 4
    ]

    fields = [
        (1, 'Computer Science', 'Foundational computing, algorithms, and systems.'),
        (2, 'Cybersecurity', 'Protecting networks, systems, and programs from digital attacks.'),
        (3, 'Software Engineering', 'The systematic application of engineering approaches to software development.'),
        (4, 'Data Science', 'Extracting knowledge and insights from structured and unstructured data.')
    ]

    skills = [
        # Computer Science (ID 1)
        ('Data Structures & Algorithms', 1), ('Operating Systems', 1), ('C++ Programming', 1),
        
        # Cybersecurity (ID 2)
        ('Ethical Hacking', 2), ('Network Security', 2), ('Penetration Testing', 2), ('Cryptography', 2),
        
        # Software Engineering (ID 3)
        ('React & Next.js', 3), ('System Architecture', 3), ('CI/CD Pipelines', 3), ('Mobile App Dev', 3),
        
        # Data Science (ID 4)
        ('Machine Learning', 4), ('Statistical Analysis', 4), ('Big Data (Hadoop/Spark)', 4), ('Python for Data Science', 4)
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
    print("✅ Database Initialized with synchronized IDs!")

if __name__ == "__main__":
    init_db()