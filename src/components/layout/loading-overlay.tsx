import LoadingPage from "./loading-page";
import { useEffect, useRef, useState } from "react";

export default function LoadingOverlay({ loading }: { loading: boolean }) {
  const [visible, setVisible] = useState(loading);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Animate progress bar and handle fade-in
  useEffect(() => {
    if (loading) {
      setVisible(true);
      setProgress(0);
      startRef.current = null;
      const duration = 1400;
      const animate = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        setProgress(Math.min(100, (elapsed / duration) * 100));
        if (elapsed < duration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setProgress(100);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setProgress(100);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loading]);

  // Handle fade-out and unmount
  useEffect(() => {
    if (!loading && visible) {
      const timeout = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [loading, visible]);

  if (!visible) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-400 ${loading ? 'opacity-100' : 'opacity-0'}`}>
      <LoadingPage progress={progress} />
    </div>
  );
} 