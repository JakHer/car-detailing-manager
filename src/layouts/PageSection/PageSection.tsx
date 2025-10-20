import React from "react";
import Title from "../../components/Title/Title";

interface PageSectionProps {
  title?: string;
  action?: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export default function PageSection({
  title,
  action,
  cols = 3,
  children,
  className = "",
}: PageSectionProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <section className={`space-y-4 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center">
          {title && <Title>{title}</Title>}
          {action && <div>{action}</div>}
        </div>
      )}

      <div className={`grid ${gridCols} gap-4`}>{children}</div>
    </section>
  );
}
