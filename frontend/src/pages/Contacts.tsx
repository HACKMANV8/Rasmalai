import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, UserPlus } from "lucide-react";

const emergencyContacts = [
  {
    name: "John Smith",
    relation: "Primary Emergency Contact",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
  },
  {
    name: "Sarah Johnson",
    relation: "Secondary Contact",
    phone: "+1 (555) 234-5678",
    email: "sarah.j@email.com",
  },
  {
    name: "Emergency Services",
    relation: "911 Dispatcher",
    phone: "911",
  },
  {
    name: "Dr. Michael Chen",
    relation: "Personal Physician",
    phone: "+1 (555) 345-6789",
    email: "dr.chen@medical.com",
  },
];

export default function Contacts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
          <p className="text-muted-foreground">Manage your emergency contact list</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>
      <Card className="border-dashed p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Add Emergency Contact</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add people who should be notified in case of an emergency
          </p>
          <Button variant="outline" className="mt-4">
            Add New Contact
          </Button>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {emergencyContacts.map((contact, index) => (
          <ContactCard key={index} {...contact} />
        ))}
      </div>
      <Card className="border-accent/50 bg-accent/5 p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <span className="text-lg">ℹ️</span>
          </div>
          <div>
            <h4 className="font-semibold">Contact Priority</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Contacts are notified in order from top to bottom. Primary contacts receive
              immediate alerts, while secondary contacts are notified after a short delay.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
