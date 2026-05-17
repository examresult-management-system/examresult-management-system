package com.exammanage.portal.auth;

import com.exammanage.portal.model.User;
import com.exammanage.portal.student.Student;
import com.exammanage.portal.student.StudentRepository;
import com.exammanage.portal.lecturer.Lecturer;
import com.exammanage.portal.lecturer.LecturerRepository;
import com.exammanage.portal.faculty.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            return ResponseEntity.badRequest().body(error("User not found"));
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body(error("Invalid password"));
        }

        return ResponseEntity.ok(success("Login successful", user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        User existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser != null) {
            return ResponseEntity.badRequest().body(error("Email already exists"));
        }

        if ("student".equalsIgnoreCase(request.getRole())) {
            if (request.getFaculty() == null || request.getFaculty().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(error("Faculty is required for students"));
            }

            if (!isValidFaculty(request.getFaculty())) {
                return ResponseEntity.badRequest().body(error("Invalid faculty selected"));
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        if ("student".equalsIgnoreCase(request.getRole())) {
            user.setFaculty(request.getFaculty());
        } else {
            user.setFaculty(null);
        }

        User savedUser = userRepository.save(user);

        if ("student".equalsIgnoreCase(savedUser.getRole())) {
            Student student = new Student();
            student.setStudentId("ST" + String.format("%04d", savedUser.getId()));
            student.setName(savedUser.getName());
            student.setEmail(savedUser.getEmail());
            student.setFaculty(savedUser.getFaculty());
            student.setCourse("Not assigned");
            student.setSemester("Semester 1");
            student.setStatus("Active");
            studentRepository.save(student);
        }

        if ("lecturer".equalsIgnoreCase(savedUser.getRole())) {
            Lecturer lecturer = new Lecturer();
            lecturer.setLecturerId("L" + String.format("%04d", savedUser.getId()));
            String[] parts = savedUser.getName() == null ? new String[]{"Lecturer"} : savedUser.getName().trim().split("\\s+", 2);
            lecturer.setFirstName(parts.length > 0 ? parts[0] : "Lecturer");
            lecturer.setLastName(parts.length > 1 ? parts[1] : "");
            lecturer.setEmail(savedUser.getEmail());
            lecturer.setFaculty(savedUser.getFaculty() == null ? "Computing Faculty" : savedUser.getFaculty());
            lecturer.setDepartment("Not assigned");
            lecturer.setSpecialization("Not assigned");
            lecturer.setStatus("Active");
            lecturerRepository.save(lecturer);
        }

        return ResponseEntity.ok(success("Registration successful", savedUser));
    }

    private boolean isValidFaculty(String faculty) {
        return facultyRepository.findAll().stream()
                .anyMatch(f -> f.getName() != null
                        && f.getName().equalsIgnoreCase(faculty)
                        && (f.getStatus() == null || "Active".equalsIgnoreCase(f.getStatus())));
    }

    private Map<String, Object> success(String message, User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("token", "dummy-jwt-token");
        response.put("user", user);
        return response;
    }

    private Map<String, String> error(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request
    ) {
        return userRepository.findById(id)
                .map(user -> {

                    if (request.getName() != null && !request.getName().trim().isEmpty()) {
                        user.setName(request.getName());
                    }

                    if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                        User existingUser = userRepository.findByEmail(request.getEmail());

                        if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                            return ResponseEntity.badRequest().body(error("Email already exists"));
                        }

                        user.setEmail(request.getEmail());
                    }

                    if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                        user.setPassword(request.getPassword());
                    }

                    User savedUser = userRepository.save(user);

                    return ResponseEntity.ok(success("Profile updated successfully", savedUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateRequest request) {

        User user = userRepository.findByEmail(request.getCurrentEmail());

        if (user == null) {
            return ResponseEntity.badRequest().body(error("User not found"));
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            User existingUser = userRepository.findByEmail(request.getEmail());

            if (existingUser != null && !existingUser.getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body(error("Email already exists"));
            }

            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(request.getPassword());
        }

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(success("Profile updated successfully", savedUser));
    }
}