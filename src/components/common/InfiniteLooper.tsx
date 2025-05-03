import React, { useRef, useState, useEffect, useCallback } from "react";
import "../../styles/InfiniteLooper.css";

interface InfiniteLooperProps {
  children: React.ReactNode;
  speed: number;
  direction: "left" | "right";
}

const InfiniteLooper: React.FC<InfiniteLooperProps> = ({
  children,
  speed,
  direction,
}) => {
  const [looperInstances, setLooperInstances] = useState(1);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const setupInstances = useCallback(() => {
    if (!outerRef.current || !innerRef.current) return;

    const { width } = innerRef.current.getBoundingClientRect();

    const { width: parentWidth } = outerRef.current.getBoundingClientRect();

    const instanceWidth = width / innerRef.current.children.length;

    if (width < parentWidth + instanceWidth) {
      setLooperInstances(looperInstances + Math.ceil(parentWidth / width));
    }
    resetAnimation();
  }, [looperInstances]);

  const resetAnimation = () => {
    if (innerRef?.current) {
      innerRef.current.setAttribute("data-animate", "false");

      setTimeout(() => {
        if (innerRef?.current) {
          innerRef.current.setAttribute("data-animate", "true");
        }
      }, 50);
    }
  };

  useEffect(() => {
    setupInstances();
    window.addEventListener("resize", setupInstances);
    return () => {
      window.removeEventListener("resize", setupInstances);
    };
  }, []);

  return (
    <>
      <div className='looper' ref={outerRef}>
        <div className='looper__innerList' ref={innerRef}>
          {[...Array(looperInstances)].map((_, ind) => (
            <div
              key={ind}
              className='looper__listInstance'
              style={{
                animationDuration: `${speed}s`,
                animationDirection: direction === "left" ? "normal" : "reverse",
              }}
            >
              {children}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InfiniteLooper;
