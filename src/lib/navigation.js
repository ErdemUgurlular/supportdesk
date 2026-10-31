export const navigationItems = {
  guest: [
    { label: "Login", href: "/login" },
    { label: "Sign Up", href: "/sign-up" },
  ],
  user: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Tickets", href: "/tickets" },
    { label: "Create Ticket", href: "/tickets/new" },
  ],

  agent: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Assigned Tickets", href: "/assigned-tickets" },
    { label: "All Tickets", href: "/tickets" },
  ],

  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "All Tickets", href: "/tickets" },
    { label: "Manage Users", href: "/admin/users" },
    { label: "Reports", href: "/admin/reports" },
  ],
};
