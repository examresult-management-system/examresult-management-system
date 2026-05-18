package main.java.com.exammanage.portal.exam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    // Get all exams
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    // Get exam by id
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    // Create exam
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    // Update exam
    public Exam updateExam(Long id, Exam updatedExam) {

        return examRepository.findById(id)
                .map(exam -> {

                    exam.setSubject(updatedExam.getSubject());
                    exam.setModuleCode(updatedExam.getModuleCode());
                    exam.setLecturer(updatedExam.getLecturer());
                    exam.setHall(updatedExam.getHall());
                    exam.setExamDate(updatedExam.getExamDate());
                    exam.setExamTime(updatedExam.getExamTime());
                    exam.setDuration(updatedExam.getDuration());
                    exam.setStatus(updatedExam.getStatus());

                    return examRepository.save(exam);
                })
                .orElse(null);
    }


    // Delete exam
    public boolean deleteExam(Long id) {

        return examRepository.findById(id)
                .map(exam -> {
                    examRepository.delete(exam);
                    return true;
                })
                .orElse(false);
    }
}
