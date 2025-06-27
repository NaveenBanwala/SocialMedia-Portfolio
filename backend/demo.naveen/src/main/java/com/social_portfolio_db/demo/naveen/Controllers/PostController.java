package com.social_portfolio_db.demo.naveen.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_portfolio_db.demo.naveen.Dtos.PostRequest;
import com.social_portfolio_db.demo.naveen.Entity.Post;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.PostRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepo;
    private final UserJpa userRepo;

    // Create a new post
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Users user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Post post = new Post();
        post.setContent(request.getContent());
        post.setUser(user);
        postRepo.save(post);
        return ResponseEntity.ok("Post created successfully!");
    }

    // View own posts
    @GetMapping("/me")
    public ResponseEntity<List<Post>> getMyPosts(@AuthenticationPrincipal UserDetails userDetails) {
        Users user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(postRepo.findByUserId(user.getId()));
    }

    // Delete own post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deleteOwnPost(@PathVariable Long postId, @AuthenticationPrincipal UserDetails userDetails) {
        Users user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        if (post.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own posts");
        }
        postRepo.delete(post);
        return ResponseEntity.ok("Post deleted");
    }

    // View posts of another user (public)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable Long userId) {
        return ResponseEntity.ok(postRepo.findByUserId(userId));
    }
}


