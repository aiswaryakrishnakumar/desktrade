// package com.desktrade.model;

// import jakarta.persistence.*;
// import lombok.*;

// import java.time.Instant;

// @Entity
// @Table(name = "messages")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class Message {

//     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "chat_id", nullable = false)
//     @ToString.Exclude
//     private Chat chat;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "sender_id", nullable = false)
//     @ToString.Exclude
//     private User sender;

//     @Column(length = 5000)
//     private String content;

//     @Builder.Default
//     @Column(name = "sent_at", nullable = false, updatable = false)
//     private Instant sentAt = Instant.now();

//     @Builder.Default
//     private boolean read = false;
// }
