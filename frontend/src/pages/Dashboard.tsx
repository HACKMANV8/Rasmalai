import { AudioMonitor } from "@/components/AudioMonitor";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Active Alerts",
      value: "0",
      icon: AlertTriangle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Monitors",
      value: "24/7",
      icon: Shield,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Response Time",
      value: "< 2s",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "System Health",
      value: "100%",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emergency Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time audio monitoring and emergency response system
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <AudioMonitor />
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-4">
          {[
            {
              time: "2 minutes ago",
              event: "System health check completed",
              type: "success",
            },
            {
              time: "15 minutes ago",
              event: "Audio monitoring resumed",
              type: "info",
            },
            {
              time: "1 hour ago",
              event: "Contact list updated",
              type: "info",
            },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div
                className={`h-2 w-2 rounded-full ${
                  activity.type === "success" ? "bg-success" : "bg-info"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.event}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
