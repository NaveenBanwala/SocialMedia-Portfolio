package com.social_portfolio_db.demo.naveen.Jpa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_portfolio_db.demo.naveen.Entity.Projects;

public interface ProjectsRepository extends JpaRepository<Projects, Long> {
    List<Projects> findByUserId(Long userId);
}

