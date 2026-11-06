import MainNavigation from "@/components/layout/MainNavigation";

export default function PublicLayout({ children }) {
  return (
    <>
      <MainNavigation />
      {children}
    </>
  );
}
