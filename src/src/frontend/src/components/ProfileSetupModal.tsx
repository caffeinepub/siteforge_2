import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const createProfile = useCreateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error("Username and display name are required");
      return;
    }
    try {
      await createProfile.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      toast.success("Profile created successfully!");
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="profile_setup.dialog"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-foreground">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your SiteForge profile to get started building and trading
            sites.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-foreground">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
              className="bg-input border-border"
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourhandle"
              className="bg-input border-border"
              data-ocid="profile_setup.username.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-foreground">
              Bio (optional)
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="bg-input border-border resize-none"
              data-ocid="profile_setup.textarea"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-semibold"
            disabled={createProfile.isPending}
            data-ocid="profile_setup.submit_button"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
