"use client";

import Link from "next/link";
import NavLink from "./NavLink";

import { navigationItems } from "@/lib/navigation-items";
import { useAuth } from "@/hooks/useAuth";

export default function MainNavigation() {
  const { role } = useAuth();

  // Get navigation links based on the current user role
  const links = navigationItems[role] ?? navigationItems.guest;

  return (
    <header>
      <Link href="/">
        {/* <Image src={logoImg} alt="Main logo" priority /> */}
        Home Page
      </Link>

      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href}>{link.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
