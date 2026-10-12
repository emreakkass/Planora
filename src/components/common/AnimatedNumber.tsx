import React, { useEffect, useState, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 0.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : 0);
  const prevValueRef = useRef<number>(shouldReduceMotion ? value : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startVal = isFirstRender.current ? 0 : prevValueRef.current;
    isFirstRender.current = false;

    const controls = animate(startVal, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    prevValueRef.current = value;
    return () => controls.stop();
  }, [value, duration, shouldReduceMotion]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
