"use client"

import Image from "next/image";
import { usePathname } from "next/navigation";


interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();

  return (
    <main className="bg-neutral-50 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-center items-center">
          <Image src="/logo.svg" height={252} width={156} alt="Logo" />
        </nav>
        <div className="flex flex-col items-center justify-center -mt-0.75">
          {children}
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;