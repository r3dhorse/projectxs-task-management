import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@/features/auth/components/user-button';
import { headers } from 'next/headers';

interface StandaloneLayoutProps {
  children: React.ReactNode;
}


const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isNoWorkspacePage = pathname === '/no-workspace';

  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {children}
        </div>
      </div>
    </main>
  );

}

export default StandaloneLayout;