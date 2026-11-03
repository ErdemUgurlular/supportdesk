import { getCurrentUser } from "@/lib/auth";
import MainNavigation from "./MainNavigation";

export default function MainLayout({ children }) {

  return (
    <>
      <MainNavigation />

      <main>
        {children}
      </main>
    </>
  );
}