interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function Title({ children, className = "" }: TitleProps) {
  return (
    <h2
      className={`text-3xl font-bold text-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </h2>
  );
}
