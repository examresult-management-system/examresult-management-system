package com.exammanage.portal.student;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;

    private String firstName;

    private String lastName;

    private String name;

    private String email;

    private String phone;

    private String course;

    private String faculty;

    private String semester;

    private String status;

    public Student() {
    }

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getName() {
        if (name != null && !name.trim().isEmpty()) {
            return name;
        }
        String fullName = ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
        return fullName.isEmpty() ? null : fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCourse() {
        return course;
    }

    public String getFaculty() {
        return faculty;
    }

    public String getSemester() {
        return semester;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setName(String name) {
        this.name = name;
        if (name != null) {
            String[] parts = name.trim().split("\\s+", 2);
            this.firstName = parts.length > 0 ? parts[0] : null;
            this.lastName = parts.length > 1 ? parts[1] : "";
        }
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}


