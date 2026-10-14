package com.application.quiz.BookCatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUsernameAndStatus(String username, String status);
    Optional<BorrowRecord> findByUsernameAndBookIdAndStatus(String username, Long bookId, String status);

    List<BorrowRecord> findByStatus(String status);
}