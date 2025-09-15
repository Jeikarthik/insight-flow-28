import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
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
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Upload Documents", icon: Upload, href: "/upload" },
  { name: "My Tasks", icon: CheckSquare, href: "/tasks", badge: "3" },
  { name: "Document Library", icon: FileText, href: "/documents" },
  { name: "Pending Reviews", icon: Clock, href: "/pending", badge: "7" },
  { name: "Team Workspace", icon: Users, href: "/team" },
  { name: "AI Assistant", icon: MessageSquare, href: "/chat" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

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
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isActive && "bg-gradient-primary shadow-soft"
              )}
              asChild
            >
              <Link to={item.href}>
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}