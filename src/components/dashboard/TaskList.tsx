import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status: "pending" | "in-progress" | "completed";
  type: "review" | "approval" | "classification" | "deadline";
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Review Contract Documents",
    description: "Legal team contract review for Q4 partnerships",
    priority: "high",
    dueDate: "2024-01-15",
    assignee: { name: "Sarah Johnson", initials: "SJ" },
    status: "pending",
    type: "review"
  },
  {
    id: "2", 
    title: "Classify Medical Records",
    description: "Process and classify patient documents from upload batch #847",
    priority: "medium",
    dueDate: "2024-01-16",
    assignee: { name: "Dr. Smith", initials: "DS" },
    status: "in-progress",
    type: "classification"
  },
  {
    id: "3",
    title: "Invoice Approval Needed", 
    description: "Finance department approval for vendor invoices",
    priority: "high",
    dueDate: "2024-01-14",
    assignee: { name: "Mike Chen", initials: "MC" },
    status: "pending",
    type: "approval"
  }
];

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "secondary"; 
    case "low": return "outline";
  }
};

const getStatusIcon = (status: Task["status"]) => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "in-progress": return Clock;
    default: return AlertCircle;
  }
};

const getTypeIcon = (type: Task["type"]) => {
  return FileText;
};

export function TaskList() {
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
          {tasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            const TypeIcon = getTypeIcon(task.type);
            
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
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee.name}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button variant="outline" className="w-full mt-4">
            View All Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}