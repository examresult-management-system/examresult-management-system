package main.java.com.exammanage.portal.auth;

import com.exammanage.portal.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired private UserRepository userRepository;

    @GetMapping public List<User> getUsers() { return userRepository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}") public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated) {
        return userRepository.findById(id).map(user -> {
            if (updated.getEmail() != null && !updated.getEmail().isBlank()) {
                User existing = userRepository.findByEmail(updated.getEmail());
                if (existing != null && !existing.getId().equals(id)) return ResponseEntity.badRequest().body(error("Email already exists"));
                user.setEmail(updated.getEmail());
            }
            if (updated.getName() != null) user.setName(updated.getName());
            if (updated.getPassword() != null && !updated.getPassword().isBlank()) user.setPassword(updated.getPassword());
            if (updated.getRole() != null) user.setRole(updated.getRole());
            user.setFaculty(updated.getFaculty());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> { userRepository.delete(user); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/profile") public ResponseEntity<?> updateProfile(@RequestBody UserUpdateRequest request) {
        User user = userRepository.findByEmail(request.getCurrentEmail());
        if (user == null) return ResponseEntity.badRequest().body(error("User not found"));
        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().isBlank()) user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) user.setPassword(request.getPassword());
        return ResponseEntity.ok(userRepository.save(user));
    }
    @PostMapping("/change-password") public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        User user = userRepository.findByEmail(body.get("email"));
        if (user == null) return ResponseEntity.badRequest().body(error("User not found"));
        user.setPassword(body.get("newPassword"));
        userRepository.save(user);
        Map<String, String> response = new HashMap<>(); response.put("message", "Password changed successfully"); return ResponseEntity.ok(response);
    }
    private Map<String, String> error(String message) { Map<String, String> e = new HashMap<>(); e.put("message", message); return e; }
}

