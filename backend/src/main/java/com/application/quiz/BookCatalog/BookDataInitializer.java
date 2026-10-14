package com.application.quiz.BookCatalog;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

// @Component
// public class BookDataInitializer implements CommandLineRunner {

//     private final BookRepository bookRepository;
//     private final RestTemplate restTemplate = new RestTemplate();

//     public BookDataInitializer(BookRepository bookRepository) {
//         this.bookRepository = bookRepository;
//     }

//     @Override
//     @SuppressWarnings("unchecked")
//     public void run(String... args) {
//         if (bookRepository.count() > 0) {
//             return;
//         }

//         String[] subjects = {"computer_science", "mathematics", "physics", "literature"};
//         String[] displayGenres = {"Computer Science", "Mathematics", "Physics", "Literature"};
//         Random random = new Random();
//         List<Book> booksToSave = new ArrayList<>();

//         for (int i = 0; i < subjects.length; i++) {
//             String subject = subjects[i];
//             String genre = displayGenres[i];
//             String url = "https://openlibrary.org/subjects/" + subject + ".json?limit=8";

//             try {
//                 Map<String, Object> response = restTemplate.getForObject(url, Map.class);
//                 if (response != null && response.containsKey("works")) {
//                     List<Map<String, Object>> works = (List<Map<String, Object>>) response.get("works");

//                     for (Map<String, Object> work : works) {
//                         String title = work.containsKey("title") ? work.get("title").toString() : "Untitled";

//                         String author = "Unknown Author";
//                         if (work.containsKey("authors")) {
//                             List<Map<String, Object>> authors = (List<Map<String, Object>>) work.get("authors");
//                             if (authors != null && !authors.isEmpty()) {
//                                 author = authors.get(0).getOrDefault("name", "Unknown Author").toString();
//                             }
//                         }

//                         String key = work.containsKey("key") ? work.get("key").toString().replace("/works/", "") : String.valueOf(System.nanoTime());
//                         String isbn = "OL-" + key;

//                         String coverUrl = null;
//                         if (work.containsKey("cover_id") && work.get("cover_id") != null) {
//                             coverUrl = "https://covers.openlibrary.org/b/id/" + work.get("cover_id").toString() + "-M.jpg";
//                         }

//                         String description = "A notable work in " + genre + " by " + author + ".";

//                         int totalCopies = random.nextInt(5) + 1;
//                         int availableCopies = random.nextInt(totalCopies + 1);

//                         booksToSave.add(new Book(
//                                 null,
//                                 title,
//                                 author,
//                                 genre,
//                                 isbn,
//                                 description,
//                                 coverUrl,
//                                 totalCopies,
//                                 availableCopies
//                         ));
//                     }
//                 }
//             } catch (Exception e) {
//                 System.err.println("Could not seed from Open Library for " + subject + ": " + e.getMessage());
//             }
//         }

//         if (!booksToSave.isEmpty()) {
//             bookRepository.saveAll(booksToSave);
//             System.out.println(">>> Seeded " + booksToSave.size() + " books with covers from Open Library.");
//         }
//     }
// }