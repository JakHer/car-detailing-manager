interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "menu" | "destructive" | "outline";
  size?: "sm" | "md" | "icon";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2
    rounded-md font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1
    cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1 text-sm"
      : size === "icon"
      ? "p-2 w-9 h-9"
      : "px-4 py-2 text-base";

  const variantClasses =
    variant === "primary"
      ? `bg-gray-800 hover:bg-gray-700 text-gray-100 
       dark:bg-gray-700 dark:hover:bg-gray-600`
      : variant === "secondary"
      ? `bg-gray-200 hover:bg-gray-300 text-gray-800 
       dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-600`
      : variant === "menu"
      ? `bg-transparent text-gray-100 hover:text-cyan-500 
       dark:hover:text-cyan-400`
      : variant === "destructive"
      ? `bg-red-600 hover:bg-red-700 text-gray-100 
       dark:bg-red-500 dark:hover:bg-red-700`
      : variant === "outline"
      ? `border border-gray-300 hover:bg-gray-100 
       dark:border-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100
       disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 
       dark:disabled:border-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-100`
      : "";

  return (
    <button
      className={`${base} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
}
