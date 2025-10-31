import { useEffect, useState } from "react";
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
import { api, type Alert } from "@/lib/api";

const mockAlertHistory = [
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
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const alerts = await api.getAlertHistory(100);
        setAlertHistory(alerts);
        
        // Calculate stats
        const total = alerts.length;
        const high = alerts.filter(a => (a.confidence || 0) > 0.8).length;
        const resolved = alerts.filter(a => a.status === 'responded' || a.status === 'cancelled').length;
        setStats({ total, high, resolved });
      } catch (error) {
        console.error("Failed to fetch alert history:", error);
        // Fallback to mock data
        setAlertHistory(mockAlertHistory as any);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-accent text-accent-foreground";
    if (confidence > 0.5) return "bg-warning text-warning-foreground";
    return "bg-info text-info-foreground";
  };

  const getSeverityLabel = (confidence: number) => {
    if (confidence > 0.8) return "high";
    if (confidence > 0.5) return "medium";
    return "low";
  };

  const getTypeIcon = (source: string) => {
    if (source.includes("keyword")) return <AlertTriangle className="h-4 w-4" />;
    if (source.includes("emotion")) return <Bell className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
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
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
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
              <p className="mt-2 text-3xl font-bold">{stats.high}</p>
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
              <p className="mt-2 text-3xl font-bold">{stats.resolved}</p>
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
                {alertHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No alert history available
                    </TableCell>
                  </TableRow>
                ) : (
                  alertHistory.map((alert) => {
                    const confidence = alert.confidence || 0;
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-mono text-sm">{alert.id}</TableCell>
                        <TableCell className="text-sm">{formatTimestamp(alert.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(alert.source)}
                            <span className="text-sm">{alert.source}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{alert.message.substring(0, 30)}...</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(confidence)}>
                            {getSeverityLabel(confidence)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {alert.status === 'responded' ? 'Email sent' : 
                           alert.status === 'cancelled' ? 'Cancelled' : 
                           alert.status === 'confirmed' ? 'Emergency triggered' : 
                           'Pending'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              alert.status === 'responded' || alert.status === 'cancelled'
                                ? "border-success text-success"
                                : alert.status === 'confirmed'
                                ? "border-warning text-warning"
                                : "border-muted text-muted"
                            }
                          >
                            {alert.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
