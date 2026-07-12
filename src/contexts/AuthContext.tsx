import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { dataSource } from "@/lib/dataSource";
import { getSupabase } from "@/lib/supabaseClient";

type Role = "organizer" | "admin" | null;

interface AuthIdentity {
  organizerId: string;
  organizerName: string;
}

type LoginResult = { ok: true; role: "organizer" | "admin" } | { ok: false; error: string };

interface AuthContextType {
  role: Role;
  // Which organizer is logged in (mock). Used to attribute event submissions and
  // scope the dashboard to "my events". null when logged out or admin.
  organizerId: string | null;
  organizerName: string | null;
  login: (role: "organizer" | "admin", identity?: AuthIdentity) => void;
  // Email+password login. Mock mode: same demo mapping as login() (admin email →
  // admin, anything else → demo organizer). Supabase mode: signInWithPassword;
  // role comes from app_metadata.role, organizerId from the organizers table.
  loginWithPassword: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

// Demo organizer that any non-admin login maps to (Trail Events Co. = org1).
const DEMO_ORGANIZER: AuthIdentity = { organizerId: "org1", organizerName: "Trail Events Co." };

const AuthContext = createContext<AuthContextType>({
  role: null,
  organizerId: null,
  organizerName: null,
  login: () => {},
  loginWithPassword: async () => ({ ok: false, error: "No AuthProvider" }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Supabase mode starts logged-out and restores the session async below;
  // mock mode keeps its localStorage persistence exactly as before.
  const [role, setRole] = useState<Role>(() =>
    dataSource === "supabase" ? null : ((localStorage.getItem("mt_role") as Role) ?? null)
  );
  const [organizerId, setOrganizerId] = useState<string | null>(() =>
    dataSource === "supabase" ? null : localStorage.getItem("mt_org_id")
  );
  const [organizerName, setOrganizerName] = useState<string | null>(() =>
    dataSource === "supabase" ? null : localStorage.getItem("mt_org_name")
  );

  // Map a supabase session onto the existing {role, organizerId} API: admin via
  // app_metadata.role, organizer identity via their organizers row (RLS lets an
  // authenticated organizer read their own row).
  const applySession = async (session: Session | null) => {
    if (!session) {
      setRole(null);
      setOrganizerId(null);
      setOrganizerName(null);
      return;
    }
    const isAdmin = session.user.app_metadata?.role === "admin";
    setRole(isAdmin ? "admin" : "organizer");
    if (isAdmin) {
      setOrganizerId(null);
      setOrganizerName(null);
      return;
    }
    const { data } = await getSupabase()
      .from("organizers")
      .select("id, organization_name")
      .eq("user_id", session.user.id)
      .maybeSingle();
    setOrganizerId(data?.id ?? null);
    setOrganizerName(data?.organization_name ?? null);
  };

  // Restore the supabase session on mount and follow auth changes.
  useEffect(() => {
    if (dataSource !== "supabase") return;
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => void applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // setTimeout: supabase-js warns against awaiting its own calls inside
      // this callback (deadlock) — defer to the next tick instead.
      setTimeout(() => void applySession(session), 0);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const loginWithPassword = async (email: string, password: string): Promise<LoginResult> => {
    if (dataSource !== "supabase") {
      const r = email.trim().toLowerCase() === "admin@mytrails.com" ? "admin" : "organizer";
      login(r);
      return { ok: true, role: r };
    }
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    // Apply eagerly so the post-login redirect sees the right role immediately
    // (onAuthStateChange will apply the same session again — idempotent).
    await applySession(data.session);
    return { ok: true, role: data.user?.app_metadata?.role === "admin" ? "admin" : "organizer" };
  };

  const logout = () => {
    if (dataSource === "supabase") void getSupabase().auth.signOut();
    setRole(null);
    setOrganizerId(null);
    setOrganizerName(null);
    localStorage.removeItem("mt_role");
    localStorage.removeItem("mt_org_id");
    localStorage.removeItem("mt_org_name");
  };

  return (
    <AuthContext.Provider value={{ role, organizerId, organizerName, login, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
