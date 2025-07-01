package com.social_portfolio_db.demo.naveen.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "friend_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"followers", "following", "notifications", "skills", "projects", "likedProjects", "likedProfiles", "receivedLikes", "posts", "likedPosts", "roles", "password"})
    private Users fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"followers", "following", "notifications", "skills", "projects", "likedProjects", "likedProfiles", "receivedLikes", "posts", "likedPosts", "roles", "password"})
    private Users toUser;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, DECLINED

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
} 