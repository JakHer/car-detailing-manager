import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Button from "../components/Button/Button";
import { HiSun, HiMoon } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const enabled = saved !== null ? saved === "true" : prefersDark;
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("darkMode", newValue.toString());
  };

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/clients", label: "Klienci" },
    { path: "/services", label: "Usługi" },
    { path: "/orders", label: "Zlecenia" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 dark:bg-gray-800 text-white p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">CarDetailing</h1>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-800 dark:bg-gray-700 font-semibold" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Dark mode toggle */}
        <div className="mt-6">
          <Button
            variant="menu"
            onClick={toggleDarkMode}
            className="flex items-center gap-2"
          >
            <span className="relative w-5 h-5 flex-shrink-0">
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-0 left-0 w-5 h-5"
                  >
                    <HiSun className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-0 left-0 w-5 h-5"
                  >
                    <HiMoon className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </aside>

      {/* Mobile Hamburger & dropdown */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 dark:bg-gray-800 text-white flex items-center justify-between p-2">
        <h1 className="text-xl font-bold">CarDetailing</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          className="p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <nav
        className={`md:hidden fixed top-12 left-0 right-0 z-40 bg-gray-900 dark:bg-gray-800 text-white overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        } max-h-[80vh]`}
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-800 dark:bg-gray-700 font-semibold" : ""
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mobile Dark mode toggle */}
          <div className="mt-2">
            <Button
              variant="menu"
              onClick={toggleDarkMode}
              className="flex items-center gap-2"
            >
              <span className="relative w-5 h-5 flex-shrink-0">
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.span
                      key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-0 left-0 w-5 h-5"
                    >
                      <HiSun className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ rotate: -90, opacity: 0, scale: 0 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-0 left-0 w-5 h-5"
                    >
                      <HiMoon className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto mt-12 md:mt-0">
        {children}
      </main>
    </div>
  );
}
