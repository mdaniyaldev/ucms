import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
