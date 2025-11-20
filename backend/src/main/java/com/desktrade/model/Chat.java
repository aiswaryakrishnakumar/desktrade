// package com.desktrade.model;

// import jakarta.persistence.*;
// import lombok.*;

// import java.time.Instant;
// import java.util.List;

// @Entity
// @Table(name = "chats",
//        indexes = {@Index(name = "idx_chat_item_buyer_seller", columnList = "item_id, buyer_id, seller_id")})
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class Chat {

//     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     /**
//      * buyer is the user who bought (or intends to buy) — can be null if chat initiated by seller
//      */
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "buyer_id")
//     @ToString.Exclude
//     private User buyer;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "seller_id", nullable = false)
//     @ToString.Exclude
//     private User seller;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "item_id")
//     @ToString.Exclude
//     private Item item; // optional: chat about a particular item

//     @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
//     @ToString.Exclude
//     private List<Message> messages;

//     @Builder.Default
//     @Column(name = "created_at", nullable = false, updatable = false)
//     private Instant createdAt = Instant.now();

//     @Builder.Default
//     @Column(name = "updated_at", nullable = false)
//     private Instant updatedAt = Instant.now();

//     @PreUpdate
//     protected void onUpdate() {
//         this.updatedAt = Instant.now();
//     }
// }
