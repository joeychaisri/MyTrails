import { createContext, useContext, useState, ReactNode } from "react";

type Role = "organizer" | "admin" | null;

interface AuthIdentity {
  organizerId: string;
  organizerName: string;
}

interface AuthContextType {
  role: Role;
  // Which organizer is logged in (mock). Used to attribute event submissions and
  // scope the dashboard to "my events". null when logged out or admin.
  organizerId: string | null;
  organizerName: string | null;
  login: (role: "organizer" | "admin", identity?: AuthIdentity) => void;
  logout: () => void;
}

// Demo organizer that any non-admin login maps to (Trail Events Co. = org1).
const DEMO_ORGANIZER: AuthIdentity = { organizerId: "org1", organizerName: "Trail Events Co." };

const AuthContext = createContext<AuthContextType>({
  role: null,
  organizerId: null,
  organizerName: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("mt_role") as Role) ?? null
  );
  const [organizerId, setOrganizerId] = useState<string | null>(
    () => localStorage.getItem("mt_org_id")
  );
  const [organizerName, setOrganizerName] = useState<string | null>(
    () => localStorage.getItem("mt_org_name")
  );

  const login = (r: "organizer" | "admin", identity?: AuthIdentity) => {
    setRole(r);
    localStorage.setItem("mt_role", r);
    if (r === "organizer") {
      const id = identity ?? DEMO_ORGANIZER;
      setOrganizerId(id.organizerId);
      setOrganizerName(id.organizerName);
      localStorage.setItem("mt_org_id", id.organizerId);
      localStorage.setItem("mt_org_name", id.organizerName);
    } else {
      setOrganizerId(null);
      setOrganizerName(null);
      localStorage.removeItem("mt_org_id");
      localStorage.removeItem("mt_org_name");
    }
  };

  const logout = () => {
    setRole(null);
    setOrganizerId(null);
    setOrganizerName(null);
    localStorage.removeItem("mt_role");
    localStorage.removeItem("mt_org_id");
    localStorage.removeItem("mt_org_name");
  };

  return (
    <AuthContext.Provider value={{ role, organizerId, organizerName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
