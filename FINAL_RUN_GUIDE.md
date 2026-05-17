# Final ExamPortal Run Guide

## Login accounts
- Admin: admin@exam.com / admin123
- Lecturer: lecturer@exam.com / lecturer123
- Student: student@exam.com / student123

Additional sample accounts:
- Lecturer: mary.lecturer@exam.com / lecturer123
- Lecturer: nimal.lecturer@exam.com / lecturer123
- Student: kasun.student@exam.com / student123
- Student: ayesha.student@exam.com / student123

## Important first run step
Delete the old H2 database folder before running this version, because the old broken schema can remain in `data/`.

Windows: delete the `data` folder inside the project.
Mac/Linux:
```bash
rm -rf data
```

Then run:
```bash
./mvnw spring-boot:run
```

Open:
```text
http://localhost:8080/login.html
```

## Fixed academic connection
- Faculties seed first.
- Courses are assigned to faculties.
- Modules are assigned to courses and lecturers.
- Students are assigned to faculties and courses.
- Timetables are assigned to selected student/lecturer email.
- Exams are assigned to module codes, faculties, and lecturers.
- Poll exams auto-mark results.
- PDF exams stay pending until lecturer review.
