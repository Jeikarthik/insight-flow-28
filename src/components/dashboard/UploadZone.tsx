import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: UploadedFile[] = droppedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type || "Unknown",
      progress: 0,
      status: "uploading"
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = f.progress + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: "completed" };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return "text-success";
      case "error": return "text-destructive";
      case "processing": return "text-warning";
      default: return "text-primary";
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return "Processed";
      case "error": return "Failed";
      case "processing": return "Processing";
      default: return "Uploading";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drop files here to upload</h3>
          <p className="text-muted-foreground mb-4">
            Support for PDF, DOCX, images, and more
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              const newFiles: UploadedFile[] = selectedFiles.map((file, index) => ({
                id: `${Date.now()}-${index}`,
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.type || "Unknown",
                progress: 0,
                status: "uploading"
              }));

              setFiles(prev => [...prev, ...newFiles]);

              // Simulate upload progress
              newFiles.forEach((file) => {
                const interval = setInterval(() => {
                  setFiles(prev => prev.map(f => {
                    if (f.id === file.id) {
                      const newProgress = f.progress + 10;
                      if (newProgress >= 100) {
                        clearInterval(interval);
                        return { ...f, progress: 100, status: "completed" };
                      }
                      return { ...f, progress: newProgress };
                    }
                    return f;
                  }));
                }, 200);
              });
            }}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Recent Uploads</h4>
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Badge variant="outline" className={getStatusColor(file.status)}>
                      {getStatusText(file.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={file.progress} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                </div>
                {file.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}