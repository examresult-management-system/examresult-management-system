package com.exammanage.portal.result;

import com.exammanage.portal.exam.Exam;
import com.exammanage.portal.exam.ExamRepository;
import com.exammanage.portal.exam.ExamSubmission;
import com.exammanage.portal.exam.ExamSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    @Autowired private ResultRepository resultRepository;
    @Autowired private ExamSubmissionRepository examSubmissionRepository;
    @Autowired private ExamRepository examRepository;

    @GetMapping
    public List<Result> getAllResults() {
        List<Result> results = new ArrayList<>();

        for (Result result : resultRepository.findAll()) {
            result.setSourceType("RESULT");
            result.setSourceId(result.getId());
            result.setExamTitle(result.getModuleName());
            result.setExamType("MANUAL");
            results.add(result);
        }

        for (ExamSubmission submission : examSubmissionRepository.findAll()) {
            Result result = new Result();
            result.setSourceType("SUBMISSION");
            result.setSourceId(submission.getId());
            result.setExamId(submission.getExamId());
            result.setStudentId(submission.getStudentId());
            result.setStudentName(submission.getStudentName());
            result.setModuleCode(submission.getModuleCode());
            result.setModuleName(submission.getExamTitle());
            result.setExamTitle(submission.getExamTitle());
            result.setMarks(submission.getMarks());
            result.setGrade(submission.getGrade());
            result.setStatus(submission.getStatus());
            result.setSemester("-");
            String examType = examRepository.findById(submission.getExamId()).map(Exam::getExamType).orElse("SUBMISSION");
            result.setExamType(examType);
            results.add(result);
        }
        return results;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result> getResultById(@PathVariable Long id) {
        return resultRepository.findById(id).map(result -> {
            result.setSourceType("RESULT");
            result.setSourceId(result.getId());
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Result createResult(@RequestBody Result result) {
        if (result.getGrade() == null || result.getGrade().trim().isEmpty()) {
            result.setGrade(calculateGrade(result.getMarks()));
        }
        if (result.getStatus() == null || result.getStatus().trim().isEmpty()) {
            result.setStatus(calculateStatus(result.getMarks()));
        }
        return resultRepository.save(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result> updateResult(@PathVariable Long id, @RequestBody Result updatedResult) {
        return resultRepository.findById(id).map(result -> {
            copyResultFields(result, updatedResult);
            Result saved = resultRepository.save(result);
            saved.setSourceType("RESULT");
            saved.setSourceId(saved.getId());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/submission/{id}")
    public ResponseEntity<?> updateSubmissionResult(@PathVariable Long id, @RequestBody Result updatedResult) {
        return examSubmissionRepository.findById(id).map(submission -> {
            if (updatedResult.getStudentName() != null) submission.setStudentName(updatedResult.getStudentName());
            if (updatedResult.getStudentId() != null) submission.setStudentId(updatedResult.getStudentId());
            if (updatedResult.getModuleCode() != null) submission.setModuleCode(updatedResult.getModuleCode());
            if (updatedResult.getModuleName() != null) submission.setExamTitle(updatedResult.getModuleName());

            Double marks = updatedResult.getMarks();
            if (marks != null) submission.setMarks(marks);
            submission.setGrade((updatedResult.getGrade() == null || updatedResult.getGrade().trim().isEmpty()) ? calculateGrade(submission.getMarks()) : updatedResult.getGrade());
            submission.setStatus((updatedResult.getStatus() == null || updatedResult.getStatus().trim().isEmpty()) ? calculateStatus(submission.getMarks()) : updatedResult.getStatus());

            ExamSubmission saved = examSubmissionRepository.save(submission);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Submission result updated");
            response.put("submission", saved);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        return resultRepository.findById(id).map(result -> {
            resultRepository.delete(result);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/submission/{id}")
    public ResponseEntity<Void> deleteSubmissionResult(@PathVariable Long id) {
        return examSubmissionRepository.findById(id).map(submission -> {
            examSubmissionRepository.delete(submission);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void copyResultFields(Result result, Result updatedResult) {
        result.setStudentId(updatedResult.getStudentId());
        result.setStudentName(updatedResult.getStudentName());
        result.setModuleCode(updatedResult.getModuleCode());
        result.setModuleName(updatedResult.getModuleName());
        result.setMarks(updatedResult.getMarks());
        result.setGrade((updatedResult.getGrade() == null || updatedResult.getGrade().trim().isEmpty()) ? calculateGrade(updatedResult.getMarks()) : updatedResult.getGrade());
        result.setStatus((updatedResult.getStatus() == null || updatedResult.getStatus().trim().isEmpty()) ? calculateStatus(updatedResult.getMarks()) : updatedResult.getStatus());
        result.setSemester(updatedResult.getSemester());
    }

    private String calculateGrade(Double marks) {
        if (marks == null) return "-";
        if (marks >= 75) return "A";
        if (marks >= 65) return "B";
        if (marks >= 55) return "C";
        if (marks >= 40) return "D";
        return "F";
    }

    private String calculateStatus(Double marks) {
        if (marks == null) return "Pending";
        return marks >= 40 ? "Pass" : "Fail";
    }
}
