package com.application.quiz.BookCatalog;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherLibraryController {

    private final BookService bookService;

    public TeacherLibraryController(BookService bookService) {
        this.bookService = bookService;
    }

    // Global Tracker: View every borrowed book across the entire college
    @GetMapping("/issued-tracker")
    public ResponseEntity<List<BorrowRecord>> getIssuedTracker() {
        return ResponseEntity.ok(bookService.getAllActiveLoans());
    }

    // Manage Inventory: Add a brand new book title
    @PostMapping("/inventory")
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.addNewBook(book));
    }

    // Manage Inventory: Adjust physical copy counts (+ or -)
    @PatchMapping("/inventory/{bookId}/stock")
    public ResponseEntity<Book> adjustStock(
            @PathVariable Long bookId,
            @RequestParam int delta
    ) {
        return ResponseEntity.ok(bookService.updateStock(bookId, delta));
    }
}