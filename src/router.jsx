import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";      // ✅ NEW
import AuthLanding from "./components/AuthLanding";
import AdminComplaints from "./pages/AdminComplaints";

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
  // { path: "/signup", element: <Signup /> },

  // Authenticated (any logged-in user)
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <Dashboard /> }],
  },

  // Coordinator example
  {
    element: <RoleRoute allow={["coordinator"]} />,
    children: [{ path: "/coordinator", element: <div>Coordinator Panel</div> }],
  },

  // Admin-only routes
  {
    element: <RoleRoute allow={["admin"]} />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },  // overview
      { path: "/admin/users", element: <AdminUsers /> },  // manage users
      { path: "/admin/complaints", element: <AdminComplaints /> },  // manage complaints 
      // later:
      // { path: "/admin/departments", element: <AdminDepartments /> },
      // { path: "/admin/settings", element: <AdminSettings /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);