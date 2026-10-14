package com.application.quiz.BookCatalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BookService(BookRepository bookRepository, BorrowRecordRepository borrowRecordRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecord> getUserBorrowedBooks(String username) {
        return borrowRecordRepository.findByUsernameAndStatus(username, "BORROWED");
    }

    @Transactional
    public BorrowRecord borrowBook(Long bookId, String username) {
        // Prevent duplicate active borrows of the exact same book by the same user
        if (borrowRecordRepository.findByUsernameAndBookIdAndStatus(username, bookId, "BORROWED").isPresent()) {
            throw new BookUnavailableException("You already have an active loan for this book!");
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        int rowsUpdated = bookRepository.decrementAvailableCopiesIfAvailable(bookId);
        if (rowsUpdated == 0) {
            throw new BookUnavailableException("Sorry, no copies are currently available for this book.");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);

        LocalDate now = LocalDate.now();
        LocalDate due = now.plusDays(14); // 14-day loan period

        BorrowRecord record = new BorrowRecord(
                null,
                username,
                book,
                now,
                due,
                null,
                0,
                "BORROWED"
        );

        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord renewBook(Long recordId, String username) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + recordId));

        if (!record.getUsername().equalsIgnoreCase(username)) {
            throw new BookUnavailableException("You are not authorized to renew this loan.");
        }

        if (!"BORROWED".equals(record.getStatus())) {
            throw new BookUnavailableException("Cannot renew a book that is already returned.");
        }

        // Limit to 2 renewals max
        if (record.getRenewalCount() >= 2) {
            throw new BookUnavailableException("Maximum renewal limit (2 times) reached for this loan.");
        }

        // Extend due date by 7 days from the current due date
        record.setDueDate(record.getDueDate().plusDays(7));
        record.setRenewalCount(record.getRenewalCount() + 1);

        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long recordId, String username) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + recordId));

        if (!record.getUsername().equalsIgnoreCase(username)) {
            throw new BookUnavailableException("You are not authorized to return this loan.");
        }

        if ("RETURNED".equals(record.getStatus())) {
            throw new BookUnavailableException("This book has already been marked as returned.");
        }

        record.setStatus("RETURNED");
        record.setReturnDate(LocalDate.now());

        // Increment available stock
        bookRepository.incrementAvailableCopies(record.getBook().getId());

        return borrowRecordRepository.save(record);
    }

    // 1. Global Issued Tracker (All active loans across all students/teachers)
    @Transactional(readOnly = true)
    public List<BorrowRecord> getAllActiveLoans() {
        return borrowRecordRepository.findByStatus("BORROWED");
    }

    // 2. Add New Book to Inventory
    @Transactional
    public Book addNewBook(Book book) {
        if (book.getAvailableCopies() == 0 && book.getTotalCopies() > 0) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    // 3. Update Existing Book Inventory Copies
    @Transactional
    public Book updateStock(Long bookId, int totalCopiesDelta) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        int newTotal = book.getTotalCopies() + totalCopiesDelta;
        int newAvailable = book.getAvailableCopies() + totalCopiesDelta;

        if (newTotal < 0 || newAvailable < 0) {
            throw new BookUnavailableException("Cannot reduce stock below currently borrowed copies.");
        }

        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);
        return bookRepository.save(book);
    }
    @Transactional
    public Book addBook(Book book) {
        if (book.getAvailableCopies() == 0 && book.getTotalCopies() > 0) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    @Transactional
    public Book adjustStock(Long bookId, int delta) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        int newTotal = book.getTotalCopies() + delta;
        int newAvailable = book.getAvailableCopies() + delta;

        if (newTotal < 0 || newAvailable < 0) {
            throw new BookUnavailableException("Cannot reduce stock below currently borrowed copies.");
        }

        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        // Check if there are active loans
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new BookUnavailableException("Cannot delete book while copies are currently issued to students.");
        }

        bookRepository.delete(book);
    }
    @Transactional
    public void returnBookAtDesk(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan record not found with ID: " + recordId));

        if ("RETURNED".equalsIgnoreCase(record.getStatus())) {
            throw new BookUnavailableException("This book has already been marked as returned.");
        }

        record.setStatus("RETURNED");
        record.setReturnDate(LocalDate.now());

        // Increment available copies atomically in the books table
        bookRepository.incrementAvailableCopies(record.getBook().getId());

        borrowRecordRepository.save(record);
    }
}