import React from "react";

type BadgeVariant = "default" | "success" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-background-secondary text-text-secondary border border-background-secondary",
  success:
    "bg-semantic-success/10 text-semantic-success border border-semantic-success/30",
  accent: "bg-accent/10 text-accent-light border border-accent/30",
};

export const Badge = ({
  variant = "default",
  children,
  className = "",
}: BadgeProps) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5",
        "text-xs font-sans font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;
