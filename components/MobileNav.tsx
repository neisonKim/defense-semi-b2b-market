import Link from "next/link";

export function MobileNav(){
  return <nav className="mobileNav"><Link href="/">홈</Link><Link href="/products">제품</Link><Link className="primary" href="/rfq">RFQ</Link><Link href="/knowledge">지식</Link><Link href="/my-desk">My Desk</Link></nav>
}
