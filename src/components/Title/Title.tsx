interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title = ({ children, className = "" }: TitleProps) => {
  return (
    <h2
      className={`text-3xl font-bold text-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </h2>
  );
};

export default Title;
