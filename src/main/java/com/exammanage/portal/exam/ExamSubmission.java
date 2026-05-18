package main.java.com.exammanage.portal.exam;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_submissions")
public class ExamSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;

    private String studentName;

    private String studentId;

    private String moduleCode;

    private String examTitle;

    private Double marks;

    private String grade;

    private String status;

    @Lob
    @Column
    private String answerSummary;

    private LocalDateTime submittedAt = LocalDateTime.now();

    public ExamSubmission() {}

    public Long getId() {
        return id;
    }

    public Long getExamId() {
        return examId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getModuleCode() {
        return moduleCode;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public Double getMarks() {
        return marks;
    }

    public String getGrade() {
        return grade;
    }

    public String getStatus() {
        return status;
    }

    public String getAnswerSummary() {
        return answerSummary;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setModuleCode(String moduleCode) {
        this.moduleCode = moduleCode;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public void setAnswerSummary(String answerSummary) {
        this.answerSummary = answerSummary;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}