package main.java.com.exammanage.portal.announcement;

public class AnnouncementController {
    import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

    @RestController
    @RequestMapping("/api/announcements")
    @CrossOrigin(origins = "*")
    public class AnnouncementController {

        @Autowired
        private AnnouncementRepository announcementRepository;

        @GetMapping
        public List<Announcement> getAllAnnouncements() {
            return announcementRepository.findAll();
        }

        @GetMapping("/{id}")
        public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
            return announcementRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @PostMapping
        public Announcement createAnnouncement(@RequestBody Announcement announcement) {
            if (announcement.getDate() == null) {
                announcement.setDate(LocalDateTime.now());
            }

            if (announcement.getAuthor() == null || announcement.getAuthor().trim().isEmpty()) {
                announcement.setAuthor("Lecturer");
            }

            if (announcement.getPriority() == null || announcement.getPriority().trim().isEmpty()) {
                announcement.setPriority("Normal");
            }

            return announcementRepository.save(announcement);
        }

        @PutMapping("/{id}")
        public ResponseEntity<Announcement> updateAnnouncement(
                @PathVariable Long id,
                @RequestBody Announcement updatedAnnouncement
        ) {
            return announcementRepository.findById(id)
                    .map(announcement -> {
                        announcement.setTitle(updatedAnnouncement.getTitle());
                        announcement.setContent(updatedAnnouncement.getContent());
                        announcement.setAuthor(updatedAnnouncement.getAuthor());
                        announcement.setPriority(updatedAnnouncement.getPriority());

                        return ResponseEntity.ok(announcementRepository.save(announcement));
                    })
                    .orElse(ResponseEntity.notFound().build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
            return announcementRepository.findById(id)
                    .map(announcement -> {
                        announcementRepository.delete(announcement);
                        return ResponseEntity.noContent().<Void>build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
    }
}
