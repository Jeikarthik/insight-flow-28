import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskList } from "@/components/dashboard/TaskList";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckSquare className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <p className="text-muted-foreground">
                  Manage and track your document processing tasks
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <StatsCard
                title="Total Tasks"
                value="15"
                description="+2 from last week"
                icon={CheckSquare}
                trend="up"
              />
              <StatsCard
                title="In Progress"
                value="3"
                description="Currently active"
                icon={Clock}
                trend="neutral"
              />
              <StatsCard
                title="High Priority"
                value="2"
                description="Need attention"
                icon={AlertTriangle}
                trend="down"
              />
              <StatsCard
                title="Completed"
                value="12"
                description="This month"
                icon={CheckCircle}
                trend="up"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TaskList />
              <TaskList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}