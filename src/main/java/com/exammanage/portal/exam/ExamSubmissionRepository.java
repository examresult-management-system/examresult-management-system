package main.java.com.exammanage.portal.exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    Optional<ExamSubmission> findByExamIdAndStudentId(Long examId, String studentId);
}