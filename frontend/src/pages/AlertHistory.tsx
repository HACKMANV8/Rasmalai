import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Bell, CheckCircle2, Clock } from "lucide-react";

const alertHistory = [
  {
    id: "ALT-001",
    timestamp: "2025-10-31 14:32:15",
    type: "Keyword Detected",
    keyword: "help",
    severity: "high",
    action: "Alerted primary contact",
    status: "resolved",
  },
  {
    id: "ALT-002",
    timestamp: "2025-10-31 12:15:42",
    type: "Emotion Alert",
    keyword: "distress detected",
    severity: "medium",
    action: "Monitoring increased",
    status: "resolved",
  },
  {
    id: "ALT-003",
    timestamp: "2025-10-31 09:45:23",
    type: "Keyword Detected",
    keyword: "emergency",
    severity: "high",
    action: "Triggered alarm + SMS",
    status: "resolved",
  },
  {
    id: "ALT-004",
    timestamp: "2025-10-30 18:22:10",
    type: "System Alert",
    keyword: "audio threshold",
    severity: "low",
    action: "Logged event",
    status: "resolved",
  },
  {
    id: "ALT-005",
    timestamp: "2025-10-30 15:10:05",
    type: "Keyword Detected",
    keyword: "accident",
    severity: "high",
    action: "Alerted all contacts",
    status: "resolved",
  },
];

export default function AlertHistory() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-accent text-accent-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-info text-info-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Keyword Detected":
        return <AlertTriangle className="h-4 w-4" />;
      case "Emotion Alert":
        return <Bell className="h-4 w-4" />;
      case "System Alert":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alert History</h1>
        <p className="text-muted-foreground">View and manage past emergency alerts</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
              <p className="mt-2 text-3xl font-bold">127</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
              <Bell className="h-6 w-6 text-info" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Severity</p>
              <p className="mt-2 text-3xl font-bold">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <p className="mt-2 text-3xl font-bold">127</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Alerts</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action Taken</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertHistory.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-mono text-sm">{alert.id}</TableCell>
                    <TableCell className="text-sm">{alert.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <span className="text-sm">{alert.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{alert.keyword}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{alert.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-success text-success">
                        {alert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
