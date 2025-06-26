package com.social_portfolio_db.demo.naveen.Controllers;

import com.social_portfolio_db.demo.naveen.ServicesImp.ResumeService;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final UserJpa userJpa;

    @GetMapping("/{id}/resume")
    public ResponseEntity<ByteArrayResource> downloadResume(@PathVariable Long id) {
        Users user = userJpa.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        byte[] pdfBytes = resumeService.generateResume(
            user.getUsername(),
            user.getBio(),
            user.getSkills().stream().map(skill -> skill.getSkillName()).toList()
        );

        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume.pdf");

        return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(pdfBytes.length)
            .body(resource);
    }
}
