import "./globals.css";

import AppProviders from "@/providers/AppProviders";
import { getCurrentUser } from "@/lib/auth";

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
          {children}
        </AppProviders>
      </body>
    </html>
  );
}