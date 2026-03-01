"use client";

import Link from "next/link";
import Image from "next/image";
import TopBanner from "@/components/TopBanner";

type HeroSectionProps = {
    title?: string;
    subtitle?: string;
    image?: string;
    cta?: { text?: string; href?: string };
    navbar?: React.ReactNode;
    topBanner?: {
      text?: string;
      backgroundColor?: string;
      textColor?: string;
      link?: string;
    };
  };
  
  export default function HeroSection({
    title, subtitle, image, cta, navbar, topBanner,
  }: HeroSectionProps) {
    const validCta = cta?.text && cta?.href ? cta : null;
    const hasContent = title || subtitle || validCta;
  
    return (
      <div className="relative h-125 md:h-150 lg:h-175 overflow-hidden">
        <Image
          src={image || "/images/hero.png"}
          alt="Hero Background"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="z-0"
        />
  
        {hasContent && (
          <>
            <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-transparent z-10" />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent z-10" />
          </>
        )}
  
        {/* TopBanner sits at the very top */}
        {topBanner && (
          <TopBanner
            text={topBanner.text}
            backgroundColor={topBanner.backgroundColor}
            textColor={topBanner.textColor}
            link={topBanner.link}
          />
        )}
  
        {/* Navbar below the banner */}
        {navbar}
  
        {/* Hero content */}
        {hasContent && (
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="flex flex-col px-8 md:px-16 lg:px-24 max-w-2xl">
              {title && (
                <>
                  <span className="block w-8 h-px bg-white/60 mb-6 animate-fadeInUp" />
                  <h1 className="text-white font-bold leading-tight tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm animate-fadeInUp">
                    {title}
                  </h1>
                </>
              )}
  
              {subtitle && (
                <p className={`leading-relaxed tracking-wide animate-fadeInUp ${
                  title
                    ? "text-white/70 font-light text-sm sm:text-base md:text-lg mt-4 delay-100"
                    : "text-white font-semibold text-xl sm:text-2xl md:text-3xl drop-shadow-sm"
                }`}>
                  {subtitle}
                </p>
              )}
  
              {validCta && (
                <div className={`animate-fadeInUp ${title || subtitle ? "mt-8 delay-200" : ""}`}>
                  <Link
                    href={validCta.href!}
                    className="group inline-flex items-center gap-3 text-white text-xs font-semibold tracking-widest uppercase border border-white/40 hover:border-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-7 py-3.5 transition-all duration-500 ease-out"
                  >
                    {validCta.text}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
  
              {title && (
                <span className="block w-8 h-px bg-white/25 mt-8 animate-fadeInUp delay-300" />
              )}
            </div>
          </div>
        )}
  
        {/* Ambient orbs */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-600/30 rounded-full blur-3xl animate-pulse-slow pointer-events-none z-10" />
        <div className="absolute top-10 left-10 w-24 h-24 bg-primary-400/20 rounded-full blur-2xl animate-pulse-slow delay-200 pointer-events-none z-10" />
      </div>
    );
  }