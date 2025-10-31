import { Mail, User, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactCardProps {
  id: string;
  name: string;
  email: string;
  onDelete: (id: string) => void;
}

export function ContactCard({ id, name, email, onDelete }: ContactCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">{name}</h4>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
