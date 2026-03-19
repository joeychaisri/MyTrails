import { createContext, useContext, useState, ReactNode } from "react";

type Role = "organizer" | "admin" | null;

interface AuthContextType {
  role: Role;
  login: (role: "organizer" | "admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("mt_role") as Role) ?? null
  );

  const login = (r: "organizer" | "admin") => {
    setRole(r);
    localStorage.setItem("mt_role", r);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("mt_role");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
