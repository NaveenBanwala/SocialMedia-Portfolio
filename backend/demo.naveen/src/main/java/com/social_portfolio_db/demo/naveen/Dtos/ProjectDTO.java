package com.social_portfolio_db.demo.naveen.Dtos;


import lombok.Data;

@Data
public class ProjectDTO {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private int likeCount;
}
    
