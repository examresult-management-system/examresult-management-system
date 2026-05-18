package main.java.com.exammanage.portal.announcement;

public class AnnouncementRepository {
    import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    }

}
