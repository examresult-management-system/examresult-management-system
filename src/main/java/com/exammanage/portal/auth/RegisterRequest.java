package main.java.com.exammanage.portal.auth;


public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String role;
    private String faculty;

    public RegisterRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }
}