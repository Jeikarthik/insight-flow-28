import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI assistant. I can help you summarize documents, extract information, and answer questions about your data. What would you like to know?",
    sender: "bot",
    timestamp: "10:30"
  }
];

interface ChatBotProps {
  externalInput?: string;
  onInputChange?: (value: string) => void;
}

export function ChatBot({ externalInput, onInputChange }: ChatBotProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const inputValue = externalInput !== undefined ? externalInput : input;
  const handleInputChange = onInputChange || setInput;

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    handleInputChange("");
    setIsTyping(true);

    // Mock AI responses based on input
    setTimeout(() => {
      let response = "Thanks for your message! I'm here to help you with document management and task organization.";
      
      const inputLower = inputValue.toLowerCase();
      if (inputLower.includes('task') || inputLower.includes('todo')) {
        response = "I can help you create and manage tasks! You currently have 3 pending tasks and 12 completed ones. Would you like me to create a new task or show you details about existing ones?";
      } else if (inputLower.includes('document') || inputLower.includes('file')) {
        response = "You have 24 documents uploaded. I can help you search through them, extract information, or organize them by categories. What would you like to do?";
      } else if (inputLower.includes('summary') || inputLower.includes('overview')) {
        response = "Here's a quick overview: You have 24 documents uploaded, 3 pending tasks, and 5 active users in your workspace. Your document processing is running smoothly with a 98% success rate.";
      } else if (inputLower.includes('help')) {
        response = "I can help you with:\n• Document upload and processing\n• Task creation and management\n• Data analysis and insights\n• Workflow automation\n• Integration setup\n\nWhat would you like assistance with?";
      } else if (inputLower.includes('upload')) {
        response = "To upload documents, you can drag and drop them into the upload zone on the left, or click 'Browse Files' to select them. I support PDF, DOCX, images, and many other formats!";
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: response,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-gradient-card shadow-soft h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto">Online</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "bot" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border"
                )}
              >
                <p>{message.content}</p>
                <span className={cn(
                  "text-xs mt-1 block",
                  message.sender === "user" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                )}>
                  {message.timestamp}
                </span>
              </div>
              
              {message.sender === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-background border rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your documents..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}