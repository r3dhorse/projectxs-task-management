import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
// import { Navigation } from "./navigation";

export const Sidebar = () => {
  return (
    <aside
      className="h-full w-64 bg-neutral-100 p-6 flex flex-col justify-between border-r"
      aria-label="Sidebar"
    >
      <div>
        <Link href="/" className="block mb-6">
          <Image src="/logo.svg" alt="App Logo" width={164} height={48} />
        </Link>

        <DottedSeparator className="my-4" />

        <DottedSeparator className="my-4" />
        < Navigation />
      </div>

      <div className="text-sm text-neutral-500 mt-6">
        © {new Date().getFullYear()} Project Xs
      </div>
    </aside>
  );
};
