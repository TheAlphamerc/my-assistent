import Link from "next/link";
import { Button } from "../button";
interface Prop {
  className?: string;
  trailing?: React.ReactNode;
}
export default function NavbarLayout({ trailing }: Prop) {
  return (
    <nav className="bg-white  sticky top-0 border-b ">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 h-14">
        <Link href="/" className="font-bold text-xl text-black">
          Assistant AI
        </Link>

        <div>{trailing}</div>
      </div>
    </nav>
  );
}
