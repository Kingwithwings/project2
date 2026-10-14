import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import API from "../axios";
import "./ManageInventory.css";

function ManageInventory() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "Computer Science",
    isbn: "",
    totalCopies: 1,
    coverUrl: "",
    description: "",
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await API.get("/inventory");
      setBooks(response.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: name === "totalCopies" ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        ...newBook,
        availableCopies: newBook.totalCopies,
      };

      const response = await API.post("/inventory", payload);
      setBooks((prev) => [response.data, ...prev]);
      setSuccessMessage("New book added to library inventory!");

      // Reset form
      setNewBook({
        title: "",
        author: "",
        genre: "Computer Science",
        isbn: "",
        totalCopies: 1,
        coverUrl: "",
        description: "",
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to add book.");
    }
  };

  const handleStockChange = async (bookId, delta) => {
    try {
      setActionId(bookId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await API.post(`/inventory/${bookId}/stock?delta=${delta}`);
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? response.data : b))
      );
      setSuccessMessage(`Stock updated for ${response.data.title}`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to adjust stock.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from inventory?`)) {
      return;
    }

    try {
      setActionId(bookId);
      setErrorMessage("");
      setSuccessMessage("");

      await API.delete(`/inventory/${bookId}`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setSuccessMessage(`"${title}" was removed from the catalog.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to delete book.");
    } finally {
      setActionId(null);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="inventory-layout">
      <Sidebar />

      <main className="inventory-main">
        <header className="inventory-header">
          <div>
            <h2>Manage Inventory</h2>
            <p className="subtitle">Add new titles, monitor stock levels, and adjust copy counts.</p>
          </div>
        </header>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert danger">{errorMessage}</div>}

        {/* Add Book Form Card */}
        <section className="add-book-section">
          <h3>Add New Book to Catalog</h3>
          <form className="add-book-form" onSubmit={handleAddBook}>
            <div className="form-grid">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Computer Networking"
                  value={newBook.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="e.g., Kurose & Ross"
                  value={newBook.author}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Genre *</label>
                <select name="genre" value={newBook.genre} onChange={handleInputChange}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Literature">Literature</option>
                </select>
              </div>

              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  placeholder="e.g., 978-0133594140"
                  value={newBook.isbn}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Initial Copies *</label>
                <input
                  type="number"
                  name="totalCopies"
                  min="1"
                  required
                  value={newBook.totalCopies}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cover Image URL (Optional)</label>
                <input
                  type="url"
                  name="coverUrl"
                  placeholder="https://..."
                  value={newBook.coverUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Summary / Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="Brief summary..."
                  value={newBook.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              + Add to Catalog
            </button>
          </form>
        </section>

        {/* Existing Inventory Table */}
        <section className="inventory-table-section">
          <div className="table-controls">
            <h3>Current Stock Ledger ({filteredBooks.length} items)</h3>
            <input
              type="text"
              placeholder="Filter by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-search"
            />
          </div>

          {loading ? (
            <p className="loading-state">Loading stock records...</p>
          ) : (
            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Title & Author</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Available / Total</th>
                    <th>Adjust Copies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => {
                    const isProcessing = actionId === book.id;
                    const isLow = book.availableCopies <= 1;

                    return (
                      <tr key={book.id}>
                        <td className="book-meta-cell">
                          <div className="inventory-cover-preview">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt={book.title} />
                            ) : (
                              <div className="inv-initial">{book.title.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <strong>{book.title}</strong>
                            <div className="sub-text">{book.author}</div>
                          </div>
                        </td>
                        <td>
                          <span className="genre-pill">{book.genre}</span>
                        </td>
                        <td>
                          <span className="mono-text">{book.isbn || "N/A"}</span>
                        </td>
                        <td>
                          <span className={`stock-indicator ${isLow ? "low-stock" : "healthy-stock"}`}>
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </td>
                        <td>
                          <div className="stepper-controls">
                            <button
                              type="button"
                              onClick={() => handleStockChange(book.id, -1)}
                              disabled={isProcessing || book.availableCopies <= 0}
                              className="stepper-btn minus"
                              title="Remove a copy"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockChange(book.id, 1)}
                              disabled={isProcessing}
                              className="stepper-btn plus"
                              title="Add a copy"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            disabled={isProcessing}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageInventory;