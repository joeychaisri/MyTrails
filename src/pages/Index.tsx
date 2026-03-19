import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { role } = useAuth();
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default Index;
