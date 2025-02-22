import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { publicRoutes, clientRoutes, writerRoutes, adminRoutes } from '../lib/routes';
import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';
import { useScrollToTop } from '../lib/hooks/useScrollToTop';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 10,
  },
};

// Page transition configuration
const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.2,
};

export default function AppRouter() {
  const location = useLocation();
  useScrollToTop();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Public Routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Protected Client Routes */}
          {clientRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRole="client">
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Protected Writer Routes */}
          {writerRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRole="writer">
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Protected Admin Routes */}
          {adminRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <AdminProtectedRoute>
                  {element}
                </AdminProtectedRoute>
              }
            />
          ))}

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}