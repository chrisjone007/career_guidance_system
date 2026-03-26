import sqlite3

def init_db():
    conn = sqlite3.connect('career_guidance.db')
    cursor = conn.cursor()

    # Drop tables to start fresh and fix the ID mapping
    cursor.execute('DROP TABLE IF EXISTS opportunities')
    cursor.execute('DROP TABLE IF EXISTS skills')
    cursor.execute('DROP TABLE IF EXISTS fields')

    # 1. Create Fields Table
    cursor.execute('''
        CREATE TABLE fields (
            id INTEGER PRIMARY KEY, 
            name TEXT, 
            description TEXT
        )
    ''')

    # 2. Create Skills Table
    cursor.execute('''
        CREATE TABLE skills (
            id INTEGER PRIMARY KEY, 
            skill_name TEXT, 
            field_id INTEGER, 
            FOREIGN KEY(field_id) REFERENCES fields(id)
        )
    ''')

    # 3. Create Opportunities Table
    cursor.execute('''
        CREATE TABLE opportunities (
            id INTEGER PRIMARY KEY, 
            title TEXT, 
            company TEXT, 
            location TEXT,
            field_id INTEGER, 
            FOREIGN KEY(field_id) REFERENCES fields(id)
        )
    ''')

    # DATA INSERTION
    fields = [
        (1, 'Software Engineering', 'Designing, developing, and maintaining complex software systems.'),
        (2, 'Data Science', 'Extracting insights from structured and unstructured data.'),
        (3, 'Cybersecurity', 'Protecting systems, networks, and programs from digital attacks.'),
        (4, 'Artificial Intelligence', 'Developing systems capable of performing human-like tasks.'),
        (5, 'Cloud Computing', 'Managing servers, storage, and applications over the internet.')
    ]

    skills = [
        ('React & Next.js', 1), ('Python Backend', 1), ('Git/GitHub', 1),
        ('Machine Learning', 2), ('Data Visualization', 2), ('SQL/NoSQL', 2),
        ('Ethical Hacking', 3), ('Network Security', 3), ('Cryptography', 3),
        ('Neural Networks', 4), ('Natural Language Processing', 4), ('Computer Vision', 4),
        ('AWS/Azure', 5), ('Docker/Kubernetes', 5), ('Linux Admin', 5)
    ]

    opportunities = [
        ('Full Stack Intern', 'Microsoft', 'Lagos', 1),
        ('Junior Data Analyst', 'KPMG', 'Remote', 2),
        ('Security Consultant', 'Check Point', 'Abuja', 3),
        ('AI Resident', 'Google Research', 'Remote', 4),
        ('Cloud Architect Intern', 'MainOne', 'Lagos', 5)
    ]

    cursor.executemany("INSERT INTO fields VALUES (?,?,?)", fields)
    cursor.executemany("INSERT INTO skills (skill_name, field_id) VALUES (?,?)", skills)
    cursor.executemany("INSERT INTO opportunities (title, company, location, field_id) VALUES (?,?,?,?)", opportunities)

    conn.commit()
    conn.close()
    print("✅ Database Reset: 5 Fields, 15 Skills, and 5 Opportunities created.")

if __name__ == "__main__":
    init_db()