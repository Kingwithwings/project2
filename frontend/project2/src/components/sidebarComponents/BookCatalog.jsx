import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import API from "../axios";
import BookCard from "./BookCard";
import "./BookCatalog.css";

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [borrowingId, setBorrowingId] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await API.get("/books");
        setBooks(response.data);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "Failed to load book catalog from server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    try {
      setBorrowingId(bookId);
      setAlertMessage("");
      setErrorMessage("");

      const response = await API.post(`/books/${bookId}/borrow`);

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId
            ? { ...book, availableCopies: Math.max(0, book.availableCopies - 1) }
            : book
        )
      );

      setAlertMessage(response.data.message || "Book borrowed successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage("Conflict: The last copy was just borrowed by another user.");
        setBooks((prevBooks) =>
          prevBooks.map((b) => (b.id === bookId ? { ...b, availableCopies: 0 } : b))
        );
      } else {
        setErrorMessage(
          err.response?.data?.message || "Failed to borrow the book. Please try again."
        );
      }
    } finally {
      setBorrowingId(null);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "ALL" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="catalog-layout">
      <Sidebar />

      <main className="catalog-main">
        <header className="catalog-header">
          <div>
            <h2>Library Catalog</h2>
            <p className="subtitle">Discover, search, and borrow books from the collection.</p>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="genre-select"
            >
              <option value="ALL">All Genres</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Literature">Literature</option>
            </select>
          </div>
        </header>

        {alertMessage && <div className="alert success">{alertMessage}</div>}
        {errorMessage && <div className="alert danger">{errorMessage}</div>}

        {loading ? (
          <p className="loading-state">Loading book catalog from Open Library...</p>
        ) : (
          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p className="empty-message">No books match your criteria.</p>
            ) : (
              filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={handleBorrow}
                  isBorrowing={borrowingId === book.id}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookCatalog;