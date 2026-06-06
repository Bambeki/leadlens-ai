import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 hover:shadow-violet-500/30 focus-visible:ring-violet-500",
  secondary:
    "border border-saas-border bg-saas-card text-slate-300 hover:border-violet-500/40 hover:bg-white/5 hover:text-white focus-visible:ring-violet-500",
  ghost:
    "text-slate-400 hover:bg-white/5 hover:text-white focus-visible:ring-violet-500",
  success:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 focus-visible:ring-emerald-500",
  danger:
    "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 focus-visible:ring-red-500",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-saas-bg disabled:cursor-not-allowed disabled:opacity-60 disabled:text-slate-500 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
