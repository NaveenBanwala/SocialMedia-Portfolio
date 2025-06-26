package com.social_portfolio_db.demo.naveen.Controllers;

import org.springframework.web.bind.annotation.RestController;

import com.social_portfolio_db.demo.naveen.ServicesImp.LikeService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<?> likeProject(@PathVariable Long projectId, @RequestParam Long userId) {
        likeService.likeProject(userId, projectId);
        return ResponseEntity.ok("Project liked");
    }

    @PostMapping("/profile/{likedUserId}")
    public ResponseEntity<?> likeProfile(@PathVariable Long likedUserId, @RequestParam Long likedById) {
        likeService.likeProfile(likedById, likedUserId);
        return ResponseEntity.ok("Profile liked");
    }

    @GetMapping("/project/{projectId}/count")
    public ResponseEntity<Long> getProjectLikeCount(@PathVariable Long projectId) {
        return ResponseEntity.ok(likeService.getProjectLikeCount(projectId));
    }

    @GetMapping("/profile/{userId}/count")
    public ResponseEntity<Long> getProfileLikeCount(@PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getProfileLikeCount(userId));
    }
}

