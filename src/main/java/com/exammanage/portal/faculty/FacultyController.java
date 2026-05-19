package com.exammanage.portal.faculty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/faculties")
@CrossOrigin(origins = "*")
public class FacultyController {
    @Autowired private FacultyRepository facultyRepository;

    @GetMapping public List<Faculty> getAllFaculties() { return facultyRepository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Faculty> getFaculty(@PathVariable Long id) {
        return facultyRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping public Faculty createFaculty(@RequestBody Faculty faculty) { return facultyRepository.save(faculty); }
    @PutMapping("/{id}") public ResponseEntity<Faculty> updateFaculty(@PathVariable Long id, @RequestBody Faculty updated) {
        return facultyRepository.findById(id).map(faculty -> {
            faculty.setName(updated.getName()); faculty.setCode(updated.getCode()); faculty.setDean(updated.getDean());
            faculty.setContactEmail(updated.getContactEmail()); faculty.setStatus(updated.getStatus()); faculty.setDescription(updated.getDescription());
            return ResponseEntity.ok(facultyRepository.save(faculty));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        return facultyRepository.findById(id).map(faculty -> { facultyRepository.delete(faculty); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
