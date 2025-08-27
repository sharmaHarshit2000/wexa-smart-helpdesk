import { Navigate } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen text-gray-700">
    <h1 className="text-6xl font-bold mb-4">404</h1>
    <p className="text-xl mb-4">Page Not Found</p>
    <Navigate to="/tickets" replace />
  </div>
);

export default NotFound;
