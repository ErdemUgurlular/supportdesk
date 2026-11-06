"use client";

import Link from "next/link";
import NavLink from "./NavLink";

import LogoutButton from "@/components/auth/LogoutButton";
import { navigationItems } from "@/lib/navigation-items";
import { useAuth } from "@/hooks/useAuth";

import styles from "./MainNavigation.module.css";

export default function MainNavigation() {
  const { role, isAuthenticated, isLoading } = useAuth();

  const links = isLoading
    ? []
    : (navigationItems[role] ?? navigationItems.guest);

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

            {!isLoading && isAuthenticated && (
              <li>
                <LogoutButton className={styles.logoutButton}/>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
