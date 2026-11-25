import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin_ui/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-app text-text-primary flex flex-col font-sans">
      <AdminNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
