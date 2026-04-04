import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import type { Transaction } from "../backend";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status.__kind__ === "completed") {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    );
  }
  if (status.__kind__ === "pending") {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
      <XCircle className="w-3 h-3 mr-1" />
      Cancelled
    </Badge>
  );
}

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const billOfSale =
    transaction.status.__kind__ === "completed"
      ? transaction.status.completed.billOfSale
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg bg-card border-border"
        data-ocid="transaction_detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Status</span>
            <StatusBadge status={transaction.status} />
          </div>
          <Separator className="bg-border" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-0.5">Transaction ID</p>
              <p className="text-foreground font-mono text-xs truncate">
                {transaction.id}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Date</p>
              <p className="text-foreground">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Price</p>
              <p className="text-foreground font-semibold">
                ${(Number(transaction.price) / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Site ID</p>
              <p className="text-foreground font-mono text-xs truncate">
                {transaction.siteId}
              </p>
            </div>
          </div>

          {billOfSale && (
            <>
              <Separator className="bg-border" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Digital Bill of
                  Sale
                </p>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {billOfSale}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
