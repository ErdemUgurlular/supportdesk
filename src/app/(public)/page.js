import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import styles from "./page.module.css";

export default async function HomePage() {
  const user = await getCurrentUser();

  const allowedRoles = ["user", "agent", "admin"];

  // Redirect authenticated users to their dashboard
  if (user) {
    if (allowedRoles.includes(user.role)) {
      redirect("/dashboard");
    }

    redirect("/login");
  }

  // Guest landing page
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
