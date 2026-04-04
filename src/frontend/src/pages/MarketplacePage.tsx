import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CreditCard,
  ExternalLink,
  Globe,
  IndianRupee,
  Loader2,
  Phone,
  Search,
  Send,
  ShoppingBag,
  Tag,
  UserCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Site } from "../backend";
import { Layout } from "../components/Layout";
import { loadSellerAccounts } from "../components/ListSiteModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetMarketplaceListings,
} from "../hooks/useQueries";
import { PinBoxes, hasPhonePePIN, loadPhonePePIN } from "./ChatTab";

const CATEGORIES = [
  "All",
  "SaaS",
  "E-Commerce",
  "Portfolio",
  "Blog",
  "Startup",
  "Restaurant",
  "Agency",
];

const THUMBNAILS = [
  "/assets/generated/site-thumb-saas.dim_600x400.jpg",
  "/assets/generated/site-thumb-ecommerce.dim_600x400.jpg",
  "/assets/generated/site-thumb-portfolio.dim_600x400.jpg",
  "/assets/generated/site-thumb-blog.dim_600x400.jpg",
  "/assets/generated/site-thumb-startup.dim_600x400.jpg",
  "/assets/generated/site-thumb-restaurant.dim_600x400.jpg",
];

type PaymentMethod = "icp" | "paypal" | "phonepe" | "fampay" | "stripe";

const USD_TO_INR = 83.5;
const USD_TO_ICP = 0.012;
const COMMISSION_RATE = 0.01;

function getThumbnail(index: number) {
  return THUMBNAILS[index % THUMBNAILS.length];
}

function getListingPrice(site: Site): bigint {
  if (site.status.__kind__ === "listed") return site.status.listed.price;
  return 0n;
}

function getListingDescription(site: Site): string {
  if (site.status.__kind__ === "listed")
    return site.status.listed.listingDescription;
  return site.description;
}

function getPublishedUrl(site: Site): string | null {
  if (site.status.__kind__ === "published") return site.status.published;
  return null;
}

function usdToIcp(priceInCents: bigint): string {
  const usd = Number(priceInCents) / 100;
  return (usd * USD_TO_ICP).toFixed(4);
}

function usdToInr(priceInCents: bigint): string {
  const usd = Number(priceInCents) / 100;
  return (usd * USD_TO_INR).toFixed(0);
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
}[] = [
  {
    id: "icp",
    name: "ICP Token",
    shortName: "ICP",
    description: "Pay with ICP tokens. Fast, decentralized, zero fees.",
    icon: (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-md">
        <Zap className="w-4 h-4 text-white" />
      </div>
    ),
    accentColor: "text-violet-400",
    borderColor: "border-violet-500",
    badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  {
    id: "paypal",
    name: "PayPal",
    shortName: "PayPal",
    description: "Pay with your PayPal account. Trusted worldwide.",
    icon: (
      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-lg leading-none">P</span>
      </div>
    ),
    accentColor: "text-blue-400",
    borderColor: "border-blue-500",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    shortName: "PhonePe",
    description: "UPI payment via PhonePe. Instant transfer in INR.",
    icon: (
      <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
        <Phone className="w-4 h-4 text-white" />
      </div>
    ),
    accentColor: "text-purple-400",
    borderColor: "border-purple-500",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  {
    id: "fampay",
    name: "FamPay",
    shortName: "FamPay",
    description: "Pay via FamPay UPI or card. Teen-friendly payments.",
    icon: (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-lg leading-none">F</span>
      </div>
    ),
    accentColor: "text-yellow-400",
    borderColor: "border-yellow-500",
    badgeColor: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  },
  {
    id: "stripe",
    name: "Card / Stripe",
    shortName: "Card",
    description: "Secure card payment via Stripe.",
    icon: (
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
        <CreditCard className="w-4 h-4 text-primary-foreground" />
      </div>
    ),
    accentColor: "text-primary",
    borderColor: "border-primary",
    badgeColor: "bg-primary/15 text-primary border-primary/25",
  },
];

function CommissionBox({
  priceInCents,
  currency,
}: {
  priceInCents: bigint;
  currency: "usd" | "inr" | "icp";
}) {
  const priceUsd = Number(priceInCents) / 100;
  const commission = priceUsd * COMMISSION_RATE;
  const buyerPays =
    currency === "inr"
      ? `\u20b9${(priceUsd * USD_TO_INR).toFixed(0)}`
      : currency === "icp"
        ? `${(priceUsd * USD_TO_ICP).toFixed(4)} ICP`
        : `$${priceUsd.toFixed(2)}`;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs space-y-1.5">
      <div className="flex justify-between text-muted-foreground">
        <span>You pay</span>
        <span>{buyerPays}</span>
      </div>
      <div className="flex justify-between text-orange-400">
        <span>Platform fee (1%)</span>
        <span>${commission.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-green-400 border-t border-border pt-1.5">
        <span>Seller receives</span>
        <span>${(priceUsd - commission).toFixed(2)}</span>
      </div>
    </div>
  );
}

function SellerAccountInfo({
  method,
  siteId,
}: {
  method: PaymentMethod;
  siteId: string;
}) {
  if (method === "stripe") return null;
  const saved = loadSellerAccounts(siteId);
  if (!saved) return null;
  const accountValue = saved.accounts[method]?.trim();
  if (!accountValue) return null;

  const labels: Record<PaymentMethod, string> = {
    icp: "Seller ICP Wallet",
    paypal: "Seller PayPal",
    phonepe: "Seller PhonePe",
    fampay: "Seller FamPay",
    stripe: "",
  };

  return (
    <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <UserCircle className="w-3.5 h-3.5" />
        {labels[method]}
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs font-mono text-foreground bg-muted/40 rounded px-2 py-1.5 break-all">
          {accountValue}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(accountValue).then(() => {
              toast.success("Copied to clipboard");
            });
          }}
          className="shrink-0 text-[10px] text-primary border border-primary/30 rounded px-2 py-1 hover:bg-primary/10 transition-colors"
        >
          Copy
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Send your payment directly to this account, then click Confirm.
      </p>
    </div>
  );
}

