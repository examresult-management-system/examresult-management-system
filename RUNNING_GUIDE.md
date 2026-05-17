# Exam Management System - Running Guide

## Requirements
- Java 17 or newer
- Internet connection for the first Maven run, so Maven can download dependencies

## Easy run - no MySQL needed
This version uses an embedded persistent H2 database by default.

```bash
./mvnw spring-boot:run
```

Open:

```text
http://localhost:8080
```

H2 database console:

```text
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:file:./data/exam_portal
User: sa
Password: leave empty
```

## MySQL run
Create or start MySQL on port 3306, then run:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

MySQL settings are in:

```text
src/main/resources/application-mysql.properties
```

Default MySQL config:

```text
Database: exam_portal
Port: 3306
Username: root
Password: root1234
```

## Seed logins

```text
Admin:    admin@university.com / admin123
Lecturer: lecturer@university.com / lecturer123
Student:  student@university.com / student123
```

## Pages
- Login: http://localhost:8080/login.html
- Admin dashboard: http://localhost:8080/admin-dashboard.html
- Lecturer dashboard: http://localhost:8080/lecturer-dashboard.html
- Student dashboard: http://localhost:8080/student-dashboard.html

## Main fixes in this package
- Maven wrapper URL fixed.
- Java version set to 17 for easier compatibility.
- Default embedded database added so the app runs without manual DB setup.
- MySQL profile added for real MySQL connection.
- Frontend API URLs changed to relative backend URLs.
- Create exam, profile update, exam attempt, poll/PDF submit, results, users, students, lecturers, courses, modules, faculties, timetables, and announcements are wired to backend endpoints.
- Registration now also creates student/lecturer records for matching roles.
- Seed poll exam now has questions.

## Latest update

Added requested permissions and features:

1. Lecturer Results Editing
   - Lecturer can open Results page and edit marks/grade/status for submitted PDF exams and poll submissions.
   - PDF exams are first saved as a submitted record with 0 marks / pending grade; lecturer can update the marks later.
   - Marks auto-suggest grade and pass/fail status in the UI.

2. Admin Full Management
   - Admin menu includes Students, Lecturers, Courses, Faculties, Modules, Exams, Create Exam, Results, Timetables, Announcements, and Users.
   - Admin can edit/delete results including exam submissions.
   - Admin can edit/delete exams from the Exams page and create exams from Create Exam.

Note: If you run with MySQL and old tables already exist, restart once after deleting the old database or use a fresh database name in `application-mysql.properties` if schema mismatch errors appear.
