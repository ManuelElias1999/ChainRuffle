import { motion } from 'motion/react';

export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0d] via-[#0d1512] to-[#0a0f0d]" />

      {/* Animated gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [0.8, 1.2, 0.8],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-emerald-500/20 blur-[140px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.3, 1],
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 15, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full bg-green-600/15 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [0.9, 1.4, 0.9],
          x: [0, 50, 0],
          y: [0, 80, 0],
        }}
        transition={{ duration: 18, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-teal-500/10 blur-[160px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [1, 1.1, 1],
          x: [0, -60, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 10, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-lime-500/12 blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: 0, y: 0 }}
        animate={{
          opacity: [0.2, 0.35, 0.2],
          scale: [0.7, 1.2, 0.7],
          x: [0, 70, 0],
          y: [0, -70, 0],
        }}
        transition={{ duration: 14, delay: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 left-1/3 w-[650px] h-[650px] rounded-full bg-emerald-600/18 blur-[130px]"
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            delay: i * 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            boxShadow: '0 0 10px 2px rgba(16, 185, 129, 0.3)',
          }}
        />
      ))}

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,95,70,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,15,13,0.8)_100%)]" />
    </div>
  );
}
