'use client';

import React from 'react';

interface TopBannerProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  link?: string;
}

export default function TopBanner({
  text = 'Welcome to our site!',
  backgroundColor = '#000000',
  textColor = '#ffffff',
  link,
}: TopBannerProps) {
  const content = (
    <div
      className="relative w-full overflow-hidden h-10"
      style={{ backgroundColor }}
    >
      <div className="flex animate-scroll whitespace-nowrap">
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="inline-block py-3 px-4 text-sm font-medium"
            style={{ color: textColor }}
          >
            {text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        className="block transition-opacity hover:opacity-90"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
}