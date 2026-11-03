import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TicketStatistics from "@/components/dashboard/TicketStatistics";
import MyTickets from "@/components/dashboard/MyTickets";
import ResolvedTickets from "@/components/dashboard/ResolvedTickets";

export default function UserDashboard() {
  return (
    <main>
      <DashboardHeader />

      <TicketStatistics />

      <MyTickets />

      <ResolvedTickets />
    </main>
  );
}
