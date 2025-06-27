package com.social_portfolio_db.demo.naveen.Controllers.Admin;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import lombok.RequiredArgsConstructor;

import java.util.List;

import com.social_portfolio_db.demo.naveen.Jpa.PostRepository;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Entity.Post;
import com.social_portfolio_db.demo.naveen.Entity.Projects;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserJpa userRepo;
    private final ProjectsRepository projectRepo;

    private final PostRepository postRepo;

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects")
    public ResponseEntity<List<Projects>> getAllProjects() {
        return ResponseEntity.ok(projectRepo.findAll());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("posts/{postId}")
    public ResponseEntity<?> deleteAnyPost(@PathVariable Long postId) {
        Post post = postRepo.findById(postId).orElseThrow();
        postRepo.delete(post);
        return ResponseEntity.ok("Post deleted by admin");
    }
    
}
