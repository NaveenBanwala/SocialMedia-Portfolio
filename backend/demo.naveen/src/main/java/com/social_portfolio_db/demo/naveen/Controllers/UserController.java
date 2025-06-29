package com.social_portfolio_db.demo.naveen.Controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.ServicesImp.UserServiceImp;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Entity.Users;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserServiceImp userServiceImp;
    @Autowired
    private UserJpa userRepo;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Backend is working! UserController is accessible.");
    }

    @GetMapping("/users/{id}")
        public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        UserProfileDTO profile = userServiceImp.getUserProfile(id);
            return ResponseEntity.ok(profile);

}

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String location) {

        List<UserProfileDTO> results = userServiceImp.searchUsersByParams(name, skill, location);
        return ResponseEntity.ok(results);
    }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/data")
        public ResponseEntity<?> getAdminData() {
            return ResponseEntity.ok("Only admin can see this");
}

// Removed duplicate getProfile method to resolve compilation error

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProfile(@PathVariable Long id, @RequestBody UserProfileDTO dto) {
        userServiceImp.updateProfile(id, dto);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/users/{id}/upload")
    public ResponseEntity<String> uploadImage(@PathVariable Long id,
                                            @RequestParam("file") MultipartFile file) {
        userServiceImp.uploadProfileImage(id, file);
        return ResponseEntity.ok("Image uploaded");
    }

    @PostMapping("/users/{id}/resume/upload")
    public ResponseEntity<String> uploadResume(@PathVariable Long id,
                                            @RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if the authenticated user owns this profile
            if (!user.getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only upload resume to your own profile");
            }

            // Validate file type
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed for resume");
            }

            // Save file to uploads/resumes directory
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/resumes");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Update user's resume URL
            user.setResumeUrl("/files/resumes/" + fileName);
            userRepo.save(user);
            
            return ResponseEntity.ok("Resume uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error uploading resume: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}/resume")
    public ResponseEntity<String> removeResume(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if the authenticated user owns this profile
            if (!user.getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only remove your own resume");
            }
            
            // Remove the file if it exists
            if (user.getResumeUrl() != null && user.getResumeUrl().startsWith("/files/resumes/")) {
                String fileName = user.getResumeUrl().substring("/files/resumes/".length());
                Path filePath = Paths.get("uploads/resumes/" + fileName);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
            
            user.setResumeUrl(null);
            userRepo.save(user);
            return ResponseEntity.ok("Resume removed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error removing resume: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}/profile-picture")
    public ResponseEntity<String> removeProfilePicture(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if the authenticated user owns this profile
            if (!user.getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only remove your own profile picture");
            }
            
            user.setProfilePicUrl(null);
            userRepo.save(user);
            return ResponseEntity.ok("Profile picture removed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error removing profile picture: " + e.getMessage());
        }
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserProfileDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Users user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        UserProfileDTO dto = userServiceImp.getUserProfile(user.getId());
        return ResponseEntity.ok(dto);
    }

    // Direct image serving endpoint - moved to avoid conflicts
    @GetMapping("/files/{type}/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String type, @PathVariable String filename) {
        try {
            Path filePath;
            if ("profiles".equals(type)) {
                filePath = Paths.get("uploads/profiles/" + filename);
            } else if ("projects".equals(type)) {
                filePath = Paths.get("uploads/projects/" + filename);
            } else if ("resumes".equals(type)) {
                filePath = Paths.get("uploads/resumes/" + filename);
            } else {
                filePath = Paths.get("uploads/" + filename);
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().endsWith(".gif")) {
            return "image/gif";
        } else if (filename.toLowerCase().endsWith(".webp")) {
            return "image/webp";
        } else if (filename.toLowerCase().endsWith(".pdf")) {
            return "application/pdf";
        } else {
            return "application/octet-stream";
        }
    }

    @PostMapping("/users/{id}/friend-request")
    public ResponseEntity<String> sendFriendRequest(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users currentUser = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
            
            Users targetUser = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Target user not found"));
            
            // Check if trying to send request to self
            if (currentUser.getId() == targetUser.getId()) {
                return ResponseEntity.badRequest().body("You cannot send a friend request to yourself");
            }
            
            // For now, just return success (in a real app, you'd save this to a friend_requests table)
            return ResponseEntity.ok("Friend request sent successfully to " + targetUser.getUsername());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error sending friend request: " + e.getMessage());
        }
    }

}
