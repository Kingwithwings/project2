package com.application.quiz.BookCatalog;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Helper method to safely extract authenticated username
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BookUnavailableException("You must be logged in to perform this action.");
        }
        return auth.getName(); // Extracts the exact subject/username from the JWT
    }

    @GetMapping
    public ResponseEntity<List<Book>> getCatalog() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<BorrowRecord>> getMyLoans() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(bookService.getUserBorrowedBooks(username));
    }

    @PostMapping("/{bookId}/borrow")
    public ResponseEntity<?> borrowBook(@PathVariable Long bookId) {
        String username = getCurrentUsername();
        BorrowRecord record = bookService.borrowBook(bookId, username);

        return ResponseEntity.ok(Map.of(
                "message", "Book borrowed successfully!",
                "recordId", record.getId(),
                "dueDate", record.getDueDate().toString(),
                "remainingCopies", record.getBook().getAvailableCopies()
        ));
    }

    @PostMapping("/loans/{recordId}/renew")
    public ResponseEntity<?> renewBook(@PathVariable Long recordId) {
        String username = getCurrentUsername();
        BorrowRecord updated = bookService.renewBook(recordId, username);

        return ResponseEntity.ok(Map.of(
                "message", "Book renewed successfully by 7 days!",
                "newDueDate", updated.getDueDate().toString(),
                "renewalCount", updated.getRenewalCount()
        ));
    }

    @PostMapping("/loans/{recordId}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long recordId) {
        String username = getCurrentUsername();
        bookService.returnBook(recordId, username);

        return ResponseEntity.ok(Map.of(
                "message", "Book returned successfully!"
        ));
    }
}