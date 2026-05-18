package com.exammanage.portal.result;

import jakarta.persistence.*;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;

    private String studentName;

    private String moduleCode;

    private String moduleName;

    private Double marks;

    private String grade;

    private String status;

    private String semester;

    @Transient
    private String sourceType;

    @Transient
    private Long sourceId;

    @Transient
    private Long examId;

    @Transient
    private String examTitle;

    @Transient
    private String examType;

    public Result() {
    }

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getModuleCode() {
        return moduleCode;
    }

    public String getModuleName() {
        return moduleName;
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

    public String getSemester() {
        return semester;
    }

    public String getSourceType() { return sourceType; }
    public Long getSourceId() { return sourceId; }
    public Long getExamId() { return examId; }
    public String getExamTitle() { return examTitle; }
    public String getExamType() { return examType; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setModuleCode(String moduleCode) {
        this.moduleCode = moduleCode;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
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

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public void setExamId(Long examId) { this.examId = examId; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
    public void setExamType(String examType) { this.examType = examType; }
}