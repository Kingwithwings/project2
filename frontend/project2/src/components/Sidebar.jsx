import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const rawRole = (localStorage.getItem("role") || "student").toLowerCase().trim();
  const username = localStorage.getItem("username") || "User";
  const isTeacher = rawRole === "teacher" || rawRole === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>LibraryHub</h2>
        <span className={`badge ${isTeacher ? 'badge-teacher' : 'badge-student'}`}>
          {isTeacher ? 'Teacher / Admin' : 'Student / Member'}
        </span>
      </div>

      <nav className="sidebar-menu">
        {isTeacher ? (
          <>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Profile
            </NavLink>
             <NavLink to="/books" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Catalog Books
            </NavLink>
            <NavLink to="/renew" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Renew & Dues
            </NavLink>
            <NavLink to="/manage-inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Manage Inventory
            </NavLink>
            <NavLink to="/issued-tracker" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Issued Tracker
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Profile
            </NavLink>
            <NavLink to="/books" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Catalog Books
            </NavLink>
            <NavLink to="/renew" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Renew & Dues
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-details">
          <small>Signed in as</small>
          <strong>{username}</strong>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;