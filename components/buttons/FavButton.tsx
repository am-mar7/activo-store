"use client";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";

interface Props {
  isFavorite: boolean;
  className?: string;
}

export default function FavButton({ isFavorite, className }: Props) {
  const [isFav, setIsFav] = useState(isFavorite);
  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Toggling favorite status");
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
  };

  return (
    <div className={cn(className)}>
      <button onClick={handleToggleFavorite}>
        <Heart
          fill={isFav ? "red" : "none"}
          className={`w-7 h-7  ${isFav ? "text-red-500" : "text-slate-700"}`}
        />
      </button>
    </div>
  );
}
