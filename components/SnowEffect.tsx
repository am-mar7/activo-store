"use client";

import { useEffect, useState } from "react";
import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  lightness: number;
}

export default function SnowEffect({ className }: { className?: string }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    const snowflakeCount = Math.floor(window.innerWidth / 30);

    const generatedFlakes: Flake[] = Array.from(
      { length: snowflakeCount },
      (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 8 + 10,
        duration: Math.random() * 12 + 18,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.3 + 0.5,
        lightness: Math.random() * 3 + 50,
      })
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlakes(generatedFlakes);
  }, []);

  return (
    <div
      className={cn(
        className,
        "fixed inset-0 pointer-events-none z-50 overflow-hidden"
      )}
    >
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute -top-10 animate-snowfall"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
          }}
        >
          <Snowflake
            size={flake.size}
            style={{
              color: `hsl(205, 30%, ${flake.lightness}%)`,
              filter: "drop-shadow(0 0 3px rgba(255,255,255,0.4))",
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(60vh) translateX(15px);
          }
          100% {
            transform: translateY(110vh) translateX(-10px);
          }
        }

        .animate-snowfall {
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
