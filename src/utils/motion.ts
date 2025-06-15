// This file re-exports specific named exports from framer-motion
// to avoid the "export *" error in client components
import {
  motion,
  AnimatePresence,
  useAnimation,
  useScroll,
  useTransform,
  useMotionValue,
  useInView,
  useSpring,
  useReducedMotion,
  useCycle,
} from 'framer-motion';

import type {
  MotionProps,
  Transition,
  Variants,
} from 'framer-motion';

// Re-export all needed components and hooks with explicit named exports
export {
  motion,
  AnimatePresence,
  useAnimation,
  useScroll,
  useTransform,
  useMotionValue,
  useInView,
  useSpring,
  useReducedMotion,
  useCycle
};

// Re-export types
export type {
  MotionProps,
  Transition,
  Variants,
};
