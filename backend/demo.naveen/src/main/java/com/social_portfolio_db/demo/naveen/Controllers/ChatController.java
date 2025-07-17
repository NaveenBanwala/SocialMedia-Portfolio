package com.social_portfolio_db.demo.naveen.Controllers;

import com.social_portfolio_db.demo.naveen.Entity.ChatMessage;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.ChatMessageRepository;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private UserJpa userJpa;

    // Get chat history between two users
    @GetMapping("/history/{userId1}/{userId2}")
    public List<ChatMessageDTO> getChatHistory(@PathVariable Long userId1, @PathVariable Long userId2) {
        return chatMessageRepository.findBySenderIdOrReceiverIdOrderByTimestampAsc(userId1, userId2)
            .stream()
            .filter(msg -> (msg.getSender().getId() == userId1 && msg.getReceiver().getId() == userId2) ||
                           (msg.getSender().getId() == userId2 && msg.getReceiver().getId() == userId1))
            .map(ChatMessageDTO::new)
            .toList();
    }

    // DTO for chat messages
    public static class ChatMessageDTO {
        public Long id;
        public Long senderId;
        public Long receiverId;
        public String content;
        public java.time.LocalDateTime timestamp;
        public ChatMessageDTO(ChatMessage msg) {
            this.id = msg.getId();
            this.senderId = msg.getSender().getId();
            this.receiverId = msg.getReceiver().getId();
            this.content = msg.getContent();
            this.timestamp = msg.getTimestamp();
        }
    }
} 