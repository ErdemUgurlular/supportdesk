import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

import "./globals.css";
import MainLayout from "../components/layout/MainLayout";
import AppProviders from "@/providers/AppProviders";

export const metadata = {
  title: "SupportDesk",
  description: "A web application that helps IT support management",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  // Guests cannot access protected routes
  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body>
        <AppProviders>
          <MainLayout>{children}</MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
