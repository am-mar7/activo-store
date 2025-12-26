"use client";
import { MdOutlineSearch } from "react-icons/md";
type Props = {
  className?: string;
};
export default function SearchToggler({ className }: Props) {
  return (
    <div className={className}>
      <MdOutlineSearch className="w-7 h-7 cursor-pointer" />
    </div>
  );
}