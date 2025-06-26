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
}
