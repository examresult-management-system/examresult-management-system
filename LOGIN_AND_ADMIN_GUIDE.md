# Final Login Details

Use these accounts after restarting the application:

| Role | Email | Password |
|---|---|---|
| Admin | admin@exam.com | admin123 |
| Lecturer | lecturer@exam.com | lecturer123 |
| Student | student@exam.com | student123 |

# Important database note

`exam.seed.clean-users-on-start=true` is enabled in `src/main/resources/application.properties`.

This removes old/random demo users from the database on startup and creates only the three users above.

After the first successful run, set it to:

```properties
exam.seed.clean-users-on-start=false
```

Do this only if you want newly added students/lecturers to stay after application restarts.

# Admin permissions

Admin can manage:
- Students
- Lecturers
- Courses
- Faculties
- Modules
- Exams
- Results
- Timetables
- Announcements
- Users

Deleting a student from the Students page also deletes that student's login account.
Deleting a lecturer from the Lecturers page also deletes that lecturer's login account.

# Lecturer permissions

Lecturer can edit PDF exam results only.
Poll exam results are auto-marked and should not be manually edited by lecturer.
