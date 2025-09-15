import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Upload Documents</h1>
                <p className="text-muted-foreground">
                  Upload and process your documents with AI-powered analysis
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <UploadZone />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Supported Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">Documents</p>
                      <p className="text-muted-foreground">PDF, DOC, DOCX, TXT</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Images</p>
                      <p className="text-muted-foreground">PNG, JPG, JPEG</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Spreadsheets</p>
                      <p className="text-muted-foreground">XLS, XLSX, CSV</p>
                    </div>
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