use rusqlite::{params, Connection, Result};
use std::io::{self, Write};

fn create_tables(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS Student (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            class_name TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS Teacher (
            teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_name TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS Class (
            class_id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT,
            teacher_id INTEGER,
            FOREIGN KEY (teacher_id) REFERENCES Teacher (teacher_id)
        )",
        [],
    )?;

    Ok(())
}

fn get_input(prompt: &str) -> String {
    print!("{prompt}");
    io::stdout().flush().unwrap();
    let mut buf = String::new();
    io::stdin().read_line(&mut buf).unwrap();
    buf.trim().to_string()
}

fn insert_class(conn: &Connection) -> Result<()> {
    let class_name = get_input("Enter class name: ");
    let teacher_name = get_input("Enter teacher's name: ");

    conn.execute("INSERT INTO Teacher (teacher_name) VALUES (?1)", params![teacher_name])?;
    let teacher_id = conn.last_insert_rowid();

    conn.execute(
        "INSERT INTO Class (class_name, teacher_id) VALUES (?1, ?2)",
        params![class_name, teacher_id],
    )?;

    println!("Class '{}' with teacher '{}' inserted.", class_name, teacher_name);
    Ok(())
}

fn insert_student(conn: &Connection) -> Result<()> {
    let student_name = get_input("Enter student name: ");
    let class_name = get_input("Enter class name for the student: ");

    conn.execute(
        "INSERT INTO Student (name, class_name) VALUES (?1, ?2)",
        params![student_name, class_name],
    )?;

    println!("Student '{}' inserted into class '{}'.", student_name, class_name);
    Ok(())
}

fn insert_teacher(conn: &Connection) -> Result<()> {
    let teacher_name = get_input("Enter teacher's name: ");

    conn.execute(
        "INSERT INTO Teacher (teacher_name) VALUES (?1)",
        params![teacher_name],
    )?;

    println!("Teacher '{}' inserted.", teacher_name);
    Ok(())
}

fn query_all_students(conn: &Connection) -> Result<()> {
    let mut stmt = conn.prepare("SELECT name FROM Student")?;
    let students = stmt.query_map([], |row| row.get::<_, String>(0))?;

    println!("\nAll students:");
    for student in students {
        println!(" - {}", student?);
    }

    Ok(())
}

fn query_all_teachers(conn: &Connection) -> Result<()> {
    let mut stmt = conn.prepare("SELECT teacher_name FROM Teacher")?;
    let teachers = stmt.query_map([], |row| row.get::<_, String>(0))?;

    println!("\nAll teachers:");
    for teacher in teachers {
        println!(" - {}", teacher?);
    }

    Ok(())
}

fn query_all_classes(conn: &Connection) -> Result<()> {
    let mut stmt = conn.prepare("SELECT class_name FROM Class")?;
    let classes = stmt.query_map([], |row| row.get::<_, String>(0))?;

    println!("\nAll classes:");
    for class in classes {
        println!(" - {}", class?);
    }

    Ok(())
}

fn query_students_in_class(conn: &Connection) -> Result<()> {
    let class_name = get_input("Enter class name to list students: ");

    let mut stmt = conn.prepare(
        "SELECT Student.name
         FROM Student
         JOIN Class ON Student.class_name = Class.class_name
         WHERE Class.class_name = ?1",
    )?;

    let students = stmt.query_map(params![class_name], |row| row.get::<_, String>(0))?;

    println!("\nStudents in class:");
    for student in students {
        println!(" - {}", student?);
    }

    Ok(())
}

fn query_students_for_teacher(conn: &Connection) -> Result<()> {
    let teacher_name = get_input("Enter teacher's name to list their students: ");

    let mut stmt = conn.prepare(
        "SELECT Student.name
         FROM Student
         JOIN Class ON Student.class_name = Class.class_name
         JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
         WHERE Teacher.teacher_name = ?1",
    )?;

    let students = stmt.query_map(params![teacher_name], |row| row.get::<_, String>(0))?;

    println!("\nStudents for teacher '{}':", teacher_name);
    for student in students {
        println!(" - {}", student?);
    }

    Ok(())
}

fn query_students_in_class_with_teacher(conn: &Connection) -> Result<()> {
    let class_name = get_input("Enter class name to list students and teacher: ");

    let mut stmt = conn.prepare(
        "SELECT Student.name, Teacher.teacher_name
         FROM Student
         JOIN Class ON Student.class_name = Class.class_name
         JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
         WHERE Class.class_name = ?1",
    )?;

    let mut rows = stmt.query(params![class_name])?;

    let mut found = false;
    println!();
    while let Some(row) = rows.next()? {
        let student_name: String = row.get(0)?;
        let teacher_name: String = row.get(1)?;
        if !found {
            println!("Class: {}, Teacher: {}", class_name, teacher_name);
            println!("Students:");
            found = true;
        }
        println!(" - {}", student_name);
    }

    if !found {
        println!("No data found for class: {}", class_name);
    }

    Ok(())
}

fn main() -> Result<()> {
    let conn = Connection::open("school.db")?;
    create_tables(&conn)?;

    loop {
        println!("\nSchool Database Menu:");
        println!("1. Insert a Class");
        println!("2. Insert a Student");
        println!("3. Insert a Teacher");
        println!("4. All Students");
        println!("5. All Teachers");
        println!("6. All Classes");
        println!("7. Query Students in a Class");
        println!("8. Query Students for a Teacher");
        println!("9. Query Students in a Class with Teacher");
        println!("0. Exit");

        let choice = get_input("Enter your choice: ");

        match choice.as_str() {
            "1" => insert_class(&conn)?,
            "2" => insert_student(&conn)?,
            "3" => insert_teacher(&conn)?,
            "4" => query_all_students(&conn)?,
            "5" => query_all_teachers(&conn)?,
            "6" => query_all_classes(&conn)?,
            "7" => query_students_in_class(&conn)?,
            "8" => query_students_for_teacher(&conn)?,
            "9" => query_students_in_class_with_teacher(&conn)?,
            "0" => {
                println!("Exiting program.");
                break;
            }
            _ => println!("Invalid choice. Please try again."),
        }
    }

    Ok(())
}
