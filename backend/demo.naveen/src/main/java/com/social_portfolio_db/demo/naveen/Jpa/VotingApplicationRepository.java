package com.social_portfolio_db.demo.naveen.Jpa;

import com.social_portfolio_db.demo.naveen.Entity.VotingApplication;
import com.social_portfolio_db.demo.naveen.Entity.VotingContest;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VotingApplicationRepository extends JpaRepository<VotingApplication, Long> {
    List<VotingApplication> findByContestAndStatus(VotingContest contest, String status);
    List<VotingApplication> findByUserAndContest(Users user, VotingContest contest);
} 