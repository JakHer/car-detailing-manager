import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Button from "../components/Button/Button";
import { HiSun, HiMoon, HiHome, HiUsers, HiClipboard } from "react-icons/hi";
import { HiCog, HiTruck, HiWrench } from "react-icons/hi2";
import { motion } from "framer-motion";
import { authStore } from "../stores/AuthStore";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    { path: "/", label: "Dashboard", icon: HiHome },
    { path: "/clients", label: "Klienci", icon: HiUsers },
    { path: "/cars", label: "Samochody", icon: HiTruck },
    { path: "/services", label: "Usługi", icon: HiWrench },
    { path: "/orders", label: "Zlecenia", icon: HiClipboard },
    ...(authStore.profile?.role === "admin"
      ? [{ path: "/admin", label: "Admin Panel", icon: HiCog }]
      : []),
  ];

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg flex items-center gap-3 font-semibold relative overflow-hidden group ${
          isActive
            ? "bg-gray-800 dark:bg-gray-700"
            : "hover:bg-gray-700 dark:hover:bg-gray-700"
        }`
      }
    >
      <motion.div
        className="flex-shrink-0 relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <item.icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-[0_0_2px_theme(colors.indigo.400/0.6)]" />
      </motion.div>
      <motion.span
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {item.label}
      </motion.span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0" // Reduced opacity for subtler shine
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%", opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </NavLink>
  );

  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 dark:bg-gray-800 text-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-6">CarDetailing</h1>
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="space-y-2 mt-4 border-t border-gray-700 pt-4">
          {authStore.profile && (
            <div className="text-sm text-gray-400 mb-2">
              {authStore.profile.role === "admin" ? "Admin" : "User"}
            </div>
          )}
          <div>
            <Button
              variant="menu"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 w-full justify-start"
            >
              <motion.span
                key={darkMode ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  scale: 1.2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {darkMode ? (
                  <HiSun className="w-5 h-5 text-yellow-400 transition-colors duration-200" />
                ) : (
                  <HiMoon className="w-5 h-5 text-gray-300 transition-colors duration-200" />
                )}
              </motion.span>
              <p className="text-gray-100">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </p>
            </Button>
          </div>

          <div>
            <Button
              variant="menu"
              onClick={() => {
                toast.success("Pomyślnie wylogowano");
                authStore.logout();
              }}
              className="flex items-center gap-2 w-full justify-start text-gray-300"
            >
              <FiLogOut className="w-5 h-5" />
              <p className="text-gray-100">Logout</p>
            </Button>
          </div>
        </div>
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 dark:bg-gray-800 text-gray-100 flex items-center justify-between p-2">
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
        className={`md:hidden fixed top-12 left-0 right-0 z-40 bg-gray-900 dark:bg-gray-800 text-gray-100 overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        } max-h-[80vh]`}
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          {authStore.profile && (
            <div className="text-sm text-gray-400 py-2">
              {authStore.profile.role === "admin" ? "Admin" : "User"}
            </div>
          )}

          <div>
            <Button
              variant="menu"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 w-full justify-start"
            >
              <motion.span
                key={darkMode ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  scale: 1.2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {darkMode ? (
                  <HiSun className="w-5 h-5 text-yellow-400 transition-colors duration-200" />
                ) : (
                  <HiMoon className="w-5 h-5 text-gray-300 transition-colors duration-200" />
                )}
              </motion.span>
              <p className="text-gray-100">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </p>
            </Button>
          </div>

          <div>
            <Button
              variant="menu"
              onClick={() => {
                toast.success("Pomyślnie wylogowano");
                authStore.logout();
              }}
              className="flex items-center gap-2 w-full justify-start text-gray-300"
            >
              <FiLogOut className="w-5 h-5" />
              <p className="text-gray-100">Logout</p>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto mt-12 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
