import Navbar from "@/components/dashboard/navigation/Navbar";
import Sidebar from "@/components/dashboard/navigation/Sidebar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Dashboardlayout({ children }: Props) {
  return (
    <div>
      <Navbar />
      <div className="flex">
        {" "}
        <div className="sm:w-27.5 xl:w-66.5">
          {/* fixed position  */}
          <Sidebar />
        </div>
        <section className="flex flex-1 min-h-screen">
          <div className="mx-auto px-4 py-2 sm:px-8 sm:py-4 w-full">{children}</div>
        </section>
      </div>
    </div>
  );
}
