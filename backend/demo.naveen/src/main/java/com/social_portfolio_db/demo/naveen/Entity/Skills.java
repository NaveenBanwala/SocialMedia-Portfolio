package com.social_portfolio_db.demo.naveen.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// CREATE TABLE skills (
//     id BIGINT AUTO_INCREMENT PRIMARY KEY,
//     user_id BIGINT,
//     skill_name VARCHAR(50),
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// );
@Entity
@Table(name = "skills")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Skills {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "skill_name", nullable = false, length = 50)
    private String skillName;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
}
