import { useEffect, useState } from "react";
import { Activity, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AudioMonitor() {
  const [level, setLevel] = useState(45);
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
  
    const interval = setInterval(() => {
      setLevel(Math.floor(Math.random() * 40) + 30);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Mic className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Audio Monitor</h3>
              <p className="text-sm text-muted-foreground">Real-time audio analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent"></span>
            </div>
            <span className="text-sm font-medium text-accent">
              {isListening ? "Listening..." : "Paused"}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success via-warning to-accent transition-all duration-150"
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
            <span className="min-w-[3rem] text-right text-sm font-medium">
              {level}%
            </span>
          </div>
          <div className="flex h-24 items-end justify-between gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const height = Math.random() * 100;
              const delay = i * 50;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-accent/20 transition-all duration-150"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${delay}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Sensitivity</p>
            <p className="text-lg font-semibold">High</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Alert</p>
            <p className="text-lg font-semibold">2m ago</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Keywords</p>
            <p className="text-lg font-semibold">Active</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
