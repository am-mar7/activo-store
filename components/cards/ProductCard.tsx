import ROUTES from "@/constants/routes";
import { ProductType } from "@/types/global";
import Image from "next/image";
import Link from "next/link";
import FavButton from "../buttons/FavButton";

interface Props {
  product: ProductType;
}

export default function ProductCard({ product }: Props) {
  const { title, images, oldPrice, newPrice, _id } = product;

  return (
    <Link className="relative max-w-64 group" href={ROUTES.PRODUCT(_id)}>
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={images[0]}
          alt={title}
          width={200}
          height={300}
          className="w-full h-60 xs:h-75 sm:h-80 md:h-90 object-center object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 ease-out" />
      </div>
      <FavButton className="absolute right-2 top-2 z-10" product={product._id} />
      <div className="p-1">
        <h4 className="max-sm:body-semibold sm:h4-semibold">{title}</h4>
        <p className="max-sm:body-medium">
          <span className="line-through">{oldPrice}</span>{" "}
          <span>{newPrice}</span>
        </p>
      </div>
    </Link>
  );
}