import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Organizations from "./pages/Organizations";
import Settings from "./pages/Settings";

const Layout = () => (
  <div style={{ display: "flex", minHeight: "100vh", background: "#06060f" }}>
    <Sidebar />
    <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Outlet />
      </div>
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="users"         element={<Users />} />
            <Route path="analytics"     element={<Analytics />} />
            <Route path="organizations" element={<ProtectedRoute allowedRoles={["super_admin"]}><Organizations /></ProtectedRoute>} />
            <Route path="settings"      element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;