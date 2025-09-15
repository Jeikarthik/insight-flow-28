import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Download, Eye, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockDocuments = [
  {
    id: "1",
    name: "Contract_Q4_2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2024-01-10",
    status: "processed",
    tags: ["contract", "legal"]
  },
  {
    id: "2", 
    name: "Medical_Records_Batch_847.docx",
    type: "DOCX",
    size: "1.8 MB",
    uploadDate: "2024-01-09",
    status: "processing",
    tags: ["medical", "records"]
  },
  {
    id: "3",
    name: "Invoice_January_2024.xlsx",
    type: "XLSX", 
    size: "856 KB",
    uploadDate: "2024-01-08",
    status: "processed",
    tags: ["finance", "invoice"]
  }
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents] = useState(mockDocuments);

  const handleDocumentAction = (action: string, docName: string) => {
    toast({
      title: `Document ${action}`,
      description: `${action} operation initiated for ${docName}`
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Document Library</h1>
                <p className="text-muted-foreground">
                  Browse and manage your uploaded documents
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Documents ({filteredDocuments.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.type} • {doc.size}</span>
                            <span>Uploaded {doc.uploadDate}</span>
                            <Badge variant={doc.status === "processed" ? "default" : "secondary"}>
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("View", doc.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("Download", doc.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("Delete", doc.name)}
                        >
                          <Trash2 className="h-4 w-4" />
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