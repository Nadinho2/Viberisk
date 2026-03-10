import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = () => {
  const { user, loading, bootstrap } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      void bootstrap();
    }
  }, [user, bootstrap]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

