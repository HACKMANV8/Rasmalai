import { useState, useEffect } from "react";
import { AudioMonitor } from "@/components/AudioMonitor";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { DistressAlertDialog } from "@/components/AlertDialog";
import { SettingsToggle } from "@/components/SettingsToggle";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    source: string;
    confidence: number;
    message: string;
    timestamp: string;
  } | null>(null);
  const [alertStats, setAlertStats] = useState({ active: 0, total: 0 });
  const [micEnabled, setMicEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Request location permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    // Poll for active alerts
    const interval = setInterval(async () => {
      try {
        const alerts = await api.getActiveAlerts();
        setAlertStats({ active: alerts.length, total: alerts.length });
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleDistressDetected = (alert: {
    id: string;
    source: string;
    confidence: number;
    message: string;
    timestamp: string;
  }) => {
    setActiveAlert(alert);
  };

  const handleCancelAlert = async () => {
    if (activeAlert) {
      try {
        await api.cancelAlert(activeAlert.id);
        setActiveAlert(null);
      } catch (error) {
        console.error("Failed to cancel alert:", error);
      }
    }
  };

  const handleConfirmAlert = async () => {
    if (activeAlert) {
      try {
        await api.confirmAlert(activeAlert.id);
        setActiveAlert(null);
      } catch (error) {
        console.error("Failed to confirm alert:", error);
      }
    }
  };
  const stats = [
    {
      title: "Active Alerts",
      value: alertStats.active.toString(),
      icon: AlertTriangle,
      color: alertStats.active > 0 ? "text-destructive" : "text-success",
      bgColor: alertStats.active > 0 ? "bg-destructive/10" : "bg-success/10",
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
      <SettingsToggle
        micEnabled={micEnabled}
        locationEnabled={locationEnabled}
        onMicToggle={(enabled) => {
          setMicEnabled(enabled);
          // Request mic permission
          if (enabled) {
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then(() => setMicEnabled(true))
              .catch(() => {
                setMicEnabled(false);
                alert("Microphone permission denied. Please allow microphone access.");
              });
          }
        }}
        onLocationToggle={(enabled) => {
          setLocationEnabled(enabled);
          // Request location permission
          if (enabled) {
            navigator.geolocation.getCurrentPosition(
              () => setLocationEnabled(true),
              () => {
                setLocationEnabled(false);
                alert("Location permission denied. Please allow location access.");
              },
              { enableHighAccuracy: true }
            );
          }
        }}
      />
      <AudioMonitor 
        onDistressDetected={handleDistressDetected}
        enabled={micEnabled}
      />
      <DistressAlertDialog
        alert={activeAlert}
        open={!!activeAlert}
        onClose={() => setActiveAlert(null)}
        onConfirm={handleConfirmAlert}
        onCancel={handleCancelAlert}
      />
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
