import LogoutBtn from "../../buttons/LogoutBtn";
import NavLinks from "./Navlinks";

export default function Sidebar() {
  return (
    <section className="hidden fixed left-0 top-0 h-screen sm:flex flex-col justify-between bg-light900_dark200 shadow-light-400 shadow-sm dark:shadow-none custom-scrollbar overflow-y-auto light-border border-r sm:w-27.5 xl:w-66.5">
      <h1 className="h3-semibold max-xl:hidden text-primary-gradient py-4 px-8 font-space-grotesk">Dashboard</h1>
      <div className="flex flex-col gap-6 flex-1 px-5">
        <NavLinks />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <LogoutBtn />
      </div>
    </section>
  );
}
