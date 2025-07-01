package com.social_portfolio_db.demo.naveen.ServicesImp;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.nio.file.Path;
// import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.Entity.Skills;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Entity.Projects;
import com.social_portfolio_db.demo.naveen.Jpa.SkillRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsRepository;
import com.social_portfolio_db.demo.naveen.Mappers.UserProfileMapper;
import com.social_portfolio_db.demo.naveen.Services.UserService;
import com.social_portfolio_db.demo.naveen.Dtos.ProjectDTO;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class UserServiceImp implements UserService {

    private final UserJpa userRepo;
    private final SkillRepository skillRepo;
    @Autowired
    private ProjectsRepository projectsRepo;

    public UserServiceImp(UserJpa userRepo, SkillRepository skillRepo) {
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
    }

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        Users user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        // Force initialization of skills to avoid LazyInitializationException
        user.getSkills().size();
        // Force initialization of projects to avoid LazyInitializationException
        user.getProjects().size();
        return UserProfileMapper.toDto(user);
    }

    @Override
    public List<UserProfileDTO> searchUsersBySkillAndName(String skill, String username) {
        List<Users> users;

        if (skill != null && username != null) {
            users = userRepo.findBySkillNameAndUsernameContainingIgnoreCase(skill, username);
        } else if (skill != null) {
            users = userRepo.findBySkillName(skill);
        } else if (username != null) {
            users = userRepo.findByUsernameContainingIgnoreCase(username);
        } else {
            users = userRepo.findAll(); // fallback
        }

        return users.stream()
                    .map(UserProfileMapper::toDto)
                    .toList();
    }

    public void updateProfile(Long id, UserProfileDTO dto) {
        Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        user.setBio(dto.getBio());
        user.setLocation(dto.getLocation());
        user.setProfilePicUrl(dto.getProfilePicUrl());
        user.setResumeUrl(dto.getResumeUrl());

        Set<Skills> newSkills = new java.util.HashSet<>();
        if (dto.getSkills() != null) {
            for (String name : dto.getSkills()) {
                Skills skill = skillRepo.findBySkillName(name)
                    .orElseGet(() -> {
                        Skills s = Skills.builder().skillName(name).user(user).build();
                        return skillRepo.save(s);
                    });
                newSkills.add(skill);
            }
        }
        user.setSkills(newSkills);

        // Handle projects without duplication
        if (dto.getProjects() != null) {
            List<Projects> existingProjects = projectsRepo.findByUserId(user.getId());
            for (ProjectDTO projectDTO : dto.getProjects()) {
                if (projectDTO.getTitle() != null && !projectDTO.getTitle().isEmpty()) {
                    boolean alreadyExists = existingProjects.stream()
                        .anyMatch(p -> p.getTitle().equalsIgnoreCase(projectDTO.getTitle()));
                    if (!alreadyExists) {
                        Projects project = new Projects();
                        project.setTitle(projectDTO.getTitle());
                        project.setDescription(projectDTO.getDescription());
                        project.setImageUrl(projectDTO.getImageUrl());
                        project.setUser(user); // Associate project with user
                        projectsRepo.save(project);
                    }
                }
            }
        }

        userRepo.save(user);
    }

    public void uploadProfileImage(Long id, MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/profiles/");
            Path filePath = uploadPath.resolve(fileName);
            
            // Create directories if they don't exist
            Files.createDirectories(uploadPath);
            
            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile with the image URL
            Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            user.setProfilePicUrl("/images/profiles/" + fileName);
            userRepo.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error uploading image", e);
        }
    }

public List<UserProfileDTO> searchUsersByParams(String name, String skill, String location) {
    List<Users> users = userRepo.searchUsers(name, skill, location);
    return users.stream().map(UserProfileMapper::toDto).toList();
}

}
