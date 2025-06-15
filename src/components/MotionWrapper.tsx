"use client";

import { motion as m } from "framer-motion";
import { ReactNode } from "react";

// Re-export motion components as client components
export function MotionDiv(props: {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  className?: string;
  style?: React.CSSProperties;
  layoutId?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return <m.div {...props}>{props.children}</m.div>;
}

export function MotionSpan(props: {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return <m.span {...props}>{props.children}</m.span>;
}

export function MotionButton(props: {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}) {
  return <m.button {...props}>{props.children}</m.button>;
}

export function MotionImg(props: {
  src: string;
  alt: string;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return <m.img {...props} />;
}
