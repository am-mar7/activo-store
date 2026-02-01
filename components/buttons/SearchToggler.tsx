"use client";
import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import GlobalSearch from "../searchbars/GlobalSearch";
type Props = {
  className?: string;
};
export default function SearchToggler({ className }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <button onClick={() => setSearchOpen(!searchOpen)} className={className}>
        <MdOutlineSearch className="w-7 h-7 cursor-pointer" />
      </button>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
