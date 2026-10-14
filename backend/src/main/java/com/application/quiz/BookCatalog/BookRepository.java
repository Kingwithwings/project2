package com.application.quiz.BookCatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByGenreIgnoreCase(String genre);

    @Modifying
    
    @Query("UPDATE Book b SET b.availableCopies = b.availableCopies - 1 WHERE b.id = :bookId AND b.availableCopies > 0")
    int decrementAvailableCopiesIfAvailable(@Param("bookId") Long bookId);

    @Modifying
     
    @Query("UPDATE Book b SET b.availableCopies = b.availableCopies + 1 WHERE b.id = :bookId AND b.availableCopies < b.totalCopies")
    int incrementAvailableCopies(@Param("bookId") Long bookId);

}