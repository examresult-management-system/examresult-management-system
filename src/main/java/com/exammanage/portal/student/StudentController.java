package com.exammanage.portal.student;

import com.exammanage.portal.auth.UserRepository;
import com.exammanage.portal.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<Student> getAllStudents() { return studentRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        if (student.getStudentId() == null || student.getStudentId().isBlank()) student.setStudentId("ST" + System.currentTimeMillis());
        if (student.getSemester() == null || student.getSemester().isBlank()) student.setSemester("Semester 1");
        if (student.getStatus() == null || student.getStatus().isBlank()) student.setStatus("Active");
        Student saved = studentRepository.save(student);
        upsertLoginUser(saved.getName(), saved.getEmail(), "student123", "STUDENT", saved.getFaculty());
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student updatedStudent) {
        return studentRepository.findById(id).map(student -> {
            String oldEmail = student.getEmail();
            if (updatedStudent.getStudentId() != null) student.setStudentId(updatedStudent.getStudentId());
            if (updatedStudent.getFirstName() != null) student.setFirstName(updatedStudent.getFirstName());
            if (updatedStudent.getLastName() != null) student.setLastName(updatedStudent.getLastName());
            if (updatedStudent.getName() != null) student.setName(updatedStudent.getName());
            if (updatedStudent.getEmail() != null) student.setEmail(updatedStudent.getEmail());
            if (updatedStudent.getPhone() != null) student.setPhone(updatedStudent.getPhone());
            if (updatedStudent.getCourse() != null) student.setCourse(updatedStudent.getCourse());
            if (updatedStudent.getFaculty() != null) student.setFaculty(updatedStudent.getFaculty());
            if (updatedStudent.getSemester() != null) student.setSemester(updatedStudent.getSemester());
            if (updatedStudent.getStatus() != null) student.setStatus(updatedStudent.getStatus());
            Student saved = studentRepository.save(student);
            syncLoginUser(oldEmail, saved.getName(), saved.getEmail(), "STUDENT", saved.getFaculty());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            deleteLoginUser(student.getEmail());
            studentRepository.delete(student);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void upsertLoginUser(String name, String email, String password, String role, String faculty) {
        if (email == null || email.isBlank()) return;
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setPassword(password);
        }
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setFaculty(faculty);
        userRepository.save(user);
    }

    private void syncLoginUser(String oldEmail, String name, String email, String role, String faculty) {
        User user = oldEmail == null ? null : userRepository.findByEmail(oldEmail);
        if (user == null && email != null) user = userRepository.findByEmail(email);
        if (user == null) {
            upsertLoginUser(name, email, role.equals("STUDENT") ? "student123" : "lecturer123", role, faculty);
            return;
        }
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setFaculty(faculty);
        userRepository.save(user);
    }

    private void deleteLoginUser(String email) {
        if (email == null) return;
        User user = userRepository.findByEmail(email);
        if (user != null && "STUDENT".equalsIgnoreCase(user.getRole())) userRepository.delete(user);
    }
}

