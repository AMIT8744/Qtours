export const dynamic = "force-dynamic"

import { getBookingAgents } from "@/app/actions/booking-agent-actions"
import { getAllAgentUsers } from "@/app/actions/agent-user-actions"
import AgentsClient from "./agents-client"

export const metadata = {
  title: "Booking Agents | Viaggi Del Qatar",
}

export default async function AgentsPage() {
  const [bookingAgents, agentUsers] = await Promise.all([getBookingAgents(), getAllAgentUsers()])

  return <AgentsClient initialAgents={bookingAgents} initialAgentUsers={agentUsers} />
}
