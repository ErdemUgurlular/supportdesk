import MainNavigation from "./MainNavigation";

import styles from "./MainLayout.module.css"

export default function MainLayout({ children }) {
  return (
    <>
      <MainNavigation />

      <div className={styles.mainContent}>{children}</div>
    </>
  );
}
