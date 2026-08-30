"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, House } from "@phosphor-icons/react/dist/ssr";

export default function TopBar({ crumb, days }) {
  const router = useRouter();
  return (
    <div className="topbar">
      <button className="tb" aria-label="Go back"
        onClick={() => (history.length > 1 ? router.back() : router.push("/"))}>
<ArrowLeft size={18} weight="bold" />
      </button>
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/packages">Trips</Link> / <b>{crumb}</b>
      </nav>
      <Link className="tb" href="/" aria-label="Home">
<House size={18} weight="bold" />
      </Link>
    </div>
  );
}
