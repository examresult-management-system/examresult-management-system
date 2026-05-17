package com.exammanage.portal.exam;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ExamCreateRequest {

    private String subject;
    private String moduleCode;
    private String lecturer;
    private String hall;
    private String faculty;
    private String examType;
    private String enrollmentKey;

    private LocalDate examDate;
    private LocalTime examTime;
    private Integer duration;

    private String pdfFileName;
    private String pdfBase64;

    private List<ExamQuestionRequest> questions;

    public String getSubject() { return subject; }
    public String getModuleCode() { return moduleCode; }
    public String getLecturer() { return lecturer; }
    public String getHall() { return hall; }
    public String getFaculty() { return faculty; }
    public String getExamType() { return examType; }
    public String getEnrollmentKey() { return enrollmentKey; }
    public LocalDate getExamDate() { return examDate; }
    public LocalTime getExamTime() { return examTime; }
    public Integer getDuration() { return duration; }
    public String getPdfFileName() { return pdfFileName; }
    public String getPdfBase64() { return pdfBase64; }
    public List<ExamQuestionRequest> getQuestions() { return questions; }

    public void setSubject(String subject) { this.subject = subject; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public void setLecturer(String lecturer) { this.lecturer = lecturer; }
    public void setHall(String hall) { this.hall = hall; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public void setExamType(String examType) { this.examType = examType; }
    public void setEnrollmentKey(String enrollmentKey) { this.enrollmentKey = enrollmentKey; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    public void setExamTime(LocalTime examTime) { this.examTime = examTime; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public void setPdfFileName(String pdfFileName) { this.pdfFileName = pdfFileName; }
    public void setPdfBase64(String pdfBase64) { this.pdfBase64 = pdfBase64; }
    public void setQuestions(List<ExamQuestionRequest> questions) { this.questions = questions; }
}