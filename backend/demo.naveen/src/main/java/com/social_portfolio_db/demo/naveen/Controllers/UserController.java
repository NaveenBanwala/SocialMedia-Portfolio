package com.social_portfolio_db.demo.naveen.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_portfolio_db.demo.naveen.Dtos.UserProfileDTO;
import com.social_portfolio_db.demo.naveen.ServicesImp.UserServiceImp;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserServiceImp userServiceImp;


    @GetMapping("/users/{id}")
        public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        UserProfileDTO profile = userServiceImp.getUserProfile(id);
            return ResponseEntity.ok(profile);

}

}
