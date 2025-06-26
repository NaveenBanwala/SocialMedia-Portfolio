package com.social_portfolio_db.demo.naveen.ServicesImp;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.Entity.Skills;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.SkillRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Mappers.UserProfileMapper;
import com.social_portfolio_db.demo.naveen.Services.UserService;

@Service
public class UserServiceImp implements UserService {

    private final UserJpa userRepo;
    private final SkillRepository skillRepo;

    public UserServiceImp(UserJpa userRepo, SkillRepository skillRepo) {
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
    }

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        Users user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
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

        Set<Skills> newSkills = dto.getSkills().stream()
            .map(name -> skillRepo.findBySkillName(name)
                .orElseGet(() -> skillRepo.save(Skills.builder().skillName(name).build()))
            ).collect(Collectors.toSet());

        user.setSkills(newSkills);
        userRepo.save(user);
    }

    public void uploadProfileImage(Long id, MultipartFile file) {
        try {
            String path = "/images/" + file.getOriginalFilename(); // relative URL
            Files.copy(file.getInputStream(), Paths.get("uploads/" + file.getOriginalFilename()), StandardCopyOption.REPLACE_EXISTING);

            Users user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            user.setProfilePicUrl(path);
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
