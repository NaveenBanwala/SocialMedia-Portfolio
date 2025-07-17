package com.social_portfolio_db.demo.naveen.Controllers.Admin;

import com.social_portfolio_db.demo.naveen.Entity.DashboardImage;
import com.social_portfolio_db.demo.naveen.Jpa.DashboardImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard-images")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardImageAdminController {
    @Autowired
    private DashboardImageRepository dashboardImageRepository;

    private final String UPLOAD_DIR = "uploads/dashboard/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDashboardImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }
        // Delete old dashboard image if exists
        List<DashboardImage> allImages = dashboardImageRepository.findAll();
        for (DashboardImage img : allImages) {
            // Delete file from disk
            try {
                Path filePath = Paths.get("uploads/dashboard/" + img.getUrl().substring(img.getUrl().lastIndexOf("/") + 1));
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                // ignore file delete error
            }
            dashboardImageRepository.delete(img);
        }
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filepath = Paths.get(UPLOAD_DIR, filename);
        Files.write(filepath, file.getBytes());
        String url = "/images/dashboard/" + filename;
        DashboardImage img = DashboardImage.builder()
                .url(url)
                .uploadedAt(LocalDateTime.now())
                .build();
        dashboardImageRepository.save(img);
        return ResponseEntity.ok(img);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDashboardImage(@PathVariable Long id) {
        DashboardImage img = dashboardImageRepository.findById(id).orElse(null);
        if (img == null) return ResponseEntity.notFound().build();
        // Delete file from disk
        try {
            Path filePath = Paths.get("." + img.getUrl());
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // ignore file delete error
        }
        dashboardImageRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // Get the current dashboard image (only one)
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<DashboardImage> getCurrentDashboardImage() {
        List<DashboardImage> allImages = dashboardImageRepository.findAll();
        if (allImages.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Return the latest uploaded image
        DashboardImage latest = allImages.stream()
            .max((a, b) -> a.getUploadedAt().compareTo(b.getUploadedAt()))
            .orElse(null);
        return ResponseEntity.ok(latest);
    }
} 