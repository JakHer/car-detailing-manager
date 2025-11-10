import React from "react";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

const ButtonGroup = ({
  children,
  className = "",
  align = "left",
}: ButtonGroupProps) => {
  const alignment =
    align === "center"
      ? "justify-center"
      : align === "right"
      ? "justify-end"
      : "justify-start";

  return (
    <div
      className={`flex flex-nowrap gap-2 mt-2 mr-2 mb-2 overflow-x-auto ${alignment} ${className}`}
    >
      {children}
    </div>
  );
};

export default ButtonGroup;
