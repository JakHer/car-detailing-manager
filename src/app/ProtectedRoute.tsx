import { observer } from "mobx-react-lite";
import { authStore } from "../stores/AuthStore";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, type JSX } from "react";

const ProtectedRoute = observer(({ children }: { children: JSX.Element }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!authStore.user && !authStore.loading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {showLoader || authStore.loading ? (
          <motion.div
            key="loader"
            className="absolute inset-0 flex items-center justify-center z-50 bg-gray-700"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!showLoader && authStore.user && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ProtectedRoute;
