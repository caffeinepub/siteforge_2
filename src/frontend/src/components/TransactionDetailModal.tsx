import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  Copy,
  Download,
  FileText,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleTimeString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TxStatus = Transaction["status"];

function getStatusConfig(status: TxStatus) {
  if (status.__kind__ === "completed") {
    return {
      label: "Completed",
      color: "#22c55e",
      bgGradient: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
      icon: CheckCircle,
      pulse: "#22c55e",
    };
  }
  if (status.__kind__ === "pending") {
    return {
      label: "Pending",
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #1c1400 0%, #292400 100%)",
      icon: Clock,
      pulse: "#f59e0b",
    };
  }
  return {
    label: "Cancelled",
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, #1c0000 0%, #290000 100%)",
    icon: XCircle,
    pulse: "#ef4444",
  };
}

const USD_TO_INR = 83.5;

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;
  const usdAmount = Number(transaction.price) / 100;
  const inrAmount = usdAmount * USD_TO_INR;
  const isCompleted = transaction.status.__kind__ === "completed";
  const isPending = transaction.status.__kind__ === "pending";

  const billOfSale =
    transaction.status.__kind__ === "completed"
      ? transaction.status.completed.billOfSale
      : null;

  const steps = [
    {
      label: "Payment Initiated",
      icon: "💳",
      done: true,
      time: formatDateShort(transaction.createdAt),
    },
    {
      label: "Payment Verified",
      icon: "✅",
      done: !isPending,
      time: !isPending ? formatDateShort(transaction.createdAt) : null,
    },
    {
      label: "Site Transfer",
      icon: "🌐",
      done: isCompleted,
      time: isCompleted ? formatDateShort(transaction.createdAt) : null,
    },
    {
      label: "Ownership Confirmed",
      icon: "🏆",
      done: isCompleted,
      time: isCompleted ? formatDateShort(transaction.createdAt) : null,
    },
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const receipt = [
      "========================================",
      "        SITEFORGE TRANSACTION RECEIPT",
      "========================================",
      "",
      `Transaction ID : ${transaction.id}`,
      `Status         : ${statusConfig.label}`,
      `Date           : ${formatDate(transaction.createdAt)}`,
      `Site ID        : ${transaction.siteId}`,
      "",
      "--- PAYMENT DETAILS ---",
      `Amount (USD)   : $${usdAmount.toFixed(2)}`,
      `Amount (INR)   : ₹${inrAmount.toFixed(2)}`,
      `Platform Fee   : $${(usdAmount * 0.01).toFixed(2)} (1%)`,
      "",
      "--- PARTIES ---",
      `Buyer          : ${transaction.buyer.toString()}`,
      `Seller         : ${transaction.seller.toString()}`,
      "",
      ...(billOfSale ? ["--- BILL OF SALE ---", billOfSale, ""] : []),
      "========================================",
      "       Powered by SiteForge · caffeine.ai",
      "========================================",
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siteforge-receipt-${transaction.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-lg bg-[#0a0a0f] border border-white/10 p-0 max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
        data-ocid="transaction_detail.dialog"
      >
        {/* Gradient Header */}
        <div
          style={{ background: statusConfig.bgGradient }}
          className="px-6 pt-8 pb-6 rounded-t-2xl border-b border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Animated status dot */}
              <div className="relative flex items-center justify-center w-10 h-10">
                <div
                  className="absolute w-10 h-10 rounded-full opacity-30 animate-ping"
                  style={{ background: statusConfig.pulse }}
                />
                <div
                  className="relative w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: statusConfig.color }}
                >
                  <StatusIcon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-white/60 text-xs font-medium uppercase tracking-widest mb-0.5">
                  Transaction
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </div>
              </div>
            </div>
            {/* Payment method badge */}
            <Badge className="bg-white/10 text-white/80 border-white/20 gap-1">
              <Shield className="w-3 h-3" />
              Secure Payment
            </Badge>
          </div>

          {/* Big amount display */}
          <div className="text-center py-2">
            <div className="text-4xl font-black text-white mb-1">
              ${usdAmount.toFixed(2)}
            </div>
            <div className="text-white/50 text-sm font-medium">
              ₹{inrAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
              <span className="text-white/30 text-xs">INR</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Timeline */}
          <div>
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
              Transaction Progress
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-white/10" />
              <div className="space-y-4">
                {steps.map((step, _i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                        step.done
                          ? "bg-green-500/20 ring-2 ring-green-500/50"
                          : "bg-white/5 ring-1 ring-white/10"
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          step.done ? "text-white" : "text-white/30"
                        }`}
                      >
                        {step.icon} {step.label}
                      </span>
                      {step.time && (
                        <span className="text-xs text-white/30">
                          {step.time}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 col-span-2">
              <div className="text-white/40 text-xs mb-1">Transaction ID</div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-white/80 font-mono text-xs truncate">
                  {transaction.id}
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="shrink-0 w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  data-ocid="transaction_detail.copy_id.button"
                >
                  <Copy className="w-3 h-3 text-white/60" />
                </button>
              </div>
              {copied && (
                <div className="text-green-400 text-xs mt-1">✓ Copied!</div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Date</div>
              <div className="text-white/80 text-xs">
                {formatDate(transaction.createdAt)}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">
                Platform Fee (1%)
              </div>
              <div className="text-white/80 text-sm font-semibold">
                ${(usdAmount * 0.01).toFixed(2)}{" "}
                <span className="text-white/30 text-xs">
                  ₹{(inrAmount * 0.01).toFixed(0)}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Site ID</div>
              <div className="text-white/80 font-mono text-xs truncate">
                {transaction.siteId}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Net Amount</div>
              <div className="text-green-400 text-sm font-bold">
                ${(usdAmount * 0.99).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Bill of Sale */}
          {billOfSale && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Digital Bill of Sale
              </p>
              <div className="bg-black/40 rounded-lg p-3 text-xs text-white/50 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                {billOfSale}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleDownloadReceipt}
              className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold gap-2"
              variant="outline"
              data-ocid="transaction_detail.download_receipt.button"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
              data-ocid="transaction_detail.close.button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
