import Link from "next/link";
import styles from "./TicketPagination.module.css";

export default function TicketPagination({
  currentPage,
  totalPages,
  searchParams,
}) {
  if (totalPages <= 1) return null;

  function getPageUrl(page) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });

    params.set("page", page.toString());

    return `?${params.toString()}`;
  }

  return (
    <nav className={styles.pagination}>
      <Link
        href={getPageUrl(currentPage - 1)}
        className={`${styles.button} ${
          currentPage === 1 ? styles.disabled : ""
        }`}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        Previous
      </Link>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={getPageUrl(currentPage + 1)}
        className={`${styles.button} ${
          currentPage === totalPages ? styles.disabled : ""
        }`}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        Next
      </Link>
    </nav>
  );
}
