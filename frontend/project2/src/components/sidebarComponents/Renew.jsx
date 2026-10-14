import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import API from "../axios";
import "./Renew.css";

function Renew() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await API.get("/books/my-loans");
      setBorrowedBooks(response.data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to load borrowed books for renewal."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleRenew = async (recordId) => {
    try {
      setRenewingId(recordId);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await API.post(`/books/loans/${recordId}/renew`);

      // Update the loan in state with the new due date and incremented renewal count
      setBorrowedBooks((prev) =>
        prev.map((item) =>
          item.id === recordId
            ? {
                ...item,
                dueDate: response.data.newDueDate,
                renewalCount: response.data.renewalCount,
              }
            : item
        )
      );

      setSuccessMessage(response.data.message || "Book renewed successfully by 7 days!");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to renew the book.");
    } finally {
      setRenewingId(null);
    }
  };

  const getDaysRemaining = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="renew-layout">
      <Sidebar />

      <main className="renew-main">
        <header className="renew-header">
          <div>
            <h2>Renew Books</h2>
            <p className="subtitle">
              Extend your borrowing period by 7 days. Each book can be renewed up to 2 times.
            </p>
          </div>
        </header>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert danger">{errorMessage}</div>}

        {loading ? (
          <p className="loading-state">Loading your borrowed books...</p>
        ) : borrowedBooks.length === 0 ? (
          <div className="empty-state">
            <p>You currently do not have any borrowed books to renew.</p>
          </div>
        ) : (
          <div className="renew-table-wrapper">
            <table className="renew-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Renewals</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.map((record) => {
                  const daysLeft = getDaysRemaining(record.dueDate);
                  const isOverdue = daysLeft < 0;
                  const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
                  const maxReached = record.renewalCount >= 2;
                  const isProcessing = renewingId === record.id;

                  return (
                    <tr key={record.id} className={isOverdue ? "row-overdue" : ""}>
                      <td className="book-cell">
                        <div className="table-cover-preview">
                          {record.book?.coverUrl ? (
                            <img src={record.book.coverUrl} alt={record.book.title} />
                          ) : (
                            <div className="cover-initial">
                              {record.book?.title ? record.book.title.charAt(0) : "B"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="table-book-title">{record.book?.title}</div>
                          <div className="table-book-author">by {record.book?.author}</div>
                        </div>
                      </td>
                      <td>{record.borrowDate}</td>
                      <td>
                        <span className={`due-date-text ${isOverdue ? "text-danger" : ""}`}>
                          {record.dueDate}
                        </span>
                      </td>
                      <td>
                        {isOverdue ? (
                          <span className="badge overdue">Overdue by {Math.abs(daysLeft)}d</span>
                        ) : isDueSoon ? (
                          <span className="badge warning">Due in {daysLeft}d</span>
                        ) : (
                          <span className="badge active">{daysLeft} days left</span>
                        )}
                      </td>
                      <td>
                        <span className="renewal-counter">
                          {record.renewalCount} / 2
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="renew-btn"
                          onClick={() => handleRenew(record.id)}
                          disabled={maxReached || isProcessing}
                        >
                          {isProcessing
                            ? "Renewing..."
                            : maxReached
                            ? "Limit Reached"
                            : "Renew (+7 Days)"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Renew;