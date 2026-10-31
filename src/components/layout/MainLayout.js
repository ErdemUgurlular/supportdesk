import MainNavigation from "./MainNavigation";

export default function MainLayout({ children }) {
  // Temporary role for UI development
  const dummyUser = {
    name: "John",
    role: "guest",
  };

  return (
    <>
      <MainNavigation role={dummyUser.role} />

      <main>
        {children}
      </main>
    </>
  );
}