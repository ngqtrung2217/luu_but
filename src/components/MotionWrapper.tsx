"use client";

import { motion as m } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

// Re-export motion components as client components
export function MotionDiv(props: HTMLMotionProps<"div"> & {
  children?: ReactNode;
}) {
  return <m.div {...props}>{props.children}</m.div>;
}

export function MotionSpan(props: HTMLMotionProps<"span"> & {
  children?: ReactNode;
}) {
  return <m.span {...props}>{props.children}</m.span>;
}

export function MotionButton(props: HTMLMotionProps<"button"> & {
  children?: ReactNode;
}) {
  return <m.button {...props}>{props.children}</m.button>;
}

export function MotionImg(props: HTMLMotionProps<"img"> & {
  src: string;
  alt: string;
}) {
  return <m.img {...props} />;
}
