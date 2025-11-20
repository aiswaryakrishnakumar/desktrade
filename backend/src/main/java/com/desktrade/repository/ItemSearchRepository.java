package com.desktrade.repository;

import com.desktrade.model.Item;
import com.desktrade.model.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemSearchRepository extends JpaRepository<Item, Long> {

    @Query("select i from Item i where i.status = :status and i.active = true and " +
           "(lower(i.title) like lower(concat('%', :q, '%')) or lower(i.description) like lower(concat('%', :q, '%')))")
    Page<Item> searchActiveByText(ApprovalStatus status, String q, Pageable pageable);
}
