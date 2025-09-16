import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, FileText, AlertCircle, CheckCircle2, Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "secondary"; 
    case "low": return "outline";
  }
};

const getStatusIcon = (status: "pending" | "in-progress" | "completed") => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "in-progress": return Clock;
    default: return AlertCircle;
  }
};

const getTypeIcon = () => {
  return FileText;
};

export function TaskList() {
  const { tasks, updateTaskStatus } = useApp();

  const handleTaskAction = (taskId: string, action: "start" | "complete") => {
    const newStatus = action === "start" ? "in-progress" : "completed";
    updateTaskStatus(taskId, newStatus);

    const task = tasks.find(t => t.id === taskId);
    toast({
      title: `Task ${action === "start" ? "Started" : "Completed"}`,
      description: `"${task?.title}" has been ${action === "start" ? "started" : "marked as complete"}`,
    });
  };

  const handleViewAllTasks = () => {
    toast({ title: "Navigation", description: "Opening full task management view..." });
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Priority Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {tasks.slice(0, 4).map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            const TypeIcon = getTypeIcon();
            
            return (
              <div 
                key={task.id}
                className="flex items-start gap-4 p-4 bg-background rounded-lg border hover:shadow-soft transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.assignee.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn(
                        "h-4 w-4",
                        task.status === "completed" && "text-success",
                        task.status === "in-progress" && "text-warning",
                        task.status === "pending" && "text-muted-foreground"
                      )} />
                      <span className="text-xs text-muted-foreground">
                        Due {task.dueDate}
                      </span>
                      {task.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 ml-2"
                          onClick={() => handleTaskAction(task.id, "start")}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                      {task.status === "in-progress" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 ml-2"
                          onClick={() => handleTaskAction(task.id, "complete")}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button variant="outline" className="w-full mt-4" onClick={handleViewAllTasks}>
            View All Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}