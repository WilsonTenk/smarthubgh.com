import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  width,
  style,
  onClick
}) => {

  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      initial={reduceMotion ? false : { y: 10, opacity: 1 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.4, 0, 0.2, 1], delay: reduceMotion ? 0 : Math.min(delay, 0.12) }}
      className={`animated-section ${className}`}
      style={{
        ...(width ? { width } : {}),
        ...style,
        // CSS hover transitions must not re-animate Motion's transform on every frame.
        transitionProperty: 'color, background-color, border-color, box-shadow'
      }}
    >
      {children}
    </motion.div>
  );
};
