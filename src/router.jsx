import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AuthLanding from "./components/AuthLanding"; // <-- NEW

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">404 — Page not found</h1>
        <a className="text-sky-400 underline" href="/login">Go to Login</a>
      </div>
    </div>
  );
}

export default createBrowserRouter([
  // Root now decides where to go based on auth
  { path: "/", element: <AuthLanding />, errorElement: <NotFound /> },

  // Public auth pages
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // Authenticated area
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <Dashboard /> }],
  },

  // Coordinator example
  {
    element: <RoleRoute allow={["coordinator"]} />,
    children: [{ path: "/coordinator", element: <div>Coordinator Panel</div> }],
  },

  // Admin-only
  {
    element: <RoleRoute allow={["admin"]} />,
    children: [{ path: "/admin", element: <AdminDashboard /> }],
  },

  { path: "*", element: <NotFound /> },
]);