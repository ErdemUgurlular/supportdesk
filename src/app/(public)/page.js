"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading, authError, refreshUser } =
    useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const allowedRoles = ["user", "agent", "admin"];

    if (allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Wait until authentication has been checked.
  if (isLoading || isAuthenticated) {
    return (
      <main className={styles.landingPage}>
        <p>Loading SupportDesk...</p>
      </main>
    );
  }

  // Don't mistake a failed session check for a guest session.
  if (authError) {
    return (
      <main className={styles.landingPage}>
        <h1>Unable to verify your session.</h1>
        <button onClick={() => refreshUser()}>Try Again</button>
      </main>
    );
  }

  return (
    <main className={styles.landingPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>IT Support Management</span>

          <h1>
            IT Support Made
            <span> Simple.</span>
          </h1>

          <p>
            Submit support requests, track their progress, and stay connected
            with your IT support team through one simple platform.
          </p>

          <div className={styles.heroActions}>
            <Link href="/sign-up" className={styles.primaryButton}>
              Get Started
            </Link>

            <Link href="/login" className={styles.secondaryButton}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <article className={styles.featureCard}>
          <h2>Submit Tickets</h2>
          <p>
            Easily create support requests whenever you encounter a technical
            problem.
          </p>
        </article>

        <article className={styles.featureCard}>
          <h2>Track Progress</h2>
          <p>
            Follow your requests and stay informed about their current status.
          </p>
        </article>

        <article className={styles.featureCard}>
          <h2>Get Support</h2>
          <p>
            Stay connected with your support team until your issues are
            resolved.
          </p>
        </article>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 SupportDesk. All rights reserved.</p>
      </footer>
    </main>
  );
}
