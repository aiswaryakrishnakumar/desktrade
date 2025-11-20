// package com.desktrade.repository;

// import com.desktrade.model.Chat;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.Optional;
// import java.util.List;

// @Repository
// public interface ChatRepository extends JpaRepository<Chat, Long> {
//     List<Chat> findByBuyerIdOrSellerId(Long buyerId, Long sellerId);
//     Optional<Chat> findByBuyerIdAndSellerIdAndItemId(Long buyerId, Long sellerId, Long itemId);
// }
