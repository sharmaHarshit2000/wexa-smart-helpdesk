import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketList from "../pages/TicketList";
import CreateTicket from "../pages/CreateTicket";
import TicketDetail from "../pages/TicketDetail";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import NotFound from "../pages/Notfound";

const RoutesConfig = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/tickets" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* User Protected Routes */}
    <Route
      path="/tickets"
      element={
        <ProtectedRoute>
          <TicketList />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tickets/new"
      element={
        <ProtectedRoute>
          <CreateTicket />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tickets/:id"
      element={
        <ProtectedRoute>
          <TicketDetail />
        </ProtectedRoute>
      }
    />

    {/* Admin Routes */}
    <Route
      path="/admin/kb"
      element={
        <AdminRoute>
          <div>Knowledge Base Management (Coming Soon)</div>
        </AdminRoute>
      }
    />
    <Route
      path="/admin/config"
      element={
        <AdminRoute>
          <div>Configuration (Coming Soon)</div>
        </AdminRoute>
      }
    />

    {/* Catch-All 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default RoutesConfig;
