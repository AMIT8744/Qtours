import DatabaseStatusChecker from "@/components/database-status-checker"

export default function DatabaseStatusPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Status</h1>
      <DatabaseStatusChecker />
    </div>
  )
}
