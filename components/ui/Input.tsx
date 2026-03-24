import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

export const Input = ({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-sans font-bold text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          "w-full rounded-lg border bg-background-secondary px-4 py-2.5",
          "font-sans text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-primary",
          "transition-colors duration-200",
          error
            ? "border-semantic-error focus:ring-semantic-error"
            : "border-background-secondary hover:border-accent",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm font-sans text-semantic-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
