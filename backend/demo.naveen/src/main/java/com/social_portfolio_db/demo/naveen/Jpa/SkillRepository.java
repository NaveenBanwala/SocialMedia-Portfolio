package com.social_portfolio_db.demo.naveen.Jpa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_portfolio_db.demo.naveen.Entity.Skills;

public interface SkillRepository extends JpaRepository<Skills, Long> {
    Optional<Skills> findBySkillName(String skillName);
}
