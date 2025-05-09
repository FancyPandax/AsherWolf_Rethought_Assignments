// assignment2.ts

import * as readlineSync from "readline-sync";
const Database = require("better-sqlite3");
const db = new Database("school.db");

type Student = { name: string };
type Teacher = { teacher_name: string };
type Class = { class_name: string };
type StudentWithTeacher = { name: string; teacher_name: string };

function createTables(): void {
	db.prepare(`
		CREATE TABLE IF NOT EXISTS Student (
			student_id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			class_name TEXT
		)
	`).run();

	db.prepare(`
		CREATE TABLE IF NOT EXISTS Teacher (
			teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
			teacher_name TEXT
		)
	`).run();

	db.prepare(`
		CREATE TABLE IF NOT EXISTS Class (
			class_id INTEGER PRIMARY KEY AUTOINCREMENT,
			class_name TEXT,
			teacher_id INTEGER,
			FOREIGN KEY (teacher_id) REFERENCES Teacher (teacher_id)
		)
	`).run();
}

function insertClass(): void {
	const className = readlineSync.question("Enter class name: ");
	const teacherName = readlineSync.question("Enter teacher's name: ");

	const insertTeacher = db.prepare("INSERT INTO Teacher (teacher_name) VALUES (?)");
	const result = insertTeacher.run(teacherName);
	const teacherId = result.lastInsertRowid;

	const insertClass = db.prepare("INSERT INTO Class (class_name, teacher_id) VALUES (?, ?)");
	insertClass.run(className, teacherId);

	console.log(`Class '${className}' with teacher '${teacherName}' inserted.`);
}

function insertStudent(): void {
	const studentName = readlineSync.question("Enter student name: ");
	const className = readlineSync.question("Enter class name for the student: ");

	db.prepare("INSERT INTO Student (name, class_name) VALUES (?, ?)").run(studentName, className);
	console.log(`Student '${studentName}' inserted into class '${className}'.`);
}

function insertTeacher(): void {
	const teacherName = readlineSync.question("Enter teacher's name: ");
	db.prepare("INSERT INTO Teacher (teacher_name) VALUES (?)").run(teacherName);
	console.log(`Teacher '${teacherName}' inserted.`);
}

function queryAllStudents(): void {
	const students: Student[] = db.prepare("SELECT name FROM Student").all();
	console.log("\nAll students:");
	students.forEach(s => console.log(` - ${s.name}`));
}

function queryAllTeachers(): void {
	const teachers: Teacher[] = db.prepare("SELECT teacher_name FROM Teacher").all();
	console.log("\nAll teachers:");
	teachers.forEach(t => console.log(` - ${t.teacher_name}`));
}

function queryAllClasses(): void {
	const classes: Class[] = db.prepare("SELECT class_name FROM Class").all();
	console.log("\nAll classes:");
	classes.forEach(c => console.log(` - ${c.class_name}`));
}

function queryStudentsInClass(): void {
	const className = readlineSync.question("Enter class name to list students: ");
	const students: Student[] = db.prepare(`
		SELECT Student.name
		FROM Student
		JOIN Class ON Student.class_name = Class.class_name
		WHERE Class.class_name = ?
	`).all(className);

	console.log(`\nStudents in class '${className}':`);
	students.forEach(s => console.log(` - ${s.name}`));
}

function queryStudentsForTeacher(): void {
	const teacherName = readlineSync.question("Enter teacher's name to list their students: ");
	const students: Student[] = db.prepare(`
		SELECT Student.name
		FROM Student
		JOIN Class ON Student.class_name = Class.class_name
		JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
		WHERE Teacher.teacher_name = ?
	`).all(teacherName);

	console.log(`\nStudents for teacher '${teacherName}':`);
	students.forEach(s => console.log(` - ${s.name}`));
}

function queryStudentsInClassWithTeacher(): void {
	const className = readlineSync.question("Enter class name to list students and teacher: ");
	const results: StudentWithTeacher[] = db.prepare(`
		SELECT Student.name, Teacher.teacher_name
		FROM Student
		JOIN Class ON Student.class_name = Class.class_name
		JOIN Teacher ON Class.teacher_id = Teacher.teacher_id
		WHERE Class.class_name = ?
	`).all(className);

	if (results.length > 0) {
		const teacher = results[0].teacher_name;
		console.log(`\nClass: ${className}, Teacher: ${teacher}`);
		console.log("Students:");
		results.forEach(r => console.log(` - ${r.name}`));
	} else {
		console.log(`\nNo data found for class: ${className}`);
	}
}

function main(): void {
	createTables();

	while (true) {
		console.log("\nSchool Database Menu:");
		console.log("1. Insert a Class");
		console.log("2. Insert a Student");
		console.log("3. Insert a Teacher");
		console.log("4. All Students");
		console.log("5. All Teachers");
		console.log("6. All Classes");
		console.log("7. Query Students in a Class");
		console.log("8. Query Students for a Teacher");
		console.log("9. Query Students in a Class with Teacher");
		console.log("0. Exit");

		const choice = readlineSync.question("Enter your choice: ");

		switch (choice) {
			case "1":
				insertClass();
				break;
			case "2":
				insertStudent();
				break;
			case "3":
				insertTeacher();
				break;
			case "4":
				queryAllStudents();
				break;
			case "5":
				queryAllTeachers();
				break;
			case "6":
				queryAllClasses();
				break;
			case "7":
				queryStudentsInClass();
				break;
			case "8":
				queryStudentsForTeacher();
				break;
			case "9":
				queryStudentsInClassWithTeacher();
				break;
			case "0":
				console.log("Exiting program.");
				process.exit(0);
			default:
				console.log("Invalid choice. Please try again.");
		}
	}
}

main();
