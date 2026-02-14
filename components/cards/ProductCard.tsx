import ROUTES from "@/constants/routes";
import { ProductType } from "@/types/global";
import Image from "next/image";
import Link from "next/link";
import FavButton from "../buttons/FavButton";
import { Eye } from "lucide-react";

interface Props {
  product: ProductType;
}

export default function ProductCard({ product }: Props) {
  const { title, images, oldPrice, newPrice, _id } = product;

  return (
    <Link className="relative max-w-64 group" href={ROUTES.PRODUCT(_id)}>
      <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
        <Image
          src={images[0]}
          alt={title}
          width={200}
          height={300}
          className="w-full h-60 xs:h-75 sm:h-80 md:h-90 object-center object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-2"
        />

        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Animated border glow */}
        <div className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary/60 rounded-xl transition-all duration-500" />

        {/* Quick view button - slides up from bottom */}
        <div className="absolute hidden inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out p-4 md:flex gap-2">
          <button className="flex-1 bg-white text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-gradient2 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>

        {/* Discount badge - if applicable */}
        {oldPrice && oldPrice > newPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            -{Math.round(((oldPrice - newPrice) / oldPrice) * 100)}%
          </div>
        )}
      </div>

      <FavButton
        className="absolute right-2 top-2 z-10 transform group-hover:scale-110 transition-transform duration-300"
        product={product._id}
      />

      <div className="p-2 mt-2">
        <h4 className="max-sm:body-semibold sm:h4-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {oldPrice && (
            <span className="text-sm text-gray-500 line-through">
              LE {oldPrice}
            </span>
          )}
          <span className="text-lg font-bold text-primary">LE {newPrice}</span>
        </div>
      </div>
    </Link>
  );
}
