import { Suspense } from "react";
import AdminOnly from "@/components/auth/AdminOnly";

export const instant = false;

export default async function AdminLayout({ children }) {
  return (
    <Suspense fallback={<p>Checking administrator access...</p>}>
      <AdminOnly>{children}</AdminOnly>
    </Suspense>
  );
}
