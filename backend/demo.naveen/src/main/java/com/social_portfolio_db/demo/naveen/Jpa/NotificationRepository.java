package com.social_portfolio_db.demo.naveen.Jpa;

import com.social_portfolio_db.demo.naveen.Entity.Notification;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(Users user);
} 