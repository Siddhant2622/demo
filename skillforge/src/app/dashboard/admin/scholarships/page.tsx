"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, FileText } from "lucide-react";

export default function AdminScholarshipsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/scholarships");
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/admin/scholarships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchApplications();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scholarship Admin Panel</h1>
        <p className="text-muted-foreground">Manage incoming scholarship applications and update their statuses.</p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Applicant</TableHead>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const data = JSON.parse(app.application_data || "{}");
                    return (
                      <TableRow key={app.id} className="border-border">
                        <TableCell>
                          <div className="font-medium">{data.fullName || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{data.email}</div>
                        </TableCell>
                        <TableCell>{app.scholarship?.title}</TableCell>
                        <TableCell>{new Date(app.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={app.status} 
                            onValueChange={(val) => handleStatusChange(app.id, val)}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-background/50">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Application Submitted">Application Submitted</SelectItem>
                              <SelectItem value="Documents Verified">Documents Verified</SelectItem>
                              <SelectItem value="Under Review">Under Review</SelectItem>
                              <SelectItem value="Interview Round">Interview Round</SelectItem>
                              <SelectItem value="Final Selection">Final Selection</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="View Application">
                              <Eye className="w-4 h-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download Resume">
                              <Download className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
