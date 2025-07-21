package com.social_portfolio_db.demo.naveen.Jpa;

import com.social_portfolio_db.demo.naveen.Entity.Vote;
import com.social_portfolio_db.demo.naveen.Entity.VotingApplication;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    long countByApplication(VotingApplication application);
    boolean existsByVoterAndApplication(Users voter, VotingApplication application);
    List<Vote> findByApplication(VotingApplication application);
} 