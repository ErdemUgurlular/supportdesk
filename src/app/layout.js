
import "./globals.css";

import { getCurrentUser } from "@/lib/auth";

import MainLayout from "@/components/layout/MainLayout";
import AppProviders from "@/providers/AppProviders";

export const metadata = {
  title: "SupportDesk",
  description: "A web application that helps IT support management",
};

export default async function RootLayout({ children }) {
  const initialUser = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <AppProviders initialUser={initialUser}>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
