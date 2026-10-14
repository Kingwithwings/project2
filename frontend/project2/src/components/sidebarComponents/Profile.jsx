import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar";
import "./Profile.css";

const API_BASE_URL = "http://localhost:8080/api/users/profile";

function Profile() {
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    email: "",
    dept: "",
    semester: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = response.data;
        setFormData({
          username: data.username || "",
          role: data.role || "",
          email: data.email || "",
          dept: data.dept || "",
          semester: data.semester != null ? data.semester : "",
        });
      } catch (err) {
        if (axios.isCancel(err)) return;
        setErrorMessage(
          err.response?.status === 403
            ? "Session expired or unauthorized (403). Please log in again."
            : "Failed to load profile details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Authentication token missing. Please log in.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put(
        API_BASE_URL,
        {
          username: formData.username.trim(),
          email: formData.email.trim(),
          dept: formData.dept.trim(),
          semester: formData.semester ? parseInt(formData.semester, 10) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      setStatusMessage("Profile details updated successfully!");

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.username) {
        localStorage.setItem("username", data.username);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data;
      if (err.response?.status === 409 && typeof serverMsg === "string") {
        setErrorMessage(serverMsg);
      } else {
        setErrorMessage("Failed to update profile. Please verify your data.");
      }
    } finally {
      setSaving(false);
    }
  };

  const isStudent = formData.role?.toLowerCase() === "student";

  return (
    <div className="profile-layout">
      <Sidebar />

      <main className="profile-main">
        <header className="profile-header">
          <h2>Academic Profile</h2>
          <p className="subtitle">View and update your registered account details.</p>
        </header>

        {loading ? (
          <p className="loading-indicator">Retrieving your profile...</p>
        ) : (
          <>
            {statusMessage && <div className="alert success">{statusMessage}</div>}
            {errorMessage && <div className="alert danger">{errorMessage}</div>}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Assigned Role</label>
                <input
                  id="role"
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dept">Department / Major</label>
                <input
                  id="dept"
                  type="text"
                  name="dept"
                  placeholder="e.g. Computer Science"
                  value={formData.dept}
                  onChange={handleChange}
                  required
                />
              </div>

              {isStudent && (
                <div className="form-group">
                  <label htmlFor="semester">Current Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;