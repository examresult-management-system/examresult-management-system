package main.java.com.exammanage.portal.exam;
import java.util.Map;

public class PollSubmitRequest {

    private String studentName;
    private String studentId;
    private String enrollmentKey;
    private Map<Long, String> answers;

    public String getStudentName() {
        return studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getEnrollmentKey() {
        return enrollmentKey;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setEnrollmentKey(String enrollmentKey) {
        this.enrollmentKey = enrollmentKey;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}