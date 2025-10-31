/**
 * Alert Dialog Component
 * Shows when distress is detected and allows user to confirm or cancel
 */

import {
  AlertDialog as UIAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DistressAlertDialogProps {
  alert: {
    id: string;
    source: string;
    confidence: number;
    message: string;
    timestamp: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DistressAlertDialog({ alert, open, onClose, onConfirm, onCancel }: DistressAlertDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [autoConfirm, setAutoConfirm] = useState(false);

  useEffect(() => {
    if (!open || !alert) return;

    setCountdown(10);
    setAutoConfirm(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setAutoConfirm(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, alert]);

  useEffect(() => {
    if (autoConfirm && alert) {
      // Auto-confirm when countdown reaches 0
      onConfirm();
    }
  }, [autoConfirm, alert, onConfirm]);

  if (!alert) return null;

  return (
    <UIAlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl">🚨 DISTRESS ALERT</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Emergency response will trigger in {countdown} seconds
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Is this a FALSE POSITIVE?</strong>
              <br />
              Click "Cancel Alert" to stop emergency response
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">{alert.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{(alert.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Details:</span>
              <span className="font-medium text-right max-w-[250px] truncate">{alert.message}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-muted hover:bg-muted/80"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Alert
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm Emergency ({countdown}s)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </UIAlertDialog>
  );
}

