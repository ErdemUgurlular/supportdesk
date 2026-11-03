"use client";

import Link from "next/link";
import NavLink from "./NavLink";

import { navigationItems } from "@/lib/navigation-items";
import { useAuth } from "@/hooks/useAuth";

import styles from "./MainNavigation.module.css";

export default function MainNavigation() {
  const { role } = useAuth();

  console.log("Navigation role:", role);
  // Get navigation links based on the current user role
  const links = navigationItems[role] ?? navigationItems.guest;

  return (
    <header className={styles.header}>
      <div className={styles.navigationContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>S</span>
          <span>SupportDesk</span>
        </Link>

        <nav className={styles.navigation} aria-label="Main navigation">
          <ul className={styles.navigationList}>
            {links.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
