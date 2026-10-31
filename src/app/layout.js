import "./globals.css";
import MainLayout from "../components/layout/MainLayout";

export const metadata = {
  title: "SupportDesk",
  description: "A web application that helps IT support management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
