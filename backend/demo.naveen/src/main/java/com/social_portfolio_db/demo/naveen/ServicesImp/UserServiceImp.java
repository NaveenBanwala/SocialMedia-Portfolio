
package com.social_portfolio_db.demo.naveen.ServicesImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Mappers.UserProfileMapper;
import com.social_portfolio_db.demo.naveen.Services.UserService;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserJpa userJpa;

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        Users user = userJpa.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found" + userId));
        
        return UserProfileMapper.toDto(user);
    }
}
