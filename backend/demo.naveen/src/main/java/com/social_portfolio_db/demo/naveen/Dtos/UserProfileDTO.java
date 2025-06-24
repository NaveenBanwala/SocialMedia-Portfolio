package com.social_portfolio_db.demo.naveen.Dtos;

import java.util.List;

import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String name;
    private String bio;
    private String location;
    private String profilePicUrl;

    private List<String> skills;

    private List<ProjectDTO> projects;
}

