import React, { useState } from "react";
import "./BookCard.css";

function BookCard({ book, onBorrow, isBorrowing }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isAvailable = book.availableCopies > 0;

  return (
    <article className="book-card">
      <div className="card-media">
        {book.coverUrl && !imageFailed ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="book-cover-img"
            onError={() => setImageFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="cover-fallback">
            <span className="fallback-initial">{book.title ? book.title.charAt(0) : "B"}</span>
            <small className="fallback-genre">{book.genre}</small>
          </div>
        )}

        <span className={`stock-pill ${isAvailable ? "in-stock" : "out-of-stock"}`}>
          {isAvailable ? `${book.availableCopies} Available` : "Out of Stock"}
        </span>
      </div>

      <div className="card-content">
        <span className="genre-tag">{book.genre || "General"}</span>
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-description">
          {book.description || "No description available for this book."}
        </p>
      </div>

      <div className="card-footer">
        <small className="book-isbn">ISBN: {book.isbn || "N/A"}</small>
        <button
          type="button"
          onClick={() => onBorrow(book.id)}
          disabled={!isAvailable || isBorrowing}
          className="borrow-btn"
        >
          {isBorrowing ? "Borrowing..." : isAvailable ? "Borrow Book" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

export default BookCard;