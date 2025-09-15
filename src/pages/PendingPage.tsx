import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockReviews = [
  {
    id: "1",
    title: "Contract Analysis - Partnership Agreement",
    document: "Partnership_Contract_2024.pdf",
    reviewer: { name: "Sarah Johnson", initials: "SJ" },
    priority: "high",
    dueDate: "2024-01-15",
    submittedDate: "2024-01-10",
    status: "pending"
  },
  {
    id: "2",
    title: "Medical Records Classification",
    document: "Patient_Records_Batch_847.docx", 
    reviewer: { name: "Dr. Smith", initials: "DS" },
    priority: "medium",
    dueDate: "2024-01-16",
    submittedDate: "2024-01-11",
    status: "in-review"
  },
  {
    id: "3",
    title: "Invoice Validation Q4",
    document: "Q4_Invoices_2024.xlsx",
    reviewer: { name: "Mike Chen", initials: "MC" },
    priority: "high",
    dueDate: "2024-01-14",
    submittedDate: "2024-01-09",
    status: "pending"
  }
];

export default function PendingPage() {
  const [reviews, setReviews] = useState(mockReviews);

  const handleReviewAction = (reviewId: string, action: "approve" | "reject" | "view") => {
    if (action === "view") {
      toast({
        title: "Opening Review",
        description: "Loading detailed review interface..."
      });
    } else {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: action === "approve" ? "approved" : "rejected" }
          : review
      ));
      toast({
        title: `Review ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `Document review has been ${action === "approve" ? "approved" : "rejected"}.`
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Pending Reviews</h1>
                <p className="text-muted-foreground">
                  Documents waiting for review and approval
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Review Queue ({reviews.filter(r => r.status === "pending").length} pending)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{review.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{review.document}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                  {review.reviewer.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-muted-foreground">{review.reviewer.name}</span>
                            </div>
                            <Badge variant={review.priority === "high" ? "destructive" : "secondary"}>
                              {review.priority} priority
                            </Badge>
                            <span className="text-muted-foreground">Due {review.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReviewAction(review.id, "view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {review.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewAction(review.id, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewAction(review.id, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {review.status !== "pending" && (
                          <Badge variant={review.status === "approved" ? "default" : "destructive"}>
                            {review.status}
                          </Badge>
                        )}
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