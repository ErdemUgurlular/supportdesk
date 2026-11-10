import { Suspense } from "react";
import ProtectedGate from "@/components/auth/ProtectedGate";

// Protected routes require request-time rendering.
export const instant = false;

export default function ProtectedLayout({ children }) {
  return (
    <Suspense fallback={<p>Loading SupportDesk...</p>}>
      <ProtectedGate>{children}</ProtectedGate>
    </Suspense>
  );
}
