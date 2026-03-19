import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 24, text: "text-xl" },
    lg: { icon: 32, text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
        <Mountain className="text-primary-foreground" size={sizes[size].icon} />
      </div>
      <span className={`font-bold text-foreground ${sizes[size].text}`}>
        My Trails
      </span>
    </div>
  );
};

export default Logo;
