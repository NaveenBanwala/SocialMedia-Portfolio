package com.social_portfolio_db.demo.naveen.Controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.Authentication;

import com.social_portfolio_db.demo.naveen.Dtos.ProjectDTO;
import com.social_portfolio_db.demo.naveen.Dtos.ProjectUploadRequest;
import com.social_portfolio_db.demo.naveen.Entity.Projects;
import com.social_portfolio_db.demo.naveen.Services.ProjectService;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsRepository;


@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectsController {

    private final ProjectService projectsService;
    private final ProjectsRepository projectsRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadProject(
        @RequestParam("title") String title,
        @RequestParam("description") String description,
        @RequestParam("userId") Long userId,
        @RequestParam("images") List<MultipartFile> images
    ) {
        ProjectUploadRequest request = new ProjectUploadRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setImages(images);

        projectsService.uploadProject(request, userId);
        return ResponseEntity.ok("Project uploaded successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(projectsService.getUserProjects(userId));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectsService.getProjectById(projectId));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
        @PathVariable Long projectId,
        Authentication authentication
    ) {
        try {
            Projects project = projectsRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

            // Check if the authenticated user owns this project
            String username = authentication.getName();
            if (!project.getUser().getEmail().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own projects");
            }

            projectsRepository.delete(project);
            return ResponseEntity.ok("Project deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting project: " + e.getMessage());
        }
    }

    // Admin endpoint to delete all projects (for cleanup)
    @DeleteMapping("/admin/delete-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllProjects() {
        try {
            long count = projectsRepository.count();
            projectsRepository.deleteAll();
            return ResponseEntity.ok("Deleted " + count + " projects successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting all projects: " + e.getMessage());
        }
    }

}
