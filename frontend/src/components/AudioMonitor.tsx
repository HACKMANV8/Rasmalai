import { useEffect, useState, useRef } from "react";
import { Activity, Mic, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, type AnalyzeResponse } from "@/lib/api";
import { toast } from "sonner";

interface AudioMonitorProps {
  onDistressDetected?: (alert: { id: string; source: string; confidence: number; message: string; timestamp: string }) => void;
  enabled?: boolean;
}

export function AudioMonitor({ onDistressDetected, enabled = true }: AudioMonitorProps) {
  const [level, setLevel] = useState(45);
  const [isListening, setIsListening] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalyzeResponse | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      // Only analyze when final result is available
      if (event.results[event.results.length - 1].isFinal && transcript.trim()) {
        setIsProcessing(true);
        try {
          // Simulate volume/pitch for now (could use Web Audio API for real values)
          const volume = level / 100;
          const pitch = 200 + (level * 2);
          
          const result = await api.analyze(transcript, volume, pitch);
          setLastResult(result);
          
          if (result.distress_detected && result.alert_id && onDistressDetected) {
            onDistressDetected({
              id: result.alert_id,
              source: result.result.reason || 'unknown',
              confidence: result.result.confidence,
              message: transcript,
              timestamp: result.timestamp,
            });
            toast.error("🚨 Distress Detected!", {
              description: "Emergency alert triggered",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Failed to analyze audio");
        } finally {
          setIsProcessing(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    if (isListening && enabled) {
      recognition.start();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, level, onDistressDetected, enabled]);

  // Simulate audio level visualization
  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening && !isProcessing) {
        setLevel(Math.floor(Math.random() * 40) + 30);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isListening, isProcessing]);

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
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? "Pause" : "Start"}
            </Button>
            <div className="relative flex h-3 w-3">
              {isListening && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              )}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isListening ? "bg-accent" : "bg-muted"}`}></span>
            </div>
            <span className="text-sm font-medium text-accent">
              {isProcessing ? "Analyzing..." : isListening ? "Listening..." : "Paused"}
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
        {lastResult && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {lastResult.distress_detected ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <Activity className="h-4 w-4 text-success" />
              )}
              <span className="text-sm font-medium">
                {lastResult.distress_detected ? "Distress Detected" : "All Clear"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Emotion: {lastResult.result.emotion} | Confidence: {(lastResult.result.confidence * 100).toFixed(0)}%
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Sensitivity</p>
            <p className="text-lg font-semibold">High</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-lg font-semibold">{isListening ? "Active" : "Paused"}</p>
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
