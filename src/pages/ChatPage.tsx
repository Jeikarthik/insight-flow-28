import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatBot } from "@/components/dashboard/ChatBot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, Zap, Brain } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <p className="text-muted-foreground">
                  Get help with document analysis, task management, and insights
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div style={{ height: "600px" }}>
                  <ChatBot />
                </div>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Document Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Extract insights, summarize content, and classify documents
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Task Automation</p>
                        <p className="text-xs text-muted-foreground">
                          Create tasks, set reminders, and track progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Smart Assistance</p>
                        <p className="text-xs text-muted-foreground">
                          Answer questions about your data and workflow
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md">
                      "Summarize today's uploads"
                    </button>
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md">
                      "Show pending tasks"
                    </button>
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md">
                      "Create a new task"
                    </button>
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md">
                      "Analyze document patterns"
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}