package com.social_portfolio_db.demo.naveen.Mappers;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.Dtos.ProjectDTO;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Entity.Skills;

import java.util.stream.Collectors;

public class UserProfileMapper {
    public static UserProfileDTO toDto(Users user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setBio(user.getBio());
        dto.setLocation(user.getLocation());
        dto.setProfilePicUrl(user.getProfilePicUrl());

        dto.setSkills(
            user.getSkills().stream()
                .map(Skills::getSkillName)
                .collect(Collectors.toList())
        );

        dto.setProjects(
            user.getProjects().stream()
                .map(project -> {
                    ProjectDTO p = new ProjectDTO();
                    p.setId(project.getId());
                    p.setTitle(project.getTitle());
                    p.setDescription(project.getDescription());
                    p.setImageUrl(project.getImageUrl());
                    p.setLikeCount(project.getLikes().size()); // count likes
                    return p;
                }).collect(Collectors.toList())
        );

        return dto;
    }

}


