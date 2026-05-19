package main.java.com.exammanage.portal.exam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamSubmissionRepository examSubmissionRepository;

    @GetMapping
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @GetMapping("/faculty/{faculty}")
    public List<Exam> getExamsByFaculty(@PathVariable String faculty) {
        return examRepository.findByFacultyIgnoreCase(faculty);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create-new")
    public ResponseEntity<?> createAdvancedExam(@RequestBody ExamCreateRequest request) {

        if (request.getFaculty() == null || request.getFaculty().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(error("Faculty is required"));
        }

        if (request.getExamType() == null || request.getExamType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(error("Exam type is required"));
        }

        if (request.getEnrollmentKey() == null || request.getEnrollmentKey().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(error("Enrollment key is required"));
        }

        if (request.getExamDate() == null) {
            return ResponseEntity.badRequest().body(error("Exam date is required"));
        }

        if (request.getExamTime() == null) {
            return ResponseEntity.badRequest().body(error("Exam time is required"));
        }

        String examType = request.getExamType().toUpperCase();

        if (!examType.equals("PDF") && !examType.equals("POLL")) {
            return ResponseEntity.badRequest().body(error("Exam type must be PDF or POLL"));
        }

        if (examType.equals("PDF")) {
            if (request.getPdfBase64() == null || request.getPdfBase64().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(error("PDF file is required"));
            }
        }

        if (examType.equals("POLL")) {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                return ResponseEntity.badRequest().body(error("Poll questions are required"));
            }
        }

        Exam exam = new Exam();

        exam.setSubject(request.getSubject());
        exam.setModuleCode(request.getModuleCode());
        exam.setLecturer(request.getLecturer());
        exam.setHall(request.getHall());
        exam.setFaculty(request.getFaculty());
        exam.setExamType(examType);
        exam.setEnrollmentKey(request.getEnrollmentKey());

        exam.setExamDate(request.getExamDate());
        exam.setExamTime(request.getExamTime());
        exam.setDuration(request.getDuration() == null ? 1 : request.getDuration());

        exam.setPdfFileName(request.getPdfFileName());
        exam.setPdfBase64(request.getPdfBase64());
        exam.setStatus("Scheduled");

        if (examType.equals("POLL")) {
            List<ExamQuestion> questionList = new ArrayList<>();

            for (ExamQuestionRequest q : request.getQuestions()) {
                ExamQuestion question = new ExamQuestion();

                question.setQuestionText(q.getQuestionText());
                question.setOptionA(q.getOptionA());
                question.setOptionB(q.getOptionB());
                question.setOptionC(q.getOptionC());
                question.setOptionD(q.getOptionD());
                question.setCorrectAnswer(q.getCorrectAnswer());
                question.setExam(exam);

                questionList.add(question);
            }

            exam.setQuestions(questionList);
        }

        Exam savedExam = examRepository.save(exam);

        return ResponseEntity.ok(savedExam);
    }

    @GetMapping("/{id}/attempt")
    public ResponseEntity<?> getExamForAttempt(
            @PathVariable Long id,
            @RequestParam String enrollmentKey,
            @RequestParam(required = false) String studentId
    ) {
        Optional<Exam> optionalExam = examRepository.findById(id);

        if (optionalExam.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Exam exam = optionalExam.get();

        if (studentId != null && !studentId.trim().isEmpty()) {
            Optional<ExamSubmission> existingSubmission =
                    examSubmissionRepository.findByExamIdAndStudentId(exam.getId(), studentId);

            if (existingSubmission.isPresent()) {
                return ResponseEntity.badRequest().body(error("You have already attempted this exam"));
            }
        }

        if (!exam.getEnrollmentKey().equals(enrollmentKey)) {
            return ResponseEntity.badRequest().body(error("Invalid enrollment key"));
        }

        LocalDateTime examStart = LocalDateTime.of(exam.getExamDate(), exam.getExamTime());
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(examStart)) {
            return ResponseEntity.badRequest().body(error("Exam has not started yet"));
        }

        Map<String, Object> response = new HashMap<>();

        response.put("id", exam.getId());
        response.put("subject", exam.getSubject());
        response.put("moduleCode", exam.getModuleCode());
        response.put("faculty", exam.getFaculty());
        response.put("examType", exam.getExamType());
        response.put("examDate", exam.getExamDate());
        response.put("examTime", exam.getExamTime());
        response.put("duration", exam.getDuration());
        response.put("pdfFileName", exam.getPdfFileName());
        response.put("pdfBase64", exam.getPdfBase64());

        List<Map<String, Object>> questions = new ArrayList<>();

        for (ExamQuestion q : exam.getQuestions()) {
            Map<String, Object> questionMap = new HashMap<>();

            questionMap.put("id", q.getId());
            questionMap.put("questionText", q.getQuestionText());
            questionMap.put("optionA", q.getOptionA());
            questionMap.put("optionB", q.getOptionB());
            questionMap.put("optionC", q.getOptionC());
            questionMap.put("optionD", q.getOptionD());

            questions.add(questionMap);
        }

        response.put("questions", questions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/submission-status")
    public ResponseEntity<?> getSubmissionStatus(
            @PathVariable Long id,
            @RequestParam String studentId
    ) {
        Optional<ExamSubmission> submission =
                examSubmissionRepository.findByExamIdAndStudentId(id, studentId);

        Map<String, Object> response = new HashMap<>();
        response.put("submitted", submission.isPresent());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit-poll")
    public ResponseEntity<?> submitPoll(
            @PathVariable Long id,
            @RequestBody PollSubmitRequest request
    ) {
        Optional<Exam> optionalExam = examRepository.findById(id);

        if (optionalExam.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Exam exam = optionalExam.get();

        if (!"POLL".equalsIgnoreCase(exam.getExamType())) {
            return ResponseEntity.badRequest().body(error("This exam is not a poll exam"));
        }

        if (!exam.getEnrollmentKey().equals(request.getEnrollmentKey())) {
            return ResponseEntity.badRequest().body(error("Invalid enrollment key"));
        }

        Optional<ExamSubmission> existingSubmission =
                examSubmissionRepository.findByExamIdAndStudentId(exam.getId(), request.getStudentId());

        if (existingSubmission.isPresent()) {
            return ResponseEntity.badRequest().body(error("You have already attempted this exam"));
        }

        int totalQuestions = exam.getQuestions().size();
        int correctCount = 0;

        StringBuilder answerSummary = new StringBuilder();

        for (ExamQuestion question : exam.getQuestions()) {
            String studentAnswer = null;

            if (request.getAnswers() != null) {
                studentAnswer = request.getAnswers().get(question.getId());
            }

            if (studentAnswer != null &&
                    studentAnswer.equalsIgnoreCase(question.getCorrectAnswer())) {
                correctCount++;
            }

            answerSummary.append("Question ID: ")
                    .append(question.getId())
                    .append(", Student Answer: ")
                    .append(studentAnswer)
                    .append(", Correct Answer: ")
                    .append(question.getCorrectAnswer())
                    .append("\n");
        }

        double marks = 0.0;

        if (totalQuestions > 0) {
            marks = ((double) correctCount / totalQuestions) * 100.0;
        }

        ExamSubmission submission = new ExamSubmission();

        submission.setExamId(exam.getId());
        submission.setStudentName(request.getStudentName());
        submission.setStudentId(request.getStudentId());
        submission.setModuleCode(exam.getModuleCode());
        submission.setExamTitle(exam.getSubject());
        submission.setMarks(marks);
        submission.setGrade(calculateGrade(marks));
        submission.setStatus(marks >= 40 ? "Pass" : "Fail");
        submission.setAnswerSummary(answerSummary.toString());

        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Exam submitted successfully");
        response.put("submission", savedSubmission);
        response.put("correctAnswers", correctCount);
        response.put("totalQuestions", totalQuestions);
        response.put("marks", marks);
        response.put("grade", calculateGrade(marks));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit-pdf")
    public ResponseEntity<?> submitPdfExam(
            @PathVariable Long id,
            @RequestBody PollSubmitRequest request
    ) {
        Optional<Exam> optionalExam = examRepository.findById(id);

        if (optionalExam.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Exam exam = optionalExam.get();

        if (!exam.getEnrollmentKey().equals(request.getEnrollmentKey())) {
            return ResponseEntity.badRequest().body(error("Invalid enrollment key"));
        }

        Optional<ExamSubmission> existingSubmission =
                examSubmissionRepository.findByExamIdAndStudentId(exam.getId(), request.getStudentId());

        if (existingSubmission.isPresent()) {
            return ResponseEntity.badRequest().body(error("You have already attempted this exam"));
        }

        ExamSubmission submission = new ExamSubmission();

        submission.setExamId(exam.getId());
        submission.setStudentName(request.getStudentName());
        submission.setStudentId(request.getStudentId());
        submission.setModuleCode(exam.getModuleCode());
        submission.setExamTitle(exam.getSubject());
        submission.setMarks(null);
        submission.setGrade("-");
        submission.setStatus("Pending Review");
        submission.setAnswerSummary("PDF exam submitted by student. Lecturer must mark this result manually.");

        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "PDF exam finished");
        response.put("submission", savedSubmission);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public Exam createExam(@RequestBody Exam exam) {
        return examRepository.save(exam);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(
            @PathVariable Long id,
            @RequestBody Exam updatedExam
    ) {
        return examRepository.findById(id)
                .map(exam -> {
                    exam.setSubject(updatedExam.getSubject());
                    exam.setModuleCode(updatedExam.getModuleCode());
                    exam.setLecturer(updatedExam.getLecturer());
                    exam.setHall(updatedExam.getHall());
                    exam.setFaculty(updatedExam.getFaculty());
                    exam.setExamDate(updatedExam.getExamDate());
                    exam.setExamTime(updatedExam.getExamTime());
                    exam.setDuration(updatedExam.getDuration());
                    exam.setStatus(updatedExam.getStatus());
                    exam.setExamType(updatedExam.getExamType());
                    exam.setEnrollmentKey(updatedExam.getEnrollmentKey());
                    exam.setPdfFileName(updatedExam.getPdfFileName());
                    exam.setPdfBase64(updatedExam.getPdfBase64());

                    return ResponseEntity.ok(examRepository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(exam -> {
                    examRepository.delete(exam);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String calculateGrade(double marks) {
        if (marks >= 75) return "A";
        if (marks >= 65) return "B";
        if (marks >= 55) return "C";
        if (marks >= 40) return "D";
        return "F";
    }

    private LocalDate parseDate(String value) {
        value = value.trim();

        if (value.contains("-")) {
            return LocalDate.parse(value);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return LocalDate.parse(value, formatter);
    }

    private LocalTime parseTime(String value) {
        value = value.trim();

        if (value.length() == 5) {
            return LocalTime.parse(value);
        }

        return LocalTime.parse(value.substring(0, 5));
    }

    private Map<String, String> error(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}