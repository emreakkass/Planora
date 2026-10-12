import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, CheckCircle2 } from 'lucide-react';

interface AnimatedCheckButtonProps {
  isCompleted: boolean;
  onToggle: () => void;
  title?: string;
  variant?: 'icon' | 'badge';
  className?: string;
}

export function AnimatedCheckButton({
  isCompleted,
  onToggle,
  title = 'Tamamlandı olarak işaretle',
  variant = 'icon',
  className = '',
}: AnimatedCheckButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [justToggled, setJustToggled] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 500);
    onToggle();
  };

  if (variant === 'badge') {
    return (
      <motion.button
        type="button"
        onClick={handleClick}
        title={title}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        className={`relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
          isCompleted
            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400'
            : 'border border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
        } ${className}`}
      >
        {/* Kısa yeşil parlama dalgası */}
        {justToggled && !shouldReduceMotion && (
          <motion.span
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 bg-emerald-400/30 rounded-xl pointer-events-none"
          />
        )}

        <motion.span
          key={isCompleted ? 'checked' : 'unchecked'}
          initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="flex items-center"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-500' : ''}`} />
        </motion.span>
        <span>{isCompleted ? 'Tamamlandı' : 'Tamamla'}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      title={title}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
        isCompleted
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25'
          : 'text-[var(--text-muted)] hover:text-emerald-600 hover:bg-emerald-500/10'
      } ${className}`}
    >
      {/* Yeşil parlama efekti */}
      {justToggled && !shouldReduceMotion && (
        <motion.span
          initial={{ opacity: 0.9, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 bg-emerald-400/40 rounded-lg pointer-events-none"
        />
      )}

      <motion.span
        key={isCompleted ? 'completed-tick' : 'idle-tick'}
        initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="flex items-center justify-center"
      >
        <Check className="w-4 h-4" />
      </motion.span>
    </motion.button>
  );
}
