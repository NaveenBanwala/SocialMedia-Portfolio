package com.social_portfolio_db.demo.naveen.Controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.PatchMapping;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.ServicesImp.UserServiceImp;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.NotificationRepository;
import com.social_portfolio_db.demo.naveen.Entity.Notification;
import com.social_portfolio_db.demo.naveen.Entity.FriendRequest;
import com.social_portfolio_db.demo.naveen.Jpa.FriendRequestRepository;
import com.social_portfolio_db.demo.naveen.Dtos.FriendRequestDTO;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserServiceImp userServiceImp;
    @Autowired
    private UserJpa userRepo;
    @Autowired
    private NotificationRepository notificationRepo;
    @Autowired
    private FriendRequestRepository friendRequestRepo;

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
    public ResponseEntity<?> sendFriendRequest(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users fromUser = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("Current user not found"));
            Users toUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Target user not found"));
            if (Objects.equals(fromUser.getId(), toUser.getId())) {
                return ResponseEntity.badRequest().body("You cannot send a friend request to yourself");
            }
            if (friendRequestRepo.existsByFromUserAndToUserAndStatus(fromUser, toUser, "PENDING")) {
                return ResponseEntity.badRequest().body("Friend request already sent");
            }
            FriendRequest req = FriendRequest.builder().fromUser(fromUser).toUser(toUser).status("PENDING")
            .createdAt(LocalDateTime.now())
            .build();
            friendRequestRepo.save(req);
            // Add notification for friend request
            System.out.println("Creating notification for friend request from " + fromUser.getId() + " to " + toUser.getId());
            Notification notification = Notification.builder()
                .user(toUser)
                .message(fromUser.getUsername() + " sent you a friend request.")
                .type("FRIEND_REQUEST")
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
            notificationRepo.save(notification);
            System.out.println("Notification saved with ID: " + notification.getId());
            return ResponseEntity.ok("Friend request sent");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error sending friend request: " + e.getMessage());
        }
    }

    @PostMapping("/users/{id}/friend-request/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users toUser = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("Current user not found"));
            Users fromUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Request sender not found"));
            FriendRequest req = friendRequestRepo.findByFromUserAndToUser(fromUser, toUser).orElseThrow(() -> new RuntimeException("No request found"));
            req.setStatus("ACCEPTED");
            friendRequestRepo.save(req);
            return ResponseEntity.ok("Friend request accepted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error accepting friend request: " + e.getMessage());
        }
    }

    @PostMapping("/users/{id}/friend-request/decline")
    public ResponseEntity<?> declineFriendRequest(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users toUser = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("Current user not found"));
            Users fromUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Request sender not found"));
            FriendRequest req = friendRequestRepo.findByFromUserAndToUser(fromUser, toUser).orElseThrow(() -> new RuntimeException("No request found"));
            req.setStatus("DECLINED");
            friendRequestRepo.save(req);
            return ResponseEntity.ok("Friend request declined");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error declining friend request: " + e.getMessage());
        }
    }

    @GetMapping("/users/{id}/friend-request/status")
    public ResponseEntity<?> getFriendRequestStatus(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users currentUser = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("Current user not found"));
            Users otherUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Other user not found"));
            return ResponseEntity.ok(friendRequestRepo.findByFromUserAndToUser(currentUser, otherUser).orElse(null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error checking friend request status: " + e.getMessage());
        }
    }

    @PostMapping("/users/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long id, @RequestParam Long followerId) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Users follower = userRepo.findById(followerId).orElseThrow(() -> new RuntimeException("Follower not found"));
        System.out.println("Attempting to follow: user=" + user.getId() + ", follower=" + follower.getId());
        if (!user.getFollowing().contains(follower)) {
            user.getFollowing().add(follower);
            follower.getFollowing().add(user);
            userRepo.save(user);
            userRepo.save(follower);
            // Notification
            if (!Objects.equals(follower.getId(), user.getId())) {
                System.out.println("Creating follow notification for user: " + user.getId());
                Notification notif = Notification.builder()
                    .user(user)
                    .message(follower.getUsername() + " started following you.")
                    .type("FOLLOW")
                    .createdAt(LocalDateTime.now())
                    .read(false)
                    .build();
                notificationRepo.save(notif);
                System.out.println("Notification saved for user: " + user.getId());
            }
        }
        return ResponseEntity.ok("Followed user");
    }

    @PostMapping("/users/{id}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long id, @RequestParam Long followerId) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Users follower = userRepo.findById(followerId).orElseThrow(() -> new RuntimeException("Follower not found"));
        if (user.getFollowing().contains(follower)) {
            user.getFollowing().remove(follower);
            follower.getFollowing().remove(user);
            userRepo.save(user);
            userRepo.save(follower);
        }
        return ResponseEntity.ok("Unfollowed user");
    }

    @GetMapping("/users/{id}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable Long id) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        // Find all users whose 'following' set contains this user
        List<Users> followers = userRepo.findAll().stream()
            .filter(u -> u.getFollowing().contains(user))
            .toList();
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/users/{id}/following")
    public ResponseEntity<?> getFollowing(@PathVariable Long id) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user.getFollowing());
    }

    @GetMapping("/users/{id}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable Long id) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationRepo.findByUserOrderByCreatedAtDesc(user));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        Notification notif = notificationRepo.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        notificationRepo.save(notif);
        return ResponseEntity.ok("Notification marked as read");
    }

    @GetMapping("/users/me/friend-requests")
    public ResponseEntity<?> getMyPendingFriendRequests(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Users currentUser = userRepo.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("Current user not found"));
            List<FriendRequest> requests = friendRequestRepo.findByToUserAndStatus(currentUser, "PENDING");
            List<FriendRequestDTO> dtos = requests.stream().map(req -> FriendRequestDTO.builder()
                    .id(req.getId())
                    .fromUserId(req.getFromUser().getId())
                    .fromUsername(req.getFromUser().getUsername())
                    .fromProfilePicUrl(req.getFromUser().getProfilePicUrl())
                    .status(req.getStatus())
                    .createdAt(req.getCreatedAt().toString())
                    .build()
            ).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching friend requests: " + e.getMessage());
        }
    }

    @GetMapping("/admin/most-followed-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMostFollowedUsers() {
        List<Users> users = userRepo.findTop10UsersByFollowers();
        List<Object> result = users.stream().map(u -> {
            int followerCount = u.getFollowing() != null ? u.getFollowing().size() : 0;
            return java.util.Map.of(
                "userId", u.getId(),
                "username", u.getUsername(),
                "followerCount", followerCount
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }


    // Removed duplicate getFollowers method to resolve compilation error

}
