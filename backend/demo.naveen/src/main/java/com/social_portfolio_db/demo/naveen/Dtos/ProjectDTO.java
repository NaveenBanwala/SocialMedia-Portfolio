package com.social_portfolio_db.demo.naveen.Dtos;


import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ProjectDTO {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private int likeCount;
    // public static Object builder() {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'builder'");
    // }

    public ProjectDTO() {
    }
    public ProjectDTO(Long id, String title, String description, String imageUrl, int likeCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.likeCount = likeCount;
    }
}
    
