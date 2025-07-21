package com.social_portfolio_db.demo.naveen.Jpa;

import com.social_portfolio_db.demo.naveen.Entity.VotingContest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VotingContestRepository extends JpaRepository<VotingContest, Long> {
} 