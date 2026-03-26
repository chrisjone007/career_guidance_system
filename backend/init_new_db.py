import sqlite3

def setup():
    # Connect to the database
    conn = sqlite3.connect('career_guidance.db')
    cursor = conn.cursor()

    # 1. Career Paths Table (Timeline data)
    cursor.execute('''CREATE TABLE IF NOT EXISTS career_paths 
        (id INTEGER PRIMARY KEY, career_name TEXT, steps TEXT)''')

    # Seed data for the timelines
    path_data = [
        ('Cybersecurity', 'Networking Basics, Security Fundamentals, Ethical Hacking, Security Analyst'),
        ('Data Science', 'Python Programming, Statistics, Machine Learning, Data Engineer'),
        ('Software Engineering', 'Logic & Algorithms, Web Development, System Architecture, Senior Developer')
    ]
    cursor.executemany("INSERT OR IGNORE INTO career_paths (career_name, steps) VALUES (?, ?)", path_data)

    # 2. Fields Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS fields 
        (id INTEGER PRIMARY KEY, name TEXT, description TEXT, tools TEXT, apps TEXT)''')

    # 3. Skills Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS skills 
        (id INTEGER PRIMARY KEY, field_id INTEGER, name TEXT, level TEXT)''')

    # 4. Users Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS users 
        (user_id INTEGER PRIMARY KEY, name TEXT, career_path TEXT, progress TEXT)''')

    # 5. Opportunities Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS opportunities 
        (id INTEGER PRIMARY KEY, career_path TEXT, type TEXT, title TEXT, provider TEXT)''')

    # --- SEEDING INITIAL DATA ---
    # Fields
    cursor.execute("INSERT OR IGNORE INTO fields (id, name, description, tools, apps) VALUES (1, 'Cybersecurity', 'Protecting networks and digital assets.', 'Nmap, Kali, Wireshark', 'Banking, Government, Tech')")
    cursor.execute("INSERT OR IGNORE INTO fields (id, name, description, tools, apps) VALUES (2, 'Data Science', 'Extracting insights from data.', 'Python, R, SQL, Tableau', 'Finance, Healthcare, E-commerce')")
    
    # Skills
    skills_to_seed = [
        (1, 1, 'Networking Basics', 'Beginner'),
        (2, 1, 'Python for Security', 'Intermediate'),
        (3, 1, 'Ethical Hacking', 'Advanced')
    ]
    cursor.executemany("INSERT OR IGNORE INTO skills VALUES (?, ?, ?, ?)", skills_to_seed)

    # Test User
    cursor.execute("INSERT OR IGNORE INTO users VALUES (1, 'Student Alpha', 'Cybersecurity', 'Networking Basics')")
    
    # Opportunities
    cursor.execute("INSERT OR IGNORE INTO opportunities VALUES (1, 'Cybersecurity', 'Certification', 'CompTIA Security+', 'CompTIA')")

    # These lines MUST be at the same indentation as 'cursor.execute' above
    conn.commit()
    conn.close()
    print("Database Initialized and Ready!")

if __name__ == "__main__":
    setup()