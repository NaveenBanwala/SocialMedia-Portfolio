package com.social_portfolio_db.demo.naveen.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.ServicesImp.UserServiceImp;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserServiceImp userServiceImp;


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

    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadImage(@PathVariable Long id,
                                            @RequestParam("file") MultipartFile file) {
        userServiceImp.uploadProfileImage(id, file);
        return ResponseEntity.ok("Image uploaded");
    }

}
