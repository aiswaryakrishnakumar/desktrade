// package com.desktrade.service;

// import com.desktrade.dto.ChatMessageDto;
// import com.desktrade.exception.BadRequestException;
// import com.desktrade.exception.ResourceNotFoundException;
// import com.desktrade.exception.ForbiddenException;
// import com.desktrade.model.*;
// import com.desktrade.repository.*;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.*;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.Instant;
// import java.util.List;

// @Service
// @RequiredArgsConstructor
// public class ChatService {
//     private final ChatRepository chatRepository;
//     private final MessageRepository messageRepository;
//     private final ItemRepository itemRepository;
//     private final UserRepository userRepository;

//     /**
//      * Get or create a chat between buyer (caller) and the seller of an item.
//      * If a chat already exists for buyer+seller+item, return that one.
//      */
//     @Transactional
//     public Chat getOrCreateChatForItem(String buyerEmail, Long itemId) {
//         User buyer = userRepository.findByEmail(buyerEmail)
//                 .orElseThrow(() -> new ResourceNotFoundException("Buyer not found: " + buyerEmail));
//         Item item = itemRepository.findById(itemId)
//                 .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
//         User seller = item.getSeller();
//         if (seller == null) throw new ResourceNotFoundException("Seller not found for item: " + itemId);

//         return chatRepository.findByBuyerIdAndSellerIdAndItemId(buyer.getId(), seller.getId(), itemId)
//                 .orElseGet(() -> {
//                     Chat c = Chat.builder()
//                             .buyer(buyer)
//                             .seller(seller)
//                             .item(item)
//                             .createdAt(Instant.now())
//                             .updatedAt(Instant.now())
//                             .build();
//                     return chatRepository.save(c);
//                 });
//     }

//     /**
//      * Save a message to a chat; senderEmail must represent a participant (buyer or seller).
//      */
//     @Transactional
//     public Message sendMessage(String senderEmail, Long chatId, String content) {
//         if (content == null || content.isBlank()) throw new BadRequestException("Message content required");
//         Chat chat = chatRepository.findById(chatId)
//                 .orElseThrow(() -> new ResourceNotFoundException("Chat not found: " + chatId));
//         User sender = userRepository.findByEmail(senderEmail)
//                 .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderEmail));

//         boolean isParticipant = (chat.getBuyer() != null && sender.getId().equals(chat.getBuyer().getId()))
//                 || (chat.getSeller() != null && sender.getId().equals(chat.getSeller().getId()));
//         if (!isParticipant) throw new ForbiddenException("Sender is not a participant in this chat");

//         Message m = Message.builder()
//                 .chat(chat)
//                 .sender(sender)
//                 .content(content)
//                 .sentAt(Instant.now())
//                 .read(false)
//                 .build();
//         Message saved = messageRepository.save(m);

//         chat.setUpdatedAt(Instant.now());
//         chatRepository.save(chat);

//         return saved;
//     }

//     public Page<Message> listMessages(Long chatId, Pageable p) {
//         return messageRepository.findByChatIdOrderBySentAtAsc(chatId, p);
//     }

//     public List<Chat> listChatsForUser(String userEmail) {
//         User u = userRepository.findByEmail(userEmail)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
//         return chatRepository.findByBuyerIdOrSellerId(u.getId(), u.getId());
//     }
// }
