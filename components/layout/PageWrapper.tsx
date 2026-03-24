import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div
      className={[
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