function SiteDetailModal({
  site,
  index,
  open,
  onClose,
}: {
  site: Site | null;
  index: number;
  open: boolean;
  onClose: () => void;
}) {
  const createCheckout = useCreateCheckoutSession();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paymentInput, setPaymentInput] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [marketplacePIN, setMarketplacePIN] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleClose = () => {
    setSelectedMethod(null);
    setPaymentInput("");
    setPaymentLoading(false);
    setMarketplacePIN("");
    setPinError(false);
    onClose();
  };

  const handleBuyNow = async () => {
    if (!site) return;
    const price = getListingPrice(site);
    try {
      const session = await createCheckout.mutateAsync([
        {
          productName: site.title,
          productDescription: getListingDescription(site),
          currency: "usd",
          priceInCents: price,
          quantity: 1n,
        },
      ]);
      if (!session?.url) throw new Error("Missing checkout URL");
      window.location.href = session.url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  const simulatePayment = async (successMsg: string) => {
    setPaymentLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPaymentLoading(false);
    toast.success(successMsg);
    handleClose();
  };

  const handleAltPayment = async () => {
    if (!paymentInput.trim()) {
      toast.error("Please fill in the payment details.");
      return;
    }
    switch (selectedMethod) {
      case "icp":
        await simulatePayment(
          "ICP payment submitted! Transaction pending on-chain.",
        );
        break;
      case "paypal":
        await simulatePayment("Redirecting to PayPal...");
        break;
      case "phonepe":
        if (hasPhonePePIN(myPrincipal)) {
          if (marketplacePIN.length < 4) {
            toast.error("Enter your 4-digit PhonePe PIN.");
            return;
          }
          if (marketplacePIN !== loadPhonePePIN(myPrincipal)) {
            setPinError(true);
            setMarketplacePIN("");
            toast.error("Incorrect PIN. Please try again.");
            setTimeout(() => setPinError(false), 2000);
            return;
          }
        }
        await simulatePayment("PhonePe payment initiated!");
        break;
      case "fampay":
        await simulatePayment("FamPay payment initiated!");
        break;
    }
  };

  if (!site) return null;
  const publishedUrl = getPublishedUrl(site);
  const price = getListingPrice(site);
  const priceUsd = Number(price) / 100;
  const icpAmount = usdToIcp(price);
  const inrAmount = usdToInr(price);

  const selectedMethodData = PAYMENT_METHODS.find(
    (m) => m.id === selectedMethod,
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto"
        data-ocid="marketplace.site_detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl text-foreground">
            {site.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Thumbnail */}
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={getThumbnail(index)}
              alt={site.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/15 text-primary border-primary/25 text-base px-3 py-1">
                ${priceUsd.toFixed(2)}
              </Badge>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-base px-3 py-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" />
                {inrAmount}
              </Badge>
              <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/25 text-xs px-2 py-1">
                {icpAmount} ICP
              </Badge>
            </div>
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary text-sm hover:underline"
              >
                <Globe className="w-4 h-4" /> View Live Site
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {getListingDescription(site)}
          </p>

          {/* Payment Method Grid */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Select Payment Method
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(method.id);
                    setPaymentInput("");
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                    selectedMethod === method.id
                      ? `${method.borderColor} bg-primary/5`
                      : "border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                  data-ocid={`marketplace.payment_${method.id}.toggle`}
                >
                  {method.icon}
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {method.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {method.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Details Form */}
          <AnimatePresence mode="wait">
            {selectedMethod && selectedMethod !== "stripe" && (
              <motion.div
                key={selectedMethod}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div
                  className={`rounded-xl border-2 p-4 space-y-3 ${
                    selectedMethodData?.borderColor ?? "border-primary"
                  } bg-muted/10`}
                >
                  {selectedMethod === "icp" && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          ICP Payment
                        </p>
                        <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/25">
                          ≈ {icpAmount} ICP
                        </Badge>
                      </div>
                      <SellerAccountInfo method="icp" siteId={site.id} />
                      <Input
                        value={paymentInput}
                        onChange={(e) => setPaymentInput(e.target.value)}
                        placeholder="Your ICP principal or wallet to send from"
                        className="bg-card border-border"
                        data-ocid="marketplace.icp_wallet.input"
                      />
                      <CommissionBox priceInCents={price} currency="icp" />
                      <p className="text-[11px] text-muted-foreground">
                        Payment gateway coming soon. This initiates a payment
                        request.
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold h-11"
                        onClick={handleAltPayment}
                        disabled={paymentLoading}
                        data-ocid="marketplace.icp_payment.button"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" /> Confirm ICP Payment
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {selectedMethod === "paypal" && (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        PayPal
                      </p>
                      <SellerAccountInfo method="paypal" siteId={site.id} />
                      <Input
                        type="email"
                        value={paymentInput}
                        onChange={(e) => setPaymentInput(e.target.value)}
                        placeholder="Your PayPal email (sender)"
                        className="bg-card border-border"
                        data-ocid="marketplace.paypal_email.input"
                      />
                      <CommissionBox priceInCents={price} currency="usd" />
                      <p className="text-[11px] text-muted-foreground">
                        Payment gateway coming soon. This initiates a payment
                        request.
                      </p>
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11"
                        onClick={handleAltPayment}
                        disabled={paymentLoading}
                        data-ocid="marketplace.paypal_payment.button"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" /> Continue to PayPal
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {selectedMethod === "phonepe" && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          PhonePe UPI
                        </p>
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/25 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />₹{inrAmount}
                        </Badge>
                      </div>
                      <SellerAccountInfo method="phonepe" siteId={site.id} />
                      <Input
                        value={paymentInput}
                        onChange={(e) => setPaymentInput(e.target.value)}
                        placeholder="Your UPI ID (sender)"
                        className="bg-card border-border"
                        data-ocid="marketplace.phonepe_upi.input"
                      />
                      {hasPhonePePIN(myPrincipal) && (
                        <div className="space-y-2 pt-1">
                          <p className="text-sm font-semibold text-foreground text-center">
                            Enter your PhonePe PIN
                          </p>
                          <PinBoxes
                            value={marketplacePIN}
                            onChange={(v) => {
                              setMarketplacePIN(v);
                              setPinError(false);
                            }}
                            autoFocus
                            hasError={pinError}
                          />
                          {pinError && (
                            <p className="text-center text-xs text-red-500 font-medium">
                              Incorrect PIN
                            </p>
                          )}
                        </div>
                      )}
                      <CommissionBox priceInCents={price} currency="inr" />
                      <p className="text-[11px] text-muted-foreground">
                        Payment gateway coming soon. This initiates a payment
                        request.
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-semibold h-11"
                        onClick={handleAltPayment}
                        disabled={
                          paymentLoading ||
                          (hasPhonePePIN(myPrincipal) &&
                            marketplacePIN.length < 4)
                        }
                        data-ocid="marketplace.phonepe_payment.button"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-2">
                              <span className="text-[#5f259f] font-black text-[9px] leading-none">
                                P
                              </span>
                            </div>
                            Pay with PhonePe
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {selectedMethod === "fampay" && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          FamPay
                        </p>
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/25 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />₹{inrAmount}
                        </Badge>
                      </div>
                      <SellerAccountInfo method="fampay" siteId={site.id} />
                      <Input
                        value={paymentInput}
                        onChange={(e) => setPaymentInput(e.target.value)}
                        placeholder="Your FamPay number or UPI (sender)"
                        className="bg-card border-border"
                        data-ocid="marketplace.fampay_number.input"
                      />
                      <CommissionBox priceInCents={price} currency="inr" />
                      <p className="text-[11px] text-muted-foreground">
                        Payment gateway coming soon. This initiates a payment
                        request.
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold h-11"
                        onClick={handleAltPayment}
                        disabled={paymentLoading}
                        data-ocid="marketplace.fampay_payment.button"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>Pay with FamPay</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Box */}
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Price includes full ownership transfer + legal bill of sale
            </p>
            <p className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Pay in USD, INR (₹), or ICP — 5 payment methods supported
            </p>
            <p className="flex items-center gap-2 text-orange-400/80">
              <span className="text-[11px] font-medium bg-orange-500/15 border border-orange-500/25 rounded px-1.5 py-0.5">
                1%
              </span>
              Platform commission deducted from seller payout per transaction
            </p>
          </div>

          {/* Stripe Buy Button */}
          <AnimatePresence>
            {(selectedMethod === "stripe" || selectedMethod === null) && (
              <motion.div
                key="stripe-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {selectedMethod === "stripe" && (
                  <CommissionBox priceInCents={price} currency="usd" />
                )}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 font-semibold h-12"
                  onClick={handleBuyNow}
                  disabled={createCheckout.isPending}
                  data-ocid="marketplace.buynow.button"
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {selectedMethod === "stripe"
                        ? `Pay with Card — $${priceUsd.toFixed(2)} / ₹${inrAmount}`
                        : `Buy Now — $${priceUsd.toFixed(2)} / ₹${inrAmount}`}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketplacePage() {
  const { data: listings, isLoading } = useGetMarketplaceListings();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [detailSite, setDetailSite] = useState<{
    site: Site;
    index: number;
  } | null>(null);

  const filteredListings = (listings || []).filter((site) => {
    const q = search.toLowerCase();
    if (
      q &&
      !site.title.toLowerCase().includes(q) &&
      !site.description.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  // Suppress unused variable lint
  void selectedCategory;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center icon-glow">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                Marketplace
              </h1>
              <p className="text-muted-foreground text-sm">
                Premium digital sites available for immediate purchase.
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sites..."
                className="pl-10 bg-card border-border w-full"
                data-ocid="marketplace.search_input"
              />
            </div>
            {/* Category filters — horizontal scroll on mobile */}
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                    data-ocid="marketplace.filter.tab"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Listings Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="marketplace.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl bg-card" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div
            className="text-center py-24"
            data-ocid="marketplace.empty_state"
          >
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-xl mb-2">
              No listings found
            </h3>
            <p className="text-muted-foreground">
              {search
                ? "Try a different search term."
                : "Be the first to list a site!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((site, i) => {
              const price = getListingPrice(site);
              const priceUsd = Number(price) / 100;
              const priceInr = priceUsd * USD_TO_INR;
              return (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="card-glow bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-colors group"
                  data-ocid={`marketplace.item.${i + 1}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getThumbnail(i)}
                      alt={site.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground leading-snug truncate mr-2">
                        {site.title}
                      </h3>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className="bg-primary/15 text-primary border-primary/25 text-sm">
                          ${priceUsd.toFixed(0)}
                        </Badge>
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs flex items-center gap-0.5">
                          <IndianRupee className="w-2.5 h-2.5" />
                          {priceInr.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                      {getListingDescription(site)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {PAYMENT_METHODS.map((m) => (
                        <span
                          key={m.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${m.badgeColor}`}
                        >
                          {m.shortName}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/25 font-medium"
                      onClick={() => setDetailSite({ site, index: i })}
                      data-ocid={`marketplace.item.${i + 1}.button`}
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <SiteDetailModal
        site={detailSite?.site ?? null}
        index={detailSite?.index ?? 0}
        open={!!detailSite}
        onClose={() => setDetailSite(null)}
      />
    </Layout>
  );
}
