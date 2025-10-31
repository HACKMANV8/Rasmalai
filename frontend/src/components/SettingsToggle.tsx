/**
 * Settings Toggle Component
 * For mic and location permissions
 */

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, MapPin, CheckCircle2, XCircle } from "lucide-react";

interface SettingsToggleProps {
  micEnabled: boolean;
  locationEnabled: boolean;
  onMicToggle: (enabled: boolean) => void;
  onLocationToggle: (enabled: boolean) => void;
}

export function SettingsToggle({
  micEnabled,
  locationEnabled,
  onMicToggle,
  onLocationToggle,
}: SettingsToggleProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">System Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              micEnabled ? "bg-success/10" : "bg-muted"
            }`}>
              <Mic className={`h-5 w-5 ${micEnabled ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mic-toggle" className="text-base font-medium cursor-pointer">
                Microphone Access
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable audio monitoring for distress detection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {micEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <Switch
              id="mic-toggle"
              checked={micEnabled}
              onCheckedChange={onMicToggle}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              locationEnabled ? "bg-info/10" : "bg-muted"
            }`}>
              <MapPin className={`h-5 w-5 ${locationEnabled ? "text-info" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location-toggle" className="text-base font-medium cursor-pointer">
                Location Services
              </Label>
              <p className="text-sm text-muted-foreground">
                Share location with emergency contacts when alert is triggered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {locationEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-info" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <Switch
              id="location-toggle"
              checked={locationEnabled}
              onCheckedChange={onLocationToggle}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

