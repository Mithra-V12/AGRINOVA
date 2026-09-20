import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "clay";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-canopy text-husk hover:bg-forest shadow-sm shadow-forest/20",
  secondary: "bg-sprout-light text-forest hover:bg-sprout",
  outline: "border-2 border-canopy text-canopy bg-transparent hover:bg-canopy hover:text-husk",
  ghost: "bg-transparent text-forest hover:bg-husk-dim",
  clay: "bg-clay text-forest-dark hover:bg-clay-dark hover:text-husk",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-3.5 py-2 gap-1.5",
  md: "text-[15px] px-5 py-2.5 gap-2",
  lg: "text-base px-7 py-3.5 gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
