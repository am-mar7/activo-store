import DeleteBtn from "@/components/buttons/DeleteBtn";
import { Pen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface Props {
  type: string;
  title: string;
  image: string;
  href: string;
  _id: string;
}

export default function DataCard({ title, image, href, type , _id }: Props) {
  return (
    <div className="flex-between shadow-md p-4 rounded-lg bg-neutral-100">
      <div className="flex gap-2 items-center">
        <Image
          src={image}
          alt={title}
          width={50}
          height={50}
          className="rounded-lg object-cover max-xs:hidden"
        />
        <p className="text-slate-900">{title}</p>
      </div>
      <div className="flex gap-2">
        <DeleteBtn _id={_id} type={type} />
        <Link href={href}>
          <Pen className="text-primary-gradient" />
        </Link>
      </div>
    </div>
  );
}
