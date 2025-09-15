import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Settings, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockTeamMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Senior Legal Analyst",
    department: "Legal",
    initials: "SJ",
    status: "online",
    tasksAssigned: 5,
    completionRate: "95%"
  },
  {
    id: "2", 
    name: "Dr. Smith",
    email: "dr.smith@company.com",
    role: "Medical Records Specialist",
    department: "Healthcare",
    initials: "DS",
    status: "away",
    tasksAssigned: 3,
    completionRate: "88%"
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@company.com", 
    role: "Finance Director",
    department: "Finance",
    initials: "MC",
    status: "online",
    tasksAssigned: 7,
    completionRate: "92%"
  }
];

export default function TeamPage() {
  const handleInviteMember = () => {
    toast({
      title: "Invite Team Member",
      description: "Opening invite dialog..."
    });
  };

  const handleContactMember = (memberName: string, method: string) => {
    toast({
      title: `Contacting ${memberName}`,
      description: `Opening ${method} client...`
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Team Workspace</h1>
                  <p className="text-muted-foreground">
                    Manage team members and collaborate on documents
                  </p>
                </div>
              </div>
              <Button onClick={handleInviteMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{mockTeamMembers.length}</div>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">
                      {mockTeamMembers.filter(m => m.status === "online").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Online Now</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">
                      {mockTeamMembers.reduce((sum, m) => sum + m.tasksAssigned, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            member.status === "online" ? "bg-success" : "bg-warning"
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline">{member.department}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {member.tasksAssigned} tasks • {member.completionRate} completion
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContactMember(member.name, "email")}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContactMember(member.name, "call")}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContactMember(member.name, "settings")}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}