
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./NavLink.module.css";

export default function NavLink({ href, children }) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`${styles.link} ${isActive ? styles.active : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
