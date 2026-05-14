import React from "react";

// ——— ICON ———
interface IconProps {
  d: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ d, size = 16, strokeWidth = 2, fill = "none", style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={style}
    dangerouslySetInnerHTML={{ __html: d }}
  />
);

export const ICONS: Record<string, string> = {
  mountain:       '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  calendar:       '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin:            '<path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock:          '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  award:          '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 21l-5-3-5 3 1.5-7.5"/>',
  users:          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card:           '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  chevRight:      '<polyline points="9 18 15 12 9 6"/>',
  chevDown:       '<polyline points="6 9 12 15 18 9"/>',
  search:         '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check:          '<polyline points="20 6 9 17 4 12"/>',
  send:           '<path d="m22 2-7 20-4-9-9-4 20-7z"/>',
  trendUp:        '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  clipboardCheck: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
};

interface IProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}
export const I: React.FC<IProps> = ({ name, ...rest }) => (
  <Icon d={ICONS[name] || ""} {...rest} />
);

// ——— BUTTON ———
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: string;
  rightIcon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary", size = "md", children, leftIcon, rightIcon,
  className = "", style, ...rest
}) => {
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary:     { background: "hsl(var(--mt-brand))", color: "#fff" },
    secondary:   { background: "hsl(var(--mt-muted))", color: "hsl(var(--mt-fg))" },
    outline:     { background: "transparent", color: "hsl(var(--mt-fg))", border: "1px solid hsl(var(--mt-border))" },
    ghost:       { background: "transparent", color: "hsl(var(--mt-fg))" },
    destructive: { background: "hsl(var(--mt-danger,0 84% 60%))", color: "#fff" },
  };
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm:   { height: 36, padding: "0 12px", fontSize: 13 },
    md:   { height: 40, padding: "0 16px", fontSize: 14 },
    lg:   { height: 44, padding: "0 24px", fontSize: 15 },
    icon: { width: 40, height: 40, padding: 0, justifyContent: "center" },
  };
  return (
    <button
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: 10, border: 0, fontWeight: 500, fontFamily: "var(--mt-font-sans)",
        cursor: "pointer", whiteSpace: "nowrap", transition: "opacity .15s",
        ...variantStyles[variant], ...sizeStyles[size], ...style,
      }}
      {...rest}
    >
      {leftIcon && <I name={leftIcon} size={size === "lg" ? 18 : 14} />}
      {children}
      {rightIcon && <I name={rightIcon} size={14} />}
    </button>
  );
};

// ——— LOGO ———
type LogoSize = "sm" | "md" | "lg";

export const Logo: React.FC<{ size?: LogoSize }> = ({ size = "md" }) => {
  const cfg = {
    sm: { tile: 28, icon: 16, text: 16, gap: 8 },
    md: { tile: 36, icon: 22, text: 20, gap: 8 },
    lg: { tile: 48, icon: 28, text: 24, gap: 10 },
  }[size];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: cfg.gap }}>
      <div style={{
        width: cfg.tile, height: cfg.tile, borderRadius: 10,
        background: "hsl(var(--mt-brand))",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      }}>
        <I name="mountain" size={cfg.icon} />
      </div>
      <span style={{
        font: `700 ${cfg.text}px/1 var(--mt-font-sans)`,
        color: "hsl(var(--mt-fg))", letterSpacing: "-0.01em",
      }}>
        My Trails
      </span>
    </div>
  );
};

// ——— ICON DISC ———
export const IconDisc: React.FC<{ name: string; size?: number; color?: "brand" | "neutral" }> = ({
  name, size = 40, color = "brand",
}) => {
  const fg = color === "brand" ? "hsl(var(--mt-brand))" : "hsl(var(--mt-fg))";
  const bg = color === "brand" ? "hsl(var(--mt-brand) / .1)" : "hsl(var(--mt-muted))";
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: bg, color: fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <I name={name} size={size * 0.5} />
    </div>
  );
};

// ——— PROGRESS BAR ———
export const ProgressBar: React.FC<{ value: number; max?: number; height?: number }> = ({
  value, max = 100, height = 8,
}) => (
  <div style={{ height, background: "hsl(var(--mt-muted))", borderRadius: 9999, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${(value / max) * 100}%`,
      background: "hsl(var(--mt-brand))", transition: "width .3s",
    }} />
  </div>
);
