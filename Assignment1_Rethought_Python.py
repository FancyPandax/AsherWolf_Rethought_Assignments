# Purpose CLI app to interact with school.db

import sqlite3

def create_tables(curr):
    # Create the tables 
    
    curr.execute('''
    CREATE TABLE IF NOT EXISTS Student (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        class_name TEXT
    )
    ''')

    curr.execute('''
    CREATE TABLE IF NOT EXISTS Teacher (
        teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_name TEXT
    )
    ''')

    curr.execute('''
    CREATE TABLE IF NOT EXISTS Class (
        class_id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT,
        teacher_id INTEGER,
        FOREIGN KEY (teacher_id) REFERENCES Teacher (teacher_id)
    )
    ''')


def insert_class(curr):
    class_name = input("Enter class name: ")
    teacher_name = input("Enter teacher's name: ")

    # Insert teacher and class data
    curr.execute('''
    INSERT INTO Teacher (teacher_name) VALUES (?)
    ''', (teacher_name,))
    teacher_id = curr.lastrowid  

    curr.execute('''
    INSERT INTO Class (class_name, teacher_id) VALUES (?, ?)
    ''', (class_name, teacher_id))
    print(f"Class '{class_name}' with teacher '{teacher_name}' inserted.")


def insert_student(curr):
    student_name = input("Enter student name: ")
    class_name = input("Enter class name for the student: ")

    curr.execute('''
    INSERT INTO Student (name, class_name) VALUES (?, ?)
    ''', (student_name, class_name))
    print(f"Student '{student_name}' inserted into class '{class_name}'.")


def insert_teacher(curr):
    teacher_name = input("Enter teacher's name: ")
    curr.execute('''
    INSERT INTO Teacher (teacher_name) VALUES (?)
    ''', (teacher_name,))
    print(f"Teacher '{teacher_name}' inserted.")


def query_all_students(curr):
    curr.execute('''
    SELECT name FROM Student
    ''')
    print("\nAll students:")
    for row in curr.fetchall():
        print(f" - {row[0]}")


def query_all_teachers(curr):
    curr.execute('''
    SELECT teacher_name FROM Teacher
    ''')
    print("\nAll teachers:")
    for row in curr.fetchall():
        print(f" - {row[0]}")


def query_all_classes(curr):
    curr.execute('''
    SELECT class_name FROM Class
    ''')
    print("\nAll classes:")
    for row in curr.fetchall():
        print(f" - {row[0]}")


def query_students_in_class(curr):
    class_name = input("Enter class name to list students: ")
    curr.execute('''
    SELECT Student.name
    FROM Student
    JOIN Class ON Student.class_name = Class.class_name
    WHERE Class.class_name = ?
    ''', (class_name,))
    print(f"\nStudents in class '{class_name}':")
    for row in curr.fetchall():
        print(f" - {row[0]}")


def query_students_for_teacher(curr):
    teacher_name = input("Enter teacher's name to list their students: ")
    curr.execute('''
    SELECT Student.name
    FROM Student
    JOIN Class ON Student.class_name = Class.class_name
    JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
    WHERE Teacher.teacher_name = ?
    ''', (teacher_name,))
    print(f"\nStudents for teacher '{teacher_name}':")
    for row in curr.fetchall():
        print(f" - {row[0]}")


def query_students_in_class_with_teacher(curr):
    class_name = input("Enter class name to list students and teacher: ")
    curr.execute('''
    SELECT Student.name, Teacher.teacher_name
    FROM Student
    JOIN Class ON Student.class_name = Class.class_name
    JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
    WHERE Class.class_name = ?
    ''', (class_name,))
    results = curr.fetchall()
    if results:
        teacher = results[0][1]
        print(f"\nClass: {class_name}, Teacher: {teacher}")
        print("Students:")
        for row in results:
            print(f" - {row[0]}")
    else:
        print(f"\nNo data found for class: {class_name}")


def main():
    
    db = sqlite3.connect("school.db")
    curr = db.cursor()

    # Create tables if they don't exist
    create_tables(curr)

    while True:
        print("\nSchool Database Menu:")
        print("1. Insert a Class")
        print("2. Insert a Student")
        print("3. Insert a Teacher")
        print("4. All Students")
        print("5. All Teachers")
        print("6. All Classes")
        print("7. Query Students in a Class")
        print("8. Query Students for a Teacher")
        print("9. Query Students in a Class with Teacher")
        print("0. Exit")

        choice = input("Enter your choice: ")

        if choice == '1':
            insert_class(curr)
        elif choice == '2':
            insert_student(curr)
        elif choice == '3':
            insert_teacher(curr)
        elif choice == '4':
            query_all_students(curr)
        elif choice == '5':
            query_all_teachers(curr)
        elif choice == '6':
            query_all_classes(curr)
        elif choice == '7':
            query_students_in_class(curr)
        elif choice == '8':
            query_students_for_teacher(curr)
        elif choice == '9':
            query_students_in_class_with_teacher(curr)
        elif choice == '0':
            print("Exiting program.")
            break
        else:
            print("Invalid choice. Please try again.")

        
        db.commit()

   
    db.close()


if __name__ == "__main__":
    main()
