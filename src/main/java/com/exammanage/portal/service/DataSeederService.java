package com.exammanage.portal.service;

import com.exammanage.portal.announcement.*;
import com.exammanage.portal.auth.*;
import com.exammanage.portal.course.*;
import com.exammanage.portal.exam.*;
import com.exammanage.portal.faculty.*;
import com.exammanage.portal.lecturer.*;
import com.exammanage.portal.module.Module;
import com.exammanage.portal.module.ModuleRepository;
import com.exammanage.portal.model.User;
import com.exammanage.portal.result.ResultRepository;
import com.exammanage.portal.student.*;
import com.exammanage.portal.timetable.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataSeederService {
    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private ModuleRepository moduleRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private ExamSubmissionRepository examSubmissionRepository;

    @Value("${exam.seed.clean-users-on-start:true}")
    private boolean cleanUsersOnStart;

    @PostConstruct
    public void seedData() {
        if (cleanUsersOnStart) {
            timetableRepository.deleteAll();
            resultRepository.deleteAll();
            examSubmissionRepository.deleteAll();
            examRepository.deleteAll();
            moduleRepository.deleteAll();
            courseRepository.deleteAll();
            facultyRepository.deleteAll();
            lecturerRepository.deleteAll();
            studentRepository.deleteAll();
            userRepository.deleteAll();
            announcementRepository.deleteAll();
        }
        seedUsersAndPeople();
        seedAcademicStructure();
        seedExamsAndAnnouncements();
        seedTimetables();
    }

    private void seedUsersAndPeople() {
        ensureUser("System Admin", "admin@exam.com", "admin123", "ADMIN", "All Faculties");
        ensureUser("John Lecturer", "lecturer@exam.com", "lecturer123", "LECTURER", "Faculty of Computing");
        ensureUser("Demo Student", "student@exam.com", "student123", "STUDENT", "Faculty of Computing");

        lecturer("L001", "John Lecturer", "lecturer@exam.com", "0771234567", "Computing", "Faculty of Computing", "Software Engineering");
        lecturer("L002", "Mary Perera", "mary.lecturer@exam.com", "0772222222", "Information Systems", "Faculty of Computing", "Database Systems");
        lecturer("L003", "Nimal Silva", "nimal.lecturer@exam.com", "0773333333", "Business", "Faculty of Management", "Business Statistics");

        student("ST001", "Demo Student", "student@exam.com", "0771111111", "BSc Computer Science", "Faculty of Computing", "Semester 1");
        student("ST002", "Kasun Fernando", "kasun.student@exam.com", "0774444444", "BSc Computer Science", "Faculty of Computing", "Semester 1");
        student("ST003", "Ayesha Silva", "ayesha.student@exam.com", "0775555555", "BSc Business Management", "Faculty of Management", "Semester 1");
    }

    private void seedAcademicStructure() {
        faculty("FOC", "Faculty of Computing", "System Admin", "computing@exam.com", "Active", "Computing and IT degree programmes");
        faculty("FOM", "Faculty of Management", "System Admin", "management@exam.com", "Active", "Business and management degree programmes");

        course("CS101", "BSc Computer Science", "Faculty of Computing", 120, "4 Years", "Active", "Computer Science degree programme");
        course("SE101", "BSc Software Engineering", "Faculty of Computing", 120, "4 Years", "Active", "Software Engineering degree programme");
        course("BM101", "BSc Business Management", "Faculty of Management", 120, "4 Years", "Active", "Business Management degree programme");

        module("CSM101", "Programming Fundamentals", "BSc Computer Science", 4, "John Lecturer", "Semester 1", "Active", "Basic programming concepts");
        module("CSM102", "Database Systems", "BSc Computer Science", 4, "Mary Perera", "Semester 1", "Active", "Relational database design and SQL");
        module("SEM101", "Software Engineering", "BSc Software Engineering", 3, "John Lecturer", "Semester 1", "Active", "Software process and requirements");
        module("BMM101", "Business Statistics", "BSc Business Management", 3, "Nimal Silva", "Semester 1", "Active", "Statistics for business decisions");
    }

    private void seedExamsAndAnnouncements() {
        if (examRepository.count() == 0) {
            Exam poll = new Exam();
            poll.setSubject("Programming Fundamentals Poll Exam");
            poll.setModuleCode("CSM101");
            poll.setLecturer("John Lecturer");
            poll.setHall("Online");
            poll.setFaculty("Faculty of Computing");
            poll.setExamDate(LocalDate.now().plusDays(7));
            poll.setExamTime(LocalTime.of(9, 0));
            poll.setDuration(1);
            poll.setStatus("Scheduled");
            poll.setExamType("POLL");
            poll.setEnrollmentKey("CSM101KEY");
            List<ExamQuestion> qs = new ArrayList<>();
            ExamQuestion q1 = question(poll, "Which keyword is used to create a class in Java?", "class", "function", "table", "module", "A");
            ExamQuestion q2 = question(poll, "Which SQL command is used to read data?", "INSERT", "UPDATE", "SELECT", "DELETE", "C");
            qs.add(q1); qs.add(q2); poll.setQuestions(qs); examRepository.save(poll);

            Exam pdf = new Exam();
            pdf.setSubject("Database Systems PDF Assignment");
            pdf.setModuleCode("CSM102");
            pdf.setLecturer("Mary Perera");
            pdf.setHall("Online Upload");
            pdf.setFaculty("Faculty of Computing");
            pdf.setExamDate(LocalDate.now().plusDays(12));
            pdf.setExamTime(LocalTime.of(13, 0));
            pdf.setDuration(2);
            pdf.setStatus("Scheduled");
            pdf.setExamType("PDF");
            pdf.setEnrollmentKey("CSM102PDF");
            examRepository.save(pdf);
        }
        if (announcementRepository.count() == 0) {
            Announcement a = new Announcement();
            a.setTitle("Welcome to ExamPortal");
            a.setContent("Faculties, courses, modules, exams, timetables, students, lecturers, and results are connected.");
            a.setAuthor("System Admin");
            a.setPriority("High");
            announcementRepository.save(a);
        }
    }

    private void seedTimetables() {
        if (timetableRepository.count() > 0) return;
        timetable("STUDENT", "student@exam.com", "Monday", "09:00", "11:00", "CSM101", "Programming Fundamentals", "Lab 01", "John Lecturer", "Semester 1");
        timetable("STUDENT", "kasun.student@exam.com", "Wednesday", "10:00", "12:00", "CSM102", "Database Systems", "Lab 02", "Mary Perera", "Semester 1");
        timetable("STUDENT", "ayesha.student@exam.com", "Tuesday", "13:00", "15:00", "BMM101", "Business Statistics", "Hall B", "Nimal Silva", "Semester 1");
        timetable("LECTURER", "lecturer@exam.com", "Monday", "09:00", "11:00", "CSM101", "Programming Fundamentals", "Lab 01", "John Lecturer", "Semester 1");
        timetable("LECTURER", "mary.lecturer@exam.com", "Wednesday", "10:00", "12:00", "CSM102", "Database Systems", "Lab 02", "Mary Perera", "Semester 1");
    }

    private ExamQuestion question(Exam exam, String text, String a, String b, String c, String d, String correct) {
        ExamQuestion q = new ExamQuestion(); q.setExam(exam); q.setQuestionText(text); q.setOptionA(a); q.setOptionB(b); q.setOptionC(c); q.setOptionD(d); q.setCorrectAnswer(correct); return q;
    }
    private void faculty(String code,String name,String dean,String email,String status,String desc){ Faculty f=new Faculty(); f.setCode(code); f.setName(name); f.setDean(dean); f.setContactEmail(email); f.setStatus(status); f.setDescription(desc); facultyRepository.save(f); }
    private void course(String code,String name,String faculty,Integer credits,String duration,String status,String desc){ Course c=new Course(); c.setCode(code); c.setName(name); c.setFaculty(faculty); c.setCredits(credits); c.setDuration(duration); c.setStatus(status); c.setDescription(desc); courseRepository.save(c); }
    private void module(String code,String name,String course,Integer credits,String lecturer,String semester,String status,String desc){ Module m=new Module(); m.setModuleCode(code); m.setModuleName(name); m.setCourse(course); m.setCredits(credits); m.setLecturer(lecturer); m.setSemester(semester); m.setStatus(status); m.setDescription(desc); moduleRepository.save(m); }
    private void student(String id,String name,String email,String phone,String course,String faculty,String semester){ Student s=new Student(); s.setStudentId(id); s.setName(name); s.setEmail(email); s.setPhone(phone); s.setCourse(course); s.setFaculty(faculty); s.setSemester(semester); s.setStatus("Active"); studentRepository.save(s); ensureUser(name,email,"student123","STUDENT",faculty); }
    private void lecturer(String id,String name,String email,String phone,String dept,String faculty,String spec){ Lecturer l=new Lecturer(); l.setLecturerId(id); l.setName(name); l.setEmail(email); l.setPhone(phone); l.setDepartment(dept); l.setFaculty(faculty); l.setSpecialization(spec); l.setStatus("Active"); lecturerRepository.save(l); ensureUser(name,email,"lecturer123","LECTURER",faculty); }
    private void timetable(String role,String email,String day,String start,String end,String code,String module,String hall,String lecturer,String semester){ Timetable t=new Timetable(); t.setDay(day); t.setStartTime(start); t.setEndTime(end); t.setModuleCode(code); t.setModuleName(module); t.setHall(hall); t.setLecturer(lecturer); t.setSemester(semester); t.setTargetRole(role); t.setTargetEmail(email); timetableRepository.save(t); }
    private void ensureUser(String name,String email,String password,String role,String faculty){ User u=userRepository.findByEmail(email); if(u==null)u=new User(); u.setName(name); u.setEmail(email); u.setPassword(password); u.setRole(role); u.setFaculty(faculty); userRepository.save(u); }

}
