import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // admin dashboard or general dashboard
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AuthLanding from "./components/AuthLanding";
import AdminComplaints from "./pages/AdminComplaints";
import AdminDepartments from "./pages/AdminDepartments";
import AdminAnalytics from "./pages/AdminAnalytics";
import { StudentDashboard } from "./pages/StudentDashboard";
import StudentLayout from "./components/student/StudentLayout";
import { SubmitComplaintForm } from "./components/student/SubmitComplaintForm";
import { MyComplaints } from "./pages/MyComplaints";
import CoordinatorLayout from "./components/coordinator/CoordinatorLayout";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CoordinatorComplaints from "./pages/CoordinatorComplaints";
import CoordinatorFeedback from "./pages/CoordinatorFeedback";
import AdminFeedback from "./pages/AdminFeedback";
import { Navigate } from "react-router-dom";
// Faculty imports
import FacultyLayout from "./components/faculty/FacultyLayout";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { FacultyComplaints } from "./pages/FacultyComplaints";
import { FacultySubmitComplaintForm } from "./components/faculty/FacultySubmitComplaintForm";

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">404 — Page not found</h1>
        <a className="text-sky-400 underline" href="/login">
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default createBrowserRouter([
  // Root decides where to go based on auth
  { path: "/", element: <AuthLanding />, errorElement: <NotFound /> },

  // Public auth pages
  { path: "/login", element: <Login /> },

  // Authenticated routes (any logged-in user)
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <Dashboard /> }]  // Admin route
  },

  // Role-based routes for students
  {
    element: <RoleRoute allow={["student"]} />,
    children: [
      {
        path: "/student-dashboard",
        element: <StudentLayout><StudentDashboard /></StudentLayout>
      },
      {
        path: "/student/submit-complaint",
        element: <StudentLayout><SubmitComplaintForm /></StudentLayout>
      },
      {
        path: "/student/complaints",
        element: <StudentLayout><MyComplaints /></StudentLayout>
      },
    ],
  },

  // Role-based routes for coordinators
  {
    element: <RoleRoute allow={["coordinator"]} />,
    children: [
      {
        path: "/coordinator/dashboard",
        element: <CoordinatorLayout><CoordinatorDashboard /></CoordinatorLayout>
      },
      {
        path: "/coordinator/complaints",
        element: <CoordinatorLayout><CoordinatorComplaints /></CoordinatorLayout>
      },
      {
        path: "/coordinator/feedback",
        element: <CoordinatorLayout><CoordinatorFeedback /></CoordinatorLayout>
      },
      // Redirect /coordinator to dashboard
      { path: "/coordinator", element: <Navigate to="/coordinator/dashboard" replace /> },
    ],
  },

  // Role-based routes for faculty
  {
    element: <RoleRoute allow={["faculty"]} />,
    children: [
      {
        path: "/faculty/dashboard",
        element: <FacultyLayout><FacultyDashboard /></FacultyLayout>
      },
      {
        path: "/faculty/submit-complaint",
        element: <FacultyLayout><FacultySubmitComplaintForm /></FacultyLayout>
      },
      {
        path: "/faculty/complaints",
        element: <FacultyLayout><FacultyComplaints /></FacultyLayout>
      },
      // Redirect /faculty to dashboard
      { path: "/faculty", element: <Navigate to="/faculty/dashboard" replace /> },
    ],
  },

  // Admin-only routes
  {
    element: <RoleRoute allow={["admin"]} />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/users", element: <AdminUsers /> },
      { path: "/admin/complaints", element: <AdminComplaints /> },
      { path: "/admin/departments", element: <AdminDepartments /> },
      { path: "/admin/analytics", element: <AdminAnalytics /> },
      { path: "/admin/feedback", element: <AdminFeedback /> },
    ],
  },

  // Catch-all route for 404
  { path: "*", element: <NotFound /> },
]);
