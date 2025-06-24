package com.social_portfolio_db.demo.naveen.Entity;

// CREATE TABLE users (
//     id BIGINT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     email VARCHAR(100) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     bio TEXT,
//     location VARCHAR(100),
//     profile_pic_url VARCHAR(255),
//     resume_url VARCHAR(255),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.List;


@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String username;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "bio", length = 500)
    @ToString.Exclude
    private String bio;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "profile_pic_url", length = 255)
    private String profilePicUrl;

    @Column(name = "resume_url", length = 255)
    private String resumeUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @ToString.Exclude
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Skills> skills = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Projects> projects = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectsLike> likedProjects = new ArrayList<>();


}
