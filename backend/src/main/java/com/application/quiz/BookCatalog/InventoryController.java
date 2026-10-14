package com.application.quiz.BookCatalog;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final BookService bookService;

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;

    public InventoryController(BookService bookService, BorrowRecordRepository borrowRecordRepository, BookRepository bookRepository) {
        this.bookService = bookService;
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public ResponseEntity<List<Book>> getAllInventory() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @PostMapping
    public ResponseEntity<Book> addNewBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.addBook(book));
    }

    // Supports both POST and PATCH with clear parameter binding
    @PostMapping("/{bookId}/stock")
    public ResponseEntity<Book> updateStock(
            @PathVariable Long bookId,
            @RequestParam(name = "delta", defaultValue = "1") int delta
    ) {
        return ResponseEntity.ok(bookService.adjustStock(bookId, delta));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeBook(@PathVariable Long bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully from inventory."));
    }

    // GET /api/inventory/issued-tracker
    @GetMapping("/issued-tracker")
    public ResponseEntity<List<BorrowRecord>> getIssuedTracker() {
        return ResponseEntity.ok(bookService.getAllActiveLoans());
    }

    // POST /api/inventory/loans/{recordId}/return
    @PostMapping("/loans/{recordId}/return")
    public ResponseEntity<?> returnBookAtDesk(@PathVariable Long recordId) {
        bookService.returnBookAtDesk(recordId);
        return ResponseEntity.ok(Map.of("message", "Book successfully checked in and restored to inventory."));
    }
}