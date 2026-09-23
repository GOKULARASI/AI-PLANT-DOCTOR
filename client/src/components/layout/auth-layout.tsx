import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen w-full flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative w-full overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #022c22, #064e3b, #047857)' }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute text-4xl" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`, opacity: 0.3 + Math.random() * 0.4,
            }}>🌿</div>
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <Leaf className="w-10 h-10 text-emerald-300" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4">PlantSense AI</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-emerald-200 text-lg max-w-md">
            Smart Plant Disease Detection & Care Platform powered by Artificial Intelligence
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-12 flex gap-8 justify-center text-emerald-300 text-sm">
            <div className="text-center"><div className="text-2xl font-bold text-white">10K+</div>Plants Scanned</div>
            <div className="text-center"><div className="text-2xl font-bold text-white">98%</div>Accuracy</div>
            <div className="text-center"><div className="text-2xl font-bold text-white">50+</div>Diseases</div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
