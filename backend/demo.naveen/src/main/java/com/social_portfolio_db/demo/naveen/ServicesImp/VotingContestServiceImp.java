package com.social_portfolio_db.demo.naveen.ServicesImp;

import com.social_portfolio_db.demo.naveen.Entity.*;
import com.social_portfolio_db.demo.naveen.Jpa.*;
import com.social_portfolio_db.demo.naveen.Services.VotingContestService;
import com.social_portfolio_db.demo.naveen.Dtos.VoteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class VotingContestServiceImp implements VotingContestService {
    @Autowired
    private VotingContestRepository contestRepo;
    @Autowired
    private VotingApplicationRepository applicationRepo;
    @Autowired
    private VoteRepository voteRepo;
    @Autowired
    private UserJpa userRepo;

    @Override
    public VotingApplication applyForContest(Long userId, String email, String imageUrl) {
        try {
            if (userId == null || email == null || imageUrl == null || imageUrl.isEmpty()) {
                throw new IllegalArgumentException("User ID, Email, and Image URL must not be null or empty");
            }
            Users user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            if (!user.getEmail().equals(email)) {
                throw new IllegalArgumentException("Email does not match user");
            }
            VotingContest contest = getActiveContest();
            if (contest == null ) {
                throw new RuntimeException("No active contest found");
            }
            // Check if already applied
            List<VotingApplication> existing = applicationRepo.findByUserAndContest(user, contest);
            if (existing != null && !existing.isEmpty()) {
                throw new IllegalStateException("User has already applied for this contest");
            }
            VotingApplication application = new VotingApplication();
            application.setUser(user);
            application.setContest(contest);
            application.setImageUrl(imageUrl);
            application.setStatus("PENDING");
            application.setAppliedAt(LocalDateTime.now());
            return applicationRepo.save(application);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to apply for contest: " + e.getMessage(), e);
        }
    }

    

    @Override
    public List<VotingApplication> getApplicationsForAdmin() {
        VotingContest contest = getActiveContest();
        if (contest == null) return Collections.emptyList();
        return applicationRepo.findByContestAndStatus(contest, "PENDING");
    }

    @Override
    public List<VotingApplication> getApprovedApplications() {
        VotingContest contest = getActiveContest();
        if (contest == null) return Collections.emptyList();
        return applicationRepo.findByContestAndStatus(contest, "APPROVED");
    }

    @Override
    public VoteDTO voteForApplication(Long voterId, Long applicationId) {
        // 1. Check if voting is open
        if (!isVotingOpen()) {
            throw new IllegalStateException("Voting is not open.");
        }

        // 2. Find voter and application
        Users voter = userRepo.findById(voterId)
            .orElseThrow(() -> new RuntimeException("Voter not found"));
        VotingApplication application = applicationRepo.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        
        if (application.getUser().getId() == voterId) {
            throw new IllegalArgumentException("You cannot vote for yourself.");
        }

        
        if (voteRepo.existsByVoterAndApplication(voter, application)) {
            throw new IllegalStateException("You have already voted for this application.");
        }

        Vote vote = new Vote();
        vote.setVoter(voter);
        vote.setApplication(application);
        vote.setVotedAt(LocalDateTime.now());
        Vote savedVote = voteRepo.save(vote);
        return new VoteDTO(
            savedVote.getId(),
            savedVote.getVoter().getId(),
            savedVote.getVoter().getUsername(),
            savedVote.getApplication().getId(),
            savedVote.getVotedAt()
        );
    }

    @Override
    public List<VotingApplication> getTopContestants(int topN) {
        // Attempt to fetch top N applications by votes (assuming a method exists)
        // If not, fetch all and sort manually
        List<VotingApplication> allApplications = applicationRepo.findAll();
        if (allApplications == null || allApplications.isEmpty()) {
            return Collections.emptyList();
        }

        // Set the correct vote count for each application
        for (VotingApplication app : allApplications) {
            int totalVotes = voteRepo.findByApplication(app).size();
            app.setVotes(totalVotes);
        }

        // Sort applications by votes descending
        allApplications.sort((a, b) -> Integer.compare(b.getVotes(), a.getVotes()));

        // Return only the top N
        if (topN > allApplications.size()) {
            topN = allApplications.size();
        }
        return allApplications.subList(0, topN);
    }

    @Override
    public VotingContest updateContest(VotingContest contest){

        // Check contest exist or not
        // if(contestRepo.findById(contest.getId())){

        // }
    }

    @Override
    public VotingContest getActiveContest() {
        // Find the active contest (isActive = true, and now between start and end)
        List<VotingContest> contests = contestRepo.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (VotingContest contest : contests) {
            if (contest.isActive() &&
                contest.getStartTime() != null &&
                contest.getEndTime() != null &&
                now.isAfter(contest.getStartTime()) &&
                now.isBefore(contest.getEndTime())) {
                return contest;
            }
        }
        return contests.stream()
            .filter(VotingContest::isActive)
            .findFirst()
            .orElse(null);
    }

    @Override
    public boolean isVotingOpen() {
        VotingContest contest = getActiveContest();
        if (contest == null) return false;
        LocalDateTime now = LocalDateTime.now();
        return contest.isActive() &&
                contest.getStartTime() != null &&
                contest.getEndTime() != null &&
                now.isAfter(contest.getStartTime()) &&
                now.isBefore(contest.getEndTime());
    }

    @Override
    public String getVotingEndTime() {
        VotingContest contest = getActiveContest();
        if (contest == null || contest.getEndTime() == null) return null;
        return contest.getEndTime().toString();
    }

    @Override
    public void saveContest(VotingContest contest) {
        contestRepo.save(contest);
    }



} 