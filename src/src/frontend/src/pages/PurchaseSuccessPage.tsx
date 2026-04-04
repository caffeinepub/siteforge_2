import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  LayoutDashboard,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import {
  useFinalizeTransaction,
  useGetStripeSessionStatus,
} from "../hooks/useQueries";

export default function PurchaseSuccessPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  const transactionId = urlParams.get("transaction_id");

  const { data: sessionStatus, isLoading } =
    useGetStripeSessionStatus(sessionId);
  const finalizeTransaction = useFinalizeTransaction();
  const [finalized, setFinalized] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: finalizeTransaction is stable from useMutation
  useEffect(() => {
    if (
      sessionStatus &&
      sessionStatus.__kind__ === "completed" &&
      transactionId &&
      !finalized &&
      !finalizing
    ) {
      setFinalizing(true);
      const billOfSale = `DIGITAL BILL OF SALE\n\nDate: ${new Date().toISOString()}\nTransaction ID: ${transactionId}\nSession ID: ${sessionId}\n\nThis document confirms the legal transfer of digital asset ownership from Seller to Buyer.\nAll rights, credentials, and access to the website have been transferred to the Buyer.\n\nThis transaction was processed securely via SiteForge.`;

      finalizeTransaction
        .mutateAsync({ transactionId, billOfSale })
        .then(() => {
          setFinalized(true);
          setFinalizing(false);
          toast.success("Ownership transfer complete!");
        })
        .catch(() => {
          setError("Failed to finalize transaction. Please contact support.");
          setFinalizing(false);
        });
    }
  }, [sessionStatus, transactionId, finalized, finalizing]);

  const isSuccess = sessionStatus?.__kind__ === "completed";
  const isFailed = sessionStatus?.__kind__ === "failed";

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 hero-glow pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md w-full card-glow bg-card border border-border rounded-2xl p-10 text-center"
          data-ocid="purchase_success.card"
        >
          {isLoading || finalizing ? (
            <>
              <Loader2
                className="w-16 h-16 text-primary mx-auto mb-6 animate-spin"
                data-ocid="purchase_success.loading_state"
              />
              <h1 className="font-display font-bold text-2xl text-foreground mb-3">
                {finalizing
                  ? "Transferring Ownership..."
                  : "Verifying Payment..."}
              </h1>
              <p className="text-muted-foreground">
                Please wait while we process your transaction and transfer
                ownership.
              </p>
            </>
          ) : isFailed || error ? (
            <>
              <XCircle
                className="w-16 h-16 text-destructive mx-auto mb-6"
                data-ocid="purchase_success.error_state"
              />
              <h1 className="font-display font-bold text-2xl text-foreground mb-3">
                Payment Failed
              </h1>
              <p className="text-muted-foreground mb-8">
                {error ||
                  (sessionStatus?.__kind__ === "failed"
                    ? sessionStatus.failed.error
                    : "Something went wrong. Please try again.")}
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 font-semibold"
              >
                <Link
                  to="/marketplace"
                  data-ocid="purchase_success.marketplace.button"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Back to Marketplace
                </Link>
              </Button>
            </>
          ) : isSuccess && finalized ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <CheckCircle
                  className="w-20 h-20 text-green-400 mx-auto mb-6"
                  data-ocid="purchase_success.success_state"
                />
              </motion.div>
              <h1 className="font-display font-bold text-3xl text-foreground mb-3">
                Ownership Transferred! 🎉
              </h1>
              <p className="text-muted-foreground mb-2">
                Your purchase is complete. The site is now yours.
              </p>
              <p className="text-muted-foreground text-sm mb-8">
                A digital bill of sale has been generated and saved to your
                transaction history.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 font-semibold"
                >
                  <Link
                    to="/dashboard"
                    data-ocid="purchase_success.dashboard.button"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="border-border" asChild>
                  <Link
                    to="/marketplace"
                    data-ocid="purchase_success.marketplace.button"
                  >
                    Browse More Sites
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="font-display font-bold text-2xl text-foreground mb-3">
                Processing...
              </h1>
              <p className="text-muted-foreground">
                Loading transaction status.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
