import React from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/sidebarComponents/Profile";
import BookCatalog from "./components/sidebarComponents/BookCatalog";
import Renew from "./components/sidebarComponents/Renew";
import ManageInventory from "./components/sidebarComponents/ManageInventory";
import IssuedTracker from "./components/sidebarComponents/IssuedTracker";
function App() {
  return (
    <>
      <BrowserRouter>
        <div className="Heading">
          <h1 style={{ color: "white" }}>Library Management</h1>
        </div>
        <Routes>
          {/* Define the path for your Login component */}

          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="student" ><StudentDashboard /></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRole="teacher" ><TeacherDashboard /></ProtectedRoute>} />
         
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>


          <Route path="/books" element={<ProtectedRoute ><BookCatalog /></ProtectedRoute>} />
          <Route path="/renew" element={<ProtectedRoute ><Renew /></ProtectedRoute>} />
          <Route path="/manage-inventory" element={<ProtectedRoute allowedRole="teacher" ><ManageInventory /></ProtectedRoute>} />
          <Route path="/issued-tracker" element={<ProtectedRoute allowedRole="teacher" ><IssuedTracker /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
