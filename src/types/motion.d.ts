// This file defines types for motion components used in the project
declare module '@/utils/motion' {
  export const motion: {
    [key: string]: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }>
  };
  export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: 'sync' | 'wait' | 'popLayout' }>;
  export const useAnimation: () => { start: (options: Record<string, unknown>) => Promise<void> };
  export const useMotionValue: <T>(initial: T) => { get: () => T; set: (v: T) => void; };
  export const useTransform: <T, U>(value: { get: () => T }, transformer: (v: T) => U) => { get: () => U };
  export const useScroll: () => { scrollY: { get: () => number; set: (v: number) => void; } };
  export const useSpring: <T>(initial: T) => { get: () => T; set: (v: T) => void; };
  export const useCycle: <T>(...args: T[]) => [T, (index?: number) => void];
}
