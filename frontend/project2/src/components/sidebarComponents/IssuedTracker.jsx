import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import API from "../axios";
import "./IssuedTracker.css";

function IssuedTracker() {
  const [issuedRecords, setIssuedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, OVERDUE, ACTIVE

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await API.get("/inventory/issued-tracker");
      setIssuedRecords(response.data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to load issued book records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const handleDeskReturn = async (recordId, bookTitle, studentName) => {
    if (!window.confirm(`Confirm return of "${bookTitle}" from student "${studentName}"?`)) {
      return;
    }

    try {
      setActionId(recordId);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await API.post(`/inventory/loans/${recordId}/return`);
      setSuccessMessage(response.data.message || "Book checked in successfully!");

      // Remove from active tracker ledger
      setIssuedRecords((prev) => prev.filter((item) => item.id !== recordId));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to process return.");
    } finally {
      setActionId(null);
    }
  };

  const calculateDays = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredRecords = issuedRecords.filter((record) => {
    const matchesSearch =
      record.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.book?.isbn && record.book.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

    const daysRemaining = calculateDays(record.dueDate);
    const isOverdue = daysRemaining < 0;

    if (statusFilter === "OVERDUE") return matchesSearch && isOverdue;
    if (statusFilter === "ACTIVE") return matchesSearch && !isOverdue;
    return matchesSearch;
  });

  const overdueCount = issuedRecords.filter(
    (r) => calculateDays(r.dueDate) < 0
  ).length;

  return (
    <div className="tracker-layout">
      <Sidebar />

      <main className="tracker-main">
        <header className="tracker-header">
          <div>
            <h2>Issued Books Tracker</h2>
            <p className="subtitle">
              Campus-wide checkouts, due date oversight, and front-desk returns.
            </p>
          </div>

          <div className="summary-badges">
            <span className="summary-pill total">
              Total Checked Out: <strong>{issuedRecords.length}</strong>
            </span>
            <span className={`summary-pill ${overdueCount > 0 ? "alert-overdue" : "ok"}`}>
              Overdue: <strong>{overdueCount}</strong>
            </span>
          </div>
        </header>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert danger">{errorMessage}</div>}

        <div className="tracker-filter-bar">
          <input
            type="text"
            placeholder="Search by student username, book title, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tracker-search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="tracker-status-select"
          >
            <option value="ALL">All Loans</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="ACTIVE">Within Due Date</option>
          </select>
        </div>

        {loading ? (
          <p className="loading-state">Loading campus checkout records...</p>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-tracker">
            <p>No active loan records match your criteria.</p>
          </div>
        ) : (
          <div className="tracker-table-container">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Student / Borrower</th>
                  <th>Book Details</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Loan Status</th>
                  <th>Renewals</th>
                  <th>Desk Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const daysRemaining = calculateDays(record.dueDate);
                  const isOverdue = daysRemaining < 0;
                  const isProcessing = actionId === record.id;

                  return (
                    <tr key={record.id} className={isOverdue ? "overdue-row" : ""}>
                      <td className="borrower-cell">
                        <span className="user-avatar">
                          {record.username.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{record.username}</strong>
                          <div className="sub-role">Student</div>
                        </div>
                      </td>

                      <td className="book-cell">
                        <div className="tracker-thumb">
                          {record.book?.coverUrl ? (
                            <img src={record.book.coverUrl} alt={record.book.title} />
                          ) : (
                            <div className="thumb-fallback">
                              {record.book?.title ? record.book.title.charAt(0) : "B"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="table-book-title">{record.book?.title}</span>
                          <span className="table-book-isbn">
                            ISBN: {record.book?.isbn || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td>{record.borrowDate}</td>

                      <td>
                        <span className={`due-date-val ${isOverdue ? "text-danger" : ""}`}>
                          {record.dueDate}
                        </span>
                      </td>

                      <td>
                        {isOverdue ? (
                          <span className="status-badge overdue">
                            Overdue ({Math.abs(daysRemaining)}d)
                          </span>
                        ) : daysRemaining <= 3 ? (
                          <span className="status-badge warning">
                            Due in {daysRemaining}d
                          </span>
                        ) : (
                          <span className="status-badge active">
                            Active ({daysRemaining}d left)
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="renew-count-pill">
                          {record.renewalCount} / 2
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="checkin-btn"
                          disabled={isProcessing}
                          onClick={() =>
                            handleDeskReturn(
                              record.id,
                              record.book?.title,
                              record.username
                            )
                          }
                        >
                          {isProcessing ? "Processing..." : "Mark Returned"}
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

export default IssuedTracker;