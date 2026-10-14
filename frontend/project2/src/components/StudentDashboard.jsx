import React from "react";
import "./StudentDashboard.css";
import Sidebar from "./Sidebar";
function StudentDashboard() {
  return (
    <>
      <div className="student-dashboard">
        <Sidebar/>
        <p>This is where students can access their courses, assignments, and grades.</p>
      </div>
    </>
  );
}
export default StudentDashboard;
