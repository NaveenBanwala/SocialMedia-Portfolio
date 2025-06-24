package com.social_portfolio_db.demo.naveen.Jpa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_portfolio_db.demo.naveen.Entity.Users;
import org.springframework.stereotype.Repository;

@Repository
public interface UserJpa extends JpaRepository<Users, Long> {
    
    // Optional<Users> findByUsername(String username);

    Optional<Users> findByEmail(String email);
    

}
