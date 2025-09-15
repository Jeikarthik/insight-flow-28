import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  onClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend = "neutral",
  className,
  onClick 
}: StatsCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast({ 
        title: "Stats Details", 
        description: `Viewing detailed analytics for ${title.toLowerCase()}...` 
      });
    }
  };

  return (
    <Card 
      className={cn(
        "bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer", 
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <p className={cn(
              "text-sm mt-1",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}>
              {description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}