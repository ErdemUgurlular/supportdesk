'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({href, children}) {
  const pathname = usePathname();

  /* const isActive =
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`)); */

  return (
    <Link
      href={
        href
      } /*Use it for styling later className={isActive ? `${classes.link} ${classes.active}` : `${classes.link}`} */
    >
      {children}
    </Link>
  );
}
