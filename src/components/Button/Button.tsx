interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "menu";
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = `px-4 py-2 rounded transition-colors duration-300 w-full sm:w-auto
    focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 cursor-pointer
    flex items-center justify-center gap-2`;

  const variantClasses =
    variant === "primary"
      ? `bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600`
      : variant === "secondary"
      ? `bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-500`
      : variant === "menu"
      ? `bg-transparent text-white hover:text-cyan-400 dark:text-white dark:hover:text-cyan-400`
      : "";

  return (
    <button className={`${base} ${variantClasses} ${className}`} {...props} />
  );
}
