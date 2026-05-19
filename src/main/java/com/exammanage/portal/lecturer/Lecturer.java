package com.exammanage.portal.lecturer;


<<<<<<< Updated upstream
.
=======
@Entity
@Table(name = "lecturers")
public class Lecturer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String lecturerId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String department;

    private String faculty;

    private String specialization;

    private String status;

    public Lecturer() {
    }

    public Long getId() {
        return id;
    }

    public String getLecturerId() {
        return lecturerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }


    public String getName() {
        String fullName = ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
        return fullName.isEmpty() ? null : fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getDepartment() {
        return department;
    }

    public String getFaculty() {
        return faculty;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLecturerId(String lecturerId) {
        this.lecturerId = lecturerId;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }


    public void setName(String name) {
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

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
>>>>>>> Stashed changes
