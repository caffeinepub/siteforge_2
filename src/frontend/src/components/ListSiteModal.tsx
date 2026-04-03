import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useListSite } from "../hooks/useQueries";

interface ListSiteModalProps {
  siteId: string;
  siteTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ListSiteModal({
  siteId,
  siteTitle,
  open,
  onClose,
}: ListSiteModalProps) {
  const [priceInput, setPriceInput] = useState("");
  const [description, setDescription] = useState("");
  const listSite = useListSite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number.parseFloat(priceInput);
    if (!priceNum || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a listing description");
      return;
    }
    try {
      const priceInCents = BigInt(Math.round(priceNum * 100));
      await listSite.mutateAsync({
        id: siteId,
        price: priceInCents,
        listingDescription: description.trim(),
      });
      toast.success(`${siteTitle} listed on marketplace!`);
      onClose();
    } catch {
      toast.error("Failed to list site. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="list_site.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-foreground">
            List Site for Sale
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-foreground mb-1.5 block">Site</Label>
            <p className="text-muted-foreground text-sm">{siteTitle}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-foreground">
              Listing Price (USD)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="99.00"
                className="pl-9 bg-input border-border"
                data-ocid="list_site.input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listDesc" className="text-foreground">
              Listing Description
            </Label>
            <Textarea
              id="listDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what buyers are getting..."
              rows={4}
              className="bg-input border-border resize-none"
              data-ocid="list_site.textarea"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border"
              data-ocid="list_site.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={listSite.isPending}
              data-ocid="list_site.submit_button"
            >
              {listSite.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                "List for Sale"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
