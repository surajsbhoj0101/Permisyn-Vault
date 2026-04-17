import { useEffect, useRef } from "react";
import gsap from "gsap";

type ToastProps = {
  notice?: string | null;
  redNotice?: string | null;
  onClearNotice?: () => void;
  onClearRedNotice?: () => void;
};

function Toast({
  notice,
  redNotice,
  onClearNotice,
  onClearRedNotice,
}: ToastProps) {
  const successRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const closeToast = (
    el: HTMLDivElement | null,
    cb?: () => void
  ) => {
    if (!el) return cb?.();

    gsap.to(el, {
      opacity: 0,
      y: -10,
      scale: 0.95,
      duration: 0.25,
      ease: "power2.in",
      onComplete: cb,
    });
  };

  // SUCCESS TOAST
  useEffect(() => {
    if (!notice || !successRef.current) return;

    const el = successRef.current;

    gsap.fromTo(
      el,
      { opacity: 0, y: -20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
    );

    // Progress animation
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: "100%" },
        { width: "0%", duration: 4, ease: "linear" }
      );
    }

    const timer = setTimeout(() => {
      closeToast(el, onClearNotice);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  // ERROR TOAST
  useEffect(() => {
    if (!redNotice || !errorRef.current) return;

    const el = errorRef.current;

    gsap.fromTo(
      el,
      { opacity: 0, y: -20, rotate: -2 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" }
    );

    const timer = setTimeout(() => {
      closeToast(el, onClearRedNotice);
    }, 5000);

    return () => clearTimeout(timer);
  }, [redNotice]);

  if (!notice && !redNotice) return null;

  return (
    <div className="fixed right-5 top-5 z-50 flex w-full max-w-sm flex-col gap-3">
      
      {/* SUCCESS */}
      {notice && (
        <div
          ref={successRef}
          className="relative overflow-hidden rounded-xl border backdrop-blur-lg shadow-lg px-4 py-3 flex items-start gap-3"
          style={{
            background: "rgba(40, 180, 120, 0.15)",
            borderColor: "rgba(40,180,120,0.4)",
          }}
        >
          {/* Icon */}
          <div className="text-green-400 text-lg">✔</div>

          <div className="flex-1 text-sm text-white/90">
            {notice}
          </div>

          {/* Close */}
          <button
            onClick={() => closeToast(successRef.current, onClearNotice)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="absolute bottom-0 left-0 h-[2px] bg-green-400"
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* ERROR */}
      {redNotice && (
        <div
          ref={errorRef}
          className="rounded-xl border backdrop-blur-lg shadow-lg px-4 py-3 flex items-start gap-3"
          style={{
            background: "rgba(255, 80, 100, 0.15)",
            borderColor: "rgba(255,80,100,0.4)",
          }}
        >
          <div className="text-red-400 text-lg">⚠</div>

          <div className="flex-1 text-sm text-white/90">
            {redNotice}
          </div>

          <button
            onClick={() => closeToast(errorRef.current, onClearRedNotice)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Toast;