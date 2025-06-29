package com.social_portfolio_db.demo.naveen.Dtos;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;           
    private String bio;
    private String location;
    private String profilePicUrl;
    private String resumeUrl;        

    private List<String> skills; 

    private List<ProjectDTO> projects;
    private List<String> roles;
}


