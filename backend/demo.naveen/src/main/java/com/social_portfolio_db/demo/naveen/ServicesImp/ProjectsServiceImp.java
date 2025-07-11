package com.social_portfolio_db.demo.naveen.ServicesImp;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.social_portfolio_db.demo.naveen.Dtos.ProjectDTO;
import com.social_portfolio_db.demo.naveen.Dtos.ProjectUploadRequest;
import com.social_portfolio_db.demo.naveen.Entity.Projects;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Services.ProjectService;

// Removed incorrect import of jakarta.persistence.criteria.Path

@Service
public class ProjectsServiceImp implements ProjectService {

    @Autowired
    private ProjectsRepository projectsRepo;

    @Autowired
    private UserJpa userRepo;

    private final String uploadDir = "uploads/projects/";

    @Override
    public void uploadProject(ProjectUploadRequest request, Long userId) {
        Users user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> imagePaths = new ArrayList<>();
        for (MultipartFile file : request.getImages()) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            try {
                Files.createDirectories(path.getParent());
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                imagePaths.add("/images/projects/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed", e);
            }
        }

        Projects project = new Projects();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setImageUrl(String.join(",", imagePaths)); // comma separated
        project.setUser(user);

        projectsRepo.save(project);
    }

    @Override
    public List<ProjectDTO> getUserProjects(Long userId) {
        return projectsRepo.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ProjectDTO getProjectById(Long projectId) {
        return toDto(projectsRepo.findById(projectId).orElseThrow(() -> new RuntimeException("Not found")));
    }
    private ProjectDTO toDto(Projects p) {
        String username = null;
        Long userId = null;
        if (p.getUser() != null && p.getUser().getUsername() != null && !p.getUser().getUsername().trim().isEmpty()) {
            username = p.getUser().getUsername();
            userId = p.getUser().getId();
        } else {
            username = "Unknown";
            userId = null;
        }
        System.out.println("Project " + p.getId() + " user: " + (p.getUser() != null ? p.getUser().getId() : "null") + " username: " + username);
        return ProjectDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .likeCount(p.getLikes() != null ? p.getLikes().size() : 0)
                .username(username)
                .userId(userId)
                .build();
    }
}

