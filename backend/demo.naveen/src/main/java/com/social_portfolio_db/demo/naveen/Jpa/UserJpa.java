package com.social_portfolio_db.demo.naveen.Jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.social_portfolio_db.demo.naveen.Entity.Users;
import org.springframework.stereotype.Repository;

@Repository
public interface UserJpa extends JpaRepository<Users, Long> {
    
    // Optional<Users> findByUsername(String username);

    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u JOIN u.skills s WHERE s.skillName = :skill AND LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Users> findBySkillNameAndUsernameContainingIgnoreCase(@Param("skill") String skill, @Param("username") String username);

    @Query("SELECT u FROM Users u JOIN u.skills s WHERE s.skillName = :skill")
    List<Users> findBySkillName(@Param("skill") String skill);

    List<Users> findByUsernameContainingIgnoreCase(String username);


    @Query("SELECT DISTINCT u FROM Users u LEFT JOIN u.skills s " +
        "WHERE (:name IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :name, '%'))) " +
        "AND (:skill IS NULL OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :skill, '%'))) " +
        "AND (:location IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))")
        List<Users> searchUsers(@Param("name") String name,
                        @Param("skill") String skill,
                        @Param("location") String location);



}
