import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { TaskList } from "@/components/dashboard/TaskList";
import { ChatBot } from "@/components/dashboard/ChatBot";
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Hero Section */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-primary shadow-strong">
            <div className="absolute inset-0 bg-black/20"></div>
            <img 
              src={heroImage} 
              alt="Document Management" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="relative p-8 text-primary-foreground">
              <h1 className="text-4xl font-bold mb-4">Welcome to DocFlow Pro</h1>
              <p className="text-xl mb-6 max-w-2xl">
                Streamline your document workflows with AI-powered classification, automated task management, and intelligent processing.
              </p>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm opacity-90">Documents Processed</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm opacity-90">Accuracy Rate</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">15min</div>
                  <div className="text-sm opacity-90">Avg Processing Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Documents"
              value="1,247"
              description="+12% from last month"
              icon={FileText}
              trend="up"
            />
            <StatsCard
              title="Pending Tasks"
              value="23"
              description="3 high priority"
              icon={Clock}
              trend="neutral"
            />
            <StatsCard
              title="Completed Today"
              value="89"
              description="+5% from yesterday"
              icon={CheckCircle}
              trend="up"
            />
            <StatsCard
              title="Active Users"
              value="156"
              description="24 online now"
              icon={Users}
              trend="up"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload and Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <UploadZone />
              <TaskList />
            </div>
            
            {/* Chat Bot */}
            <div className="lg:col-span-1">
              <ChatBot />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
