package com.social_portfolio_db.demo.naveen.ServicesImp;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.kernel.pdf.PdfDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class ResumeService {

    public byte[] generateResume(String username, String bio, java.util.List<String> skills) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.add(new Paragraph("Resume of " + username).setBold().setFontSize(20));
            document.add(new Paragraph("Bio: " + bio));
            document.add(new Paragraph("Skills:"));
            for (String skill : skills) {
                document.add(new Paragraph("- " + skill));
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating resume", e);
        }
    }

    public byte[] generateResume(String username, String bio, java.util.List<String> skills, String email, String location, java.util.List<com.social_portfolio_db.demo.naveen.Entity.Projects> projects) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.add(new Paragraph("Resume of " + username).setBold().setFontSize(20));
            document.add(new Paragraph("Email: " + (email != null ? email : "N/A")));
            document.add(new Paragraph("Location: " + (location != null ? location : "N/A")));
            document.add(new Paragraph("Bio: " + (bio != null ? bio : "N/A")));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Skills:").setBold());
            if (skills != null && !skills.isEmpty()) {
                for (String skill : skills) {
                    document.add(new Paragraph("- " + skill));
                }
            } else {
                document.add(new Paragraph("No skills listed."));
            }
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Projects:").setBold());
            if (projects != null && !projects.isEmpty()) {
                for (com.social_portfolio_db.demo.naveen.Entity.Projects project : projects) {
                    document.add(new Paragraph("- " + (project.getTitle() != null ? project.getTitle() : "Untitled")));
                    if (project.getDescription() != null && !project.getDescription().isEmpty()) {
                        document.add(new Paragraph("    Description: " + project.getDescription()));
                    }
                    if (project.getCreatedAt() != null) {
                        document.add(new Paragraph("    Created At: " + project.getCreatedAt().toString()));
                    }
                    document.add(new Paragraph(" "));
                }
            } else {
                document.add(new Paragraph("No projects listed."));
            }
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating detailed resume", e);
        }
    }
}
