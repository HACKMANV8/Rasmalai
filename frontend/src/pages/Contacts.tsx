import { useState, useEffect } from "react";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const fetchedContacts = await api.getContacts();
        setContacts(
          fetchedContacts.map((c, idx) => ({
            id: `contact_${idx}`,
            name: c.name,
            email: c.email,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await api.addContact(newContact.name, newContact.email);
      const fetchedContacts = await api.getContacts();
      setContacts(
        fetchedContacts.map((c, idx) => ({
          id: `contact_${idx}`,
          name: c.name,
          email: c.email,
        }))
      );
      setNewContact({ name: "", email: "" });
      setIsDialogOpen(false);
      toast.success("Contact added successfully");
    } catch (error) {
      console.error("Failed to add contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleDeleteContact = async (id: string) => {
    // For now, just remove from local state
    // In production, you'd want an API endpoint to delete contacts
    setContacts(contacts.filter((contact) => contact.id !== id));
    toast.success("Contact deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
          <p className="text-muted-foreground">Manage your emergency contact list</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="border-dashed p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Add Emergency Contact</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add people who should be notified in case of an emergency
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Add New Contact
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} {...contact} onDelete={handleDeleteContact} />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new emergency contact to your list. They will receive email alerts when distress is detected.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@email.com"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={!newContact.name || !newContact.email}>
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
