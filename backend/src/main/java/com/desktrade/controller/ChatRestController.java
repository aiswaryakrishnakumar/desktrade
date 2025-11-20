// package com.desktrade.controller;

// import com.desktrade.dto.ChatMessageDto;
// import com.desktrade.model.Chat;
// import com.desktrade.model.Message;
// import com.desktrade.service.ChatService;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.*;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.security.Principal;
// import java.util.List;

// @RestController
// @RequestMapping("/api/chats")
// @RequiredArgsConstructor
// public class ChatRestController {
//     private final ChatService chatService;

//     @Operation(summary = "Get or create chat for an item (authenticated)", security = @SecurityRequirement(name = "bearerAuth"))
//     @PostMapping("/for-item/{itemId}")
//     public ResponseEntity<Chat> getOrCreateChat(@PathVariable Long itemId, Principal principal) {
//         Chat c = chatService.getOrCreateChatForItem(principal.getName(), itemId);
//         return ResponseEntity.ok(c);
//     }

//     @Operation(summary = "List chats for current user", security = @SecurityRequirement(name = "bearerAuth"))
//     @GetMapping("/me")
//     public ResponseEntity<List<Chat>> myChats(Principal principal) {
//         List<Chat> chats = chatService.listChatsForUser(principal.getName());
//         return ResponseEntity.ok(chats);
//     }

//     @Operation(summary = "List messages for a chat (authenticated)", security = @SecurityRequirement(name = "bearerAuth"))
//     @GetMapping("/{chatId}/messages")
//     public ResponseEntity<Page<Message>> listMessages(@PathVariable Long chatId,
//                                                       @RequestParam(defaultValue = "0") int page,
//                                                       @RequestParam(defaultValue = "50") int size) {
//         Page<Message> p = chatService.listMessages(chatId, PageRequest.of(page, size));
//         return ResponseEntity.ok(p);
//     }

//     @Operation(summary = "Send a message to chat (also used by WebSocket layer)", security = @SecurityRequirement(name = "bearerAuth"))
//     @PostMapping("/{chatId}/messages")
//     public ResponseEntity<Message> sendMessage(@PathVariable Long chatId, @RequestBody ChatMessageDto req, Principal principal) {
//         Message saved = chatService.sendMessage(principal.getName(), chatId, req.getContent());
//         return ResponseEntity.ok(saved);
//     }
// }
