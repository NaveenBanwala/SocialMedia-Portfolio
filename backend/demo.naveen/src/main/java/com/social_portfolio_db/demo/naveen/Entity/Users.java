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
import java.util.*;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Role mapping
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // Skills mapping (assuming unidirectional OneToMany for simplicity)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Skills> skills = new ArrayList<>();

    // Projects mapping
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Projects> projects = new ArrayList<>();

    // Liked projects
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectsLike> likedProjects = new ArrayList<>();

    // ✅ Setter method for profile image path
    public void profilePicUrl(String path) {
        this.profilePicUrl = path;
    }

    // ✅ Custom setter for skills (replaces current list)
    public void setSkills(Set<Skills> newSkills) {
        this.skills.clear();
        this.skills.addAll(newSkills);
    }


    // Profiles that this user has liked
@OneToMany(mappedBy = "likedBy", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<ProfileLike> likedProfiles = new ArrayList<>();

// Profiles that have liked this user
@OneToMany(mappedBy = "likedUser", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<ProfileLike> receivedLikes = new ArrayList<>();


@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Post> posts = new ArrayList<>();


}
