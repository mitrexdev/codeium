"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Scroll-triggered reveal — fades/slides children in when entering viewport */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Mouse-tracking 3D tilt wrapper with soft glare */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(1100px) rotateX(0deg) rotateY(0deg)",
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * max * 2;
    const rx = (0.5 - py) * max * 2;
    setTransform(
      `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.015)`,
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 0.14 });
  };

  const handleLeave = () => {
    setTransform("perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlare((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={cn(
        "relative transition-transform duration-200 ease-out will-change-transform",
        className,
      )}
    >
      {children}
      {/* moving glare */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300",
        )}
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.9), transparent 60%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

/** Typewriter terminal — reveals lines sequentially once visible */
export function TypedTerminal({
  lines,
  className,
  step = 550,
}: {
  lines: React.ReactNode[];
  className?: string;
  step?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          let i = 0;
          const tick = setInterval(() => {
            i += 1;
            setCount(i);
            if (i >= lines.length) clearInterval(tick);
          }, step);
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lines.length, step]);

  return (
    <div ref={ref} className={className}>
      {lines.slice(0, count).map((line, i) => (
        <div
          key={i}
          className="animate-[fade-up_0.4s_ease-out_both]"
          style={{ animationDelay: "0ms" }}
        >
          {line}
          {i === count - 1 && count < lines.length && (
            <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-400/80 align-middle" />
          )}
        </div>
      ))}
    </div>
  );
}