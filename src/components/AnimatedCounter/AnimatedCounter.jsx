
import React, { useEffect, useRef, useState } from "react";

function AnimatedCounter({ value, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;

          const startTime = performance.now();

          const animate = (currentTime) => {
            const progress = Math.min(
              (currentTime - startTime) / duration,
              1
            );

            // Smooth ease-out animation
            const easedProgress = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(value * easedProgress));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(value);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
