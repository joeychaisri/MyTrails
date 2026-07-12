// Single switch for where the platform store gets its data.
// "mock" (default) — in-memory + localStorage seeds, exactly the pre-Supabase
// behavior. "supabase" — hydrate/mutate through supabase-js (opt-in via
// VITE_DATA_SOURCE=supabase). Storybook and vitest force "mock" in their configs.
export type DataSource = "mock" | "supabase";

export const dataSource: DataSource =
  import.meta.env.VITE_DATA_SOURCE === "supabase" ? "supabase" : "mock";
