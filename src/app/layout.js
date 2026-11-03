import "./globals.css";
import MainLayout from "../components/layout/MainLayout";
import AppProviders from "@/providers/AppProviders";

export const metadata = {
  title: "SupportDesk",
  description: "A web application that helps IT support management",
};

export default function RootLayout({ children }) {
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
