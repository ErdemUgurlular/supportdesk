import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TicketStatistics from "@/components/dashboard/TicketStatistics";
import MyTickets from "@/components/dashboard/MyTickets";
import ResolvedTickets from "@/components/dashboard/ResolvedTickets";

export default function UserDashboard() {
  const { user } = useAuth();

  const { getTicketStatistics, getRecentTickets } = useTicket();

  const statistics = getTicketStatistics(user.id);
  const recentTickets = getRecentTickets(6);

  return (
    <main>
      <DashboardHeader />

      <TicketStatistics />

      <MyTickets />

      <ResolvedTickets />
    </main>
  );
}
