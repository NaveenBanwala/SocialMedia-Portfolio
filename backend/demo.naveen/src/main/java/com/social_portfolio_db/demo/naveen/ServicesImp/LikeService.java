package com.social_portfolio_db.demo.naveen.ServicesImp;

import org.springframework.stereotype.Service;

import com.social_portfolio_db.demo.naveen.Entity.ProfileLike;
import com.social_portfolio_db.demo.naveen.Entity.Projects;
import com.social_portfolio_db.demo.naveen.Entity.ProjectsLike;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.ProfileLikeRepository;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsLikeRepository;
import com.social_portfolio_db.demo.naveen.Jpa.ProjectsRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final ProjectsLikeRepository projectsLikeRepo;
    private final ProfileLikeRepository profileLikeRepo;
    private final UserJpa userRepo;
    private final ProjectsRepository projectRepo;

    public void likeProject(Long userId, Long projectId) {
        if (!projectsLikeRepo.existsByUserIdAndProjectId(userId, projectId)) {
            Projects project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

            Users user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            ProjectsLike like = new ProjectsLike();
            like.setProject(project);
            like.setUser(user);
            projectsLikeRepo.save(like);
        }
    }

    public void likeProfile(Long likedById, Long likedUserId) {
        if (!profileLikeRepo.existsByLikedByIdAndLikedUserId(likedById, likedUserId)) {
            Users likedBy = userRepo.findById(likedById).orElseThrow();
            Users likedUser = userRepo.findById(likedUserId).orElseThrow();

            ProfileLike like = new ProfileLike();
            like.setLikedBy(likedBy);
            like.setLikedUser(likedUser);
            profileLikeRepo.save(like);
        }
    }

    public long getProjectLikeCount(Long projectId) {
        return projectsLikeRepo.countByProjectId(projectId);
    }

    public long getProfileLikeCount(Long userId) {
        return profileLikeRepo.countByLikedUserId(userId);
    }
}
