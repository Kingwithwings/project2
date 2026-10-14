import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  

  // Debugging log - open browser console (F12) to inspect these values
  console.log("ProtectedRoute check:", { token: !!token, userRole, allowedRole });

  // 1. Not logged in -> kick to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Role mismatch check
  if (allowedRole && userRole !== allowedRole) {
    // If student tries to access teacher dashboard, send to student dashboard
    if (userRole === "student") {
      return <Navigate to="/dashboard" replace />;
    }
    // If teacher/admin tries to access student dashboard, send to teacher dashboard
    if (userRole === "teacher" ) {
      return <Navigate to="/teacher-dashboard" replace />;
    }
    // Fallback if role is unassigned or corrupt
    return <Navigate to="/" replace />;
  }

  // 3. Authorized -> display the component
  return children;
}

export default ProtectedRoute;