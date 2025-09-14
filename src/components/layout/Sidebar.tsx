import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  CheckSquare, 
  MessageSquare, 
  Settings, 
  Home,
  Clock,
  Users
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", icon: Home, href: "/", current: true },
  { name: "Upload Documents", icon: Upload, href: "/upload", current: false },
  { name: "My Tasks", icon: CheckSquare, href: "/tasks", current: false, badge: "3" },
  { name: "Document Library", icon: FileText, href: "/documents", current: false },
  { name: "Pending Reviews", icon: Clock, href: "/pending", current: false, badge: "7" },
  { name: "Team Workspace", icon: Users, href: "/team", current: false },
  { name: "AI Assistant", icon: MessageSquare, href: "/chat", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r", className)}>
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          DocFlow Pro
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.current ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                item.current && "bg-gradient-primary shadow-soft"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}