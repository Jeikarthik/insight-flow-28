import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskList } from "@/components/dashboard/TaskList";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TasksPage() {
  const { tasks } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatsClick = (filterType: string) => {
    setSelectedFilter(filterType);
    setIsDialogOpen(true);
  };

  const getFilteredTasks = () => {
    if (!selectedFilter) return tasks;
    
    switch (selectedFilter) {
      case "Total Tasks":
        return tasks;
      case "In Progress":
        return tasks.filter(task => task.status === "in-progress");
      case "High Priority":
        return tasks.filter(task => task.priority === "high");
      case "Completed":
        return tasks.filter(task => task.status === "completed");
      default:
        return tasks;
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary"; 
      case "low": return "outline";
    }
  };
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
                value={tasks.length.toString()}
                description="+2 from last week"
                icon={CheckSquare}
                trend="up"
                onClick={() => handleStatsClick("Total Tasks")}
              />
              <StatsCard
                title="In Progress"
                value={tasks.filter(t => t.status === "in-progress").length.toString()}
                description="Currently active"
                icon={Clock}
                trend="neutral"
                onClick={() => handleStatsClick("In Progress")}
              />
              <StatsCard
                title="High Priority"
                value={tasks.filter(t => t.priority === "high").length.toString()}
                description="Need attention"
                icon={AlertTriangle}
                trend="down"
                onClick={() => handleStatsClick("High Priority")}
              />
              <StatsCard
                title="Completed"
                value={tasks.filter(t => t.status === "completed").length.toString()}
                description="This month"
                icon={CheckCircle}
                trend="up"
                onClick={() => handleStatsClick("Completed")}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TaskList />
              <TaskList />
            </div>
          </div>
        </main>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFilter} - {getFilteredTasks().length} Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {getFilteredTasks().map((task) => (
              <Card key={task.id} className="hover:shadow-soft transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Assigned to: {task.assignee}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Due: {task.dueDate}</span>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {getFilteredTasks().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found for this filter.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}