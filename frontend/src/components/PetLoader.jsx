import React, { useEffect, useState } from "react";
import Dog from "./Dog";
import { useApp } from "../context/AppContext";

export default function PetLoader({ active, done }) {
  const { t } = useApp();
  const steps = [t("pet.s1"), t("pet.s2"), t("pet.s3"), t("pet.s4")];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % steps.length);
    }, 1800);
    return () => clearInterval(id);
  }, [active, steps.length]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-6 bg-[rgba(11,15,25,0.75)] backdrop-blur-xl animate-fade-up"
      data-testid="pet-loader-overlay"
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-teal-400/40 blur-sm animate-float-slow"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: `${6 + (i % 5) * 3}px`,
              height: `${6 + (i % 5) * 3}px`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-md w-full">
        <div className="grid place-items-center">
          <Dog size={200} mood={done ? "happy" : "happy"} />
        </div>

        {/* Ring pulsing */}
        <div className="relative mt-4 mx-auto h-2 w-48 rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-teal-400 rounded-full transition-[width] duration-700"
            style={{ width: done ? "100%" : `${(idx + 1) * 25}%` }}
          />
        </div>

        <div
          key={done ? "done" : idx}
          className="mt-6 font-display text-2xl sm:text-3xl font-black text-white animate-fade-up"
          data-testid="pet-loader-text"
        >
          {done ? t("pet.s5") + " 🎉" : steps[idx]}
        </div>
      </div>
    </div>
  );
}
