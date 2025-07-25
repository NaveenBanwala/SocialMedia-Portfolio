package com.social_portfolio_db.demo.naveen.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import jakarta.persistence.Transient;

@Entity
public class VotingApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private VotingContest contest;

    private String status; // e.g. PENDING, APPROVED, REJECTED
    private String imageUrl;
    private LocalDateTime appliedAt;

    @Transient
    private int votes;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
    public VotingContest getContest() { return contest; }
    public void setContest(VotingContest contest) { this.contest = contest; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public int getVotes() { return votes; }
    public void setVotes(int votes) { this.votes = votes; }
} 