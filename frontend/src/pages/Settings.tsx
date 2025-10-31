import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Mic, Shield, Volume2 } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your monitoring preferences</p>
      </div>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Mic className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Monitoring Settings</h3>
              <p className="text-sm text-muted-foreground">Configure audio monitoring behavior</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="monitoring">Enable Real-time Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Continuously analyze audio for emergency keywords
                </p>
              </div>
              <Switch id="monitoring" defaultChecked />
            </div>

            <div className="space-y-3">
              <Label>Audio Sensitivity Level</Label>
              <div className="flex items-center gap-4">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <Slider defaultValue={[75]} max={100} step={1} className="flex-1" />
                <span className="min-w-[3rem] text-right text-sm font-medium">75%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Higher sensitivity detects quieter sounds but may increase false alerts
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="background">Background Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Continue monitoring even when app is minimized
                </p>
              </div>
              <Switch id="background" defaultChecked />
            </div>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Alert Settings</h3>
              <p className="text-sm text-muted-foreground">Configure how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="alert-method">Primary Alert Method</Label>
              <Select defaultValue="all">
                <SelectTrigger id="alert-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods (SMS + Email + Popup)</SelectItem>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="popup">Popup Notification Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sound">Alert Sound</Label>
                <p className="text-sm text-muted-foreground">Play sound when alert is triggered</p>
              </div>
              <Switch id="sound" defaultChecked />
            </div>

            <div className="space-y-3">
              <Label>Alert Delay (seconds)</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[2]} max={10} step={1} className="flex-1" />
                <span className="min-w-[3rem] text-right text-sm font-medium">2s</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Time before sending alert to allow for false positive cancellation
              </p>
            </div>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security & Privacy</h3>
              <p className="text-sm text-muted-foreground">Manage data and privacy settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="encryption">End-to-End Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt all audio data and alerts
                </p>
              </div>
              <Switch id="encryption" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="storage">Local Audio Storage</Label>
                <p className="text-sm text-muted-foreground">
                  Store audio clips for review (requires more storage)
                </p>
              </div>
              <Switch id="storage" />
            </div>

            <div className="space-y-3">
              <Label>Data Retention Period</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
