import Image from "next/image";
import logo from '@/public/logo.png';
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (<>
    <nav className="flex items-center justify-between p-4 bg-[rgb(5,55,89)] w-full fixed top-0 left-0 z-50">
      <Image
        className="flex items-center"
        src={logo}
        alt="Logo"
        width={120}
        height={120}
      />
      <div className="flex items-center space-x-4">
        <Link className="text-white" href="/auth/signin">Sign-In</Link>
      </div>
    </nav >
    <main>{children}</main>
  </>);
}
