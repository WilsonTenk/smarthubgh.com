import React, { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';

const numberFormat = new Intl.NumberFormat('en-GH');

const CountUp: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = '',
  duration = 1800
}) => {
  // Keep the complete statistic in prerendered HTML and during hydration.
  const [count, setCount] = useState(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const completedRef = useRef(false);
  const reduceMotion = usePrefersReducedMotion();
  const formattedValue = `${numberFormat.format(value)}${suffix}`;

  useEffect(() => {
    if (reduceMotion || completedRef.current || !('IntersectionObserver' in window)) {
      completedRef.current = true;
      setCount(value);
      return;
    }

    setCount(0);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
      observer.disconnect();
      let start: number | undefined;

      const tick = (time: number) => {
        start ??= time;
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else completedRef.current = true;
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });

    if (elementRef.current) observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduceMotion]);

  return (
    <span ref={elementRef} className="inline-grid tabular-nums">
      {/* Reserve the final width so surrounding text stays aligned while counting. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">{formattedValue}</span>
      <span aria-hidden="true" className="col-start-1 row-start-1 whitespace-nowrap">{numberFormat.format(count)}{suffix}</span>
      <span className="sr-only">{formattedValue}</span>
    </span>
  );
};

export default CountUp;
