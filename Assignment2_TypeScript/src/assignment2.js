"use strict";
// assignment2.ts
Object.defineProperty(exports, "__esModule", { value: true });
var readlineSync = require("readline-sync");
var Database = require("better-sqlite3");
var db = new Database("school.db");
function createTables() {
    db.prepare("\n\t\tCREATE TABLE IF NOT EXISTS Student (\n\t\t\tstudent_id INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\t\tname TEXT,\n\t\t\tclass_name TEXT\n\t\t)\n\t").run();
    db.prepare("\n\t\tCREATE TABLE IF NOT EXISTS Teacher (\n\t\t\tteacher_id INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\t\tteacher_name TEXT\n\t\t)\n\t").run();
    db.prepare("\n\t\tCREATE TABLE IF NOT EXISTS Class (\n\t\t\tclass_id INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\t\tclass_name TEXT,\n\t\t\tteacher_id INTEGER,\n\t\t\tFOREIGN KEY (teacher_id) REFERENCES Teacher (teacher_id)\n\t\t)\n\t").run();
}
function insertClass() {
    var className = readlineSync.question("Enter class name: ");
    var teacherName = readlineSync.question("Enter teacher's name: ");
    var insertTeacher = db.prepare("INSERT INTO Teacher (teacher_name) VALUES (?)");
    var result = insertTeacher.run(teacherName);
    var teacherId = result.lastInsertRowid;
    var insertClass = db.prepare("INSERT INTO Class (class_name, teacher_id) VALUES (?, ?)");
    insertClass.run(className, teacherId);
    console.log("Class '".concat(className, "' with teacher '").concat(teacherName, "' inserted."));
}
function insertStudent() {
    var studentName = readlineSync.question("Enter student name: ");
    var className = readlineSync.question("Enter class name for the student: ");
    db.prepare("INSERT INTO Student (name, class_name) VALUES (?, ?)").run(studentName, className);
    console.log("Student '".concat(studentName, "' inserted into class '").concat(className, "'."));
}
function insertTeacher() {
    var teacherName = readlineSync.question("Enter teacher's name: ");
    db.prepare("INSERT INTO Teacher (teacher_name) VALUES (?)").run(teacherName);
    console.log("Teacher '".concat(teacherName, "' inserted."));
}
function queryAllStudents() {
    var students = db.prepare("SELECT name FROM Student").all();
    console.log("\nAll students:");
    students.forEach(function (s) { return console.log(" - ".concat(s.name)); });
}
function queryAllTeachers() {
    var teachers = db.prepare("SELECT teacher_name FROM Teacher").all();
    console.log("\nAll teachers:");
    teachers.forEach(function (t) { return console.log(" - ".concat(t.teacher_name)); });
}
function queryAllClasses() {
    var classes = db.prepare("SELECT class_name FROM Class").all();
    console.log("\nAll classes:");
    classes.forEach(function (c) { return console.log(" - ".concat(c.class_name)); });
}
function queryStudentsInClass() {
    var className = readlineSync.question("Enter class name to list students: ");
    var students = db.prepare("\n\t\tSELECT Student.name\n\t\tFROM Student\n\t\tJOIN Class ON Student.class_name = Class.class_name\n\t\tWHERE Class.class_name = ?\n\t").all(className);
    console.log("\nStudents in class '".concat(className, "':"));
    students.forEach(function (s) { return console.log(" - ".concat(s.name)); });
}
function queryStudentsForTeacher() {
    var teacherName = readlineSync.question("Enter teacher's name to list their students: ");
    var students = db.prepare("\n\t\tSELECT Student.name\n\t\tFROM Student\n\t\tJOIN Class ON Student.class_name = Class.class_name\n\t\tJOIN Teacher ON Class.teacher_id = Teacher.teacher_id\n\t\tWHERE Teacher.teacher_name = ?\n\t").all(teacherName);
    console.log("\nStudents for teacher '".concat(teacherName, "':"));
    students.forEach(function (s) { return console.log(" - ".concat(s.name)); });
}
function queryStudentsInClassWithTeacher() {
    var className = readlineSync.question("Enter class name to list students and teacher: ");
    var results = db.prepare("\n\t\tSELECT Student.name, Teacher.teacher_name\n\t\tFROM Student\n\t\tJOIN Class ON Student.class_name = Class.class_name\n\t\tJOIN Teacher ON Class.teacher_id = Teacher.teacher_id\n\t\tWHERE Class.class_name = ?\n\t").all(className);
    if (results.length > 0) {
        var teacher = results[0].teacher_name;
        console.log("\nClass: ".concat(className, ", Teacher: ").concat(teacher));
        console.log("Students:");
        results.forEach(function (r) { return console.log(" - ".concat(r.name)); });
    }
    else {
        console.log("\nNo data found for class: ".concat(className));
    }
}
function main() {
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
        var choice = readlineSync.question("Enter your choice: ");
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
