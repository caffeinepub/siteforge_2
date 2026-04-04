import { Badge } from "@/components/ui/badge";
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
import {
  CheckCircle2,
  CreditCard,
  DollarSign,
  IndianRupee,
  Link2,
  Loader2,
  Phone,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useListSite } from "../hooks/useQueries";

interface ListSiteModalProps {
  siteId: string;
  siteTitle: string;
  open: boolean;
  onClose: () => void;
}

type PaymentMethodId = "icp" | "paypal" | "phonepe" | "fampay" | "stripe";
type PriceCurrency = "usd" | "inr";

const ALL_PAYMENT_METHODS: {
  id: PaymentMethodId;
  name: string;
  icon: React.ReactNode;
  color: string;
  hasAccount: boolean;
  accountLabel?: string;
  accountPlaceholder?: string;
  accountHint?: string;
}[] = [
  {
    id: "stripe",
    name: "Card / Stripe",
    icon: <CreditCard className="w-3.5 h-3.5" />,
    color: "bg-primary/15 text-primary border-primary/30",
    hasAccount: false,
  },
  {
    id: "icp",
    name: "ICP Token",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    hasAccount: true,
    accountLabel: "ICP Wallet Address",
    accountPlaceholder: "e.g. abc12-defgh-...",
    accountHint: "Your ICP principal ID or wallet address to receive tokens.",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: <span className="font-bold text-xs">P</span>,
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    hasAccount: true,
    accountLabel: "PayPal Email",
    accountPlaceholder: "yourname@email.com",
    accountHint: "Buyers will be directed to pay to this PayPal account.",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    icon: <Phone className="w-3.5 h-3.5" />,
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    hasAccount: true,
    accountLabel: "PhonePe UPI / Mobile Number",
    accountPlaceholder: "e.g. 9876543210 or yourname@ybl",
    accountHint:
      "Your registered PhonePe number or UPI ID to receive payments.",
  },
  {
    id: "fampay",
    name: "FamPay",
    icon: <span className="font-bold text-xs">F</span>,
    color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    hasAccount: true,
    accountLabel: "FamPay UPI ID",
    accountPlaceholder: "e.g. yourname@fam",
    accountHint: "Your FamPay UPI ID or registered mobile number.",
  },
];

// 1 USD ≈ 83.5 INR
const USD_TO_INR = 83.5;
// Platform PhonePe commission number
const PLATFORM_PHONEPE = "9502010856";
// Minimum price: ₹1 = ~$0.012
const MIN_PRICE_INR = 1;
const MIN_PRICE_USD = MIN_PRICE_INR / USD_TO_INR;

export function saveSellerAccounts(
  siteId: string,
  methods: PaymentMethodId[],
  accounts: Record<PaymentMethodId, string>,
) {
  const data = { methods, accounts };
  try {
    localStorage.setItem(
      `siteforge:seller_accounts:${siteId}`,
      JSON.stringify(data),
    );
  } catch {
    // ignore storage errors
  }
}

export function loadSellerAccounts(siteId: string): {
  methods: PaymentMethodId[];
  accounts: Record<PaymentMethodId, string>;
} | null {
  try {
    const raw = localStorage.getItem(`siteforge:seller_accounts:${siteId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function ListSiteModal({
  siteId,
  siteTitle,
  open,
  onClose,
}: ListSiteModalProps) {
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>("inr");
  const [priceInput, setPriceInput] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedMethods, setAcceptedMethods] = useState<PaymentMethodId[]>([
    "stripe",
  ]);
  const [accountDetails, setAccountDetails] = useState<
    Record<PaymentMethodId, string>
  >({
    icp: "",
    paypal: "",
    phonepe: "",
    fampay: "",
    stripe: "",
  });
  const listSite = useListSite();

  const toggleMethod = (id: PaymentMethodId) => {
    setAcceptedMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  // Derive USD and INR from whichever currency is active
  const inputValue = Number.parseFloat(priceInput) || 0;
  const priceUsd =
    priceCurrency === "inr" ? inputValue / USD_TO_INR : inputValue;
  const priceInr =
    priceCurrency === "inr" ? inputValue : inputValue * USD_TO_INR;
  const commission = priceUsd * 0.01;
  const sellerReceives = priceUsd - commission;

  const missingAccounts = ALL_PAYMENT_METHODS.filter(
    (m) =>
      m.hasAccount &&
      acceptedMethods.includes(m.id) &&
      !accountDetails[m.id].trim(),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceUsd || priceUsd < MIN_PRICE_USD) {
      toast.error(`Minimum listing price is ₹${MIN_PRICE_INR}`);
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a listing description");
      return;
    }
    if (acceptedMethods.length === 0) {
      toast.error("Please select at least one payment method");
      return;
    }
    if (missingAccounts.length > 0) {
      toast.error(
        `Please link your ${missingAccounts.map((m) => m.name).join(", ")} account(s) to receive payments.`,
      );
      return;
    }
    try {
      const priceInCents = BigInt(Math.round(priceUsd * 100));
      await listSite.mutateAsync({
        id: siteId,
        price: priceInCents,
        listingDescription: description.trim(),
      });
      saveSellerAccounts(siteId, acceptedMethods, accountDetails);
      toast.success(`${siteTitle} listed on marketplace!`);
      onClose();
    } catch {
      toast.error("Failed to list site. Please try again.");
    }
  };

  const selectedMethodObjects = ALL_PAYMENT_METHODS.filter((m) =>
    acceptedMethods.includes(m.id),
  ).filter((m) => m.hasAccount);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto"
        data-ocid="list_site.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-foreground">
            List Site for Sale
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div>
            <Label className="text-foreground mb-1.5 block">Site</Label>
            <p className="text-muted-foreground text-sm">{siteTitle}</p>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="price" className="text-foreground">
                Listing Price
              </Label>
              {/* Currency toggle */}
              <div className="flex rounded-md overflow-hidden border border-border text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (priceCurrency !== "inr") {
                      // convert displayed value from USD to INR
                      const usdVal = Number.parseFloat(priceInput) || 0;
                      setPriceInput(
                        usdVal > 0 ? (usdVal * USD_TO_INR).toFixed(0) : "",
                      );
                      setPriceCurrency("inr");
                    }
                  }}
                  className={`px-3 py-1 font-medium transition-colors ${
                    priceCurrency === "inr"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (priceCurrency !== "usd") {
                      // convert displayed value from INR to USD
                      const inrVal = Number.parseFloat(priceInput) || 0;
                      setPriceInput(
                        inrVal > 0 ? (inrVal / USD_TO_INR).toFixed(2) : "",
                      );
                      setPriceCurrency("usd");
                    }
                  }}
                  className={`px-3 py-1 font-medium transition-colors ${
                    priceCurrency === "usd"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Active input — editable */}
              {priceCurrency === "inr" ? (
                <div className="relative col-span-1">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={MIN_PRICE_INR}
                    step="1"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 500"
                    className="pl-9 bg-input border-border"
                    data-ocid="list_site.input_inr"
                  />
                </div>
              ) : (
                <div className="relative col-span-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={MIN_PRICE_USD.toFixed(4)}
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 9.99"
                    className="pl-9 bg-input border-border"
                    data-ocid="list_site.input_usd"
                  />
                </div>
              )}

              {/* Converted value — read-only */}
              {priceCurrency === "inr" ? (
                <div className="relative col-span-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    readOnly
                    value={priceUsd > 0 ? `$${priceUsd.toFixed(2)}` : ""}
                    placeholder="USD (auto)"
                    className="pl-9 bg-muted/30 border-border text-muted-foreground cursor-not-allowed"
                  />
                </div>
              ) : (
                <div className="relative col-span-1">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    readOnly
                    value={priceInr > 0 ? priceInr.toFixed(0) : ""}
                    placeholder="INR (auto)"
                    className="pl-9 bg-muted/30 border-border text-muted-foreground cursor-not-allowed"
                  />
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {priceCurrency === "inr"
                ? "Enter price in ₹ Rupees — USD shown auto-calculated (1 USD ≈ ₹83.5). Minimum ₹1."
                : "Enter price in $ USD — INR shown auto-calculated (1 USD ≈ ₹83.5). Minimum ₹1."}
            </p>
          </div>

          {/* Commission preview */}
          {priceUsd > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Listing price</span>
                <span>
                  ₹{priceInr.toFixed(0)} / ${priceUsd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-orange-400">
                <span>Platform commission (1%)</span>
                <span>
                  − ₹{(priceInr * 0.01).toFixed(0)} / ${commission.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-green-400 border-t border-border pt-1.5">
                <span>You receive</span>
                <span>
                  ₹{(priceInr * 0.99).toFixed(0)} / ${sellerReceives.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-0.5">
                Commission is collected via PhonePe ({PLATFORM_PHONEPE})
              </p>
            </div>
          )}

          {/* Accepted payment methods */}
          <div className="space-y-2">
            <Label className="text-foreground">Accept Payment Via</Label>
            <p className="text-[11px] text-muted-foreground">
              Choose which payment methods buyers can use.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleMethod(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    acceptedMethods.includes(m.id)
                      ? m.color
                      : "bg-muted/20 text-muted-foreground border-border opacity-50 hover:opacity-70"
                  }`}
                  data-ocid={`list_site.method_${m.id}.toggle`}
                >
                  {m.icon}
                  {m.name}
                  {acceptedMethods.includes(m.id) &&
                    m.hasAccount &&
                    accountDetails[m.id].trim() && (
                      <CheckCircle2 className="w-3 h-3 ml-0.5 opacity-80" />
                    )}
                </button>
              ))}
            </div>
            {acceptedMethods.length === 0 && (
              <p className="text-[11px] text-destructive">
                Select at least one method
              </p>
            )}
          </div>

          {/* Account linking */}
          {selectedMethodObjects.length > 0 && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Link Your Accounts
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2">
                Buyers will send payment directly to your linked accounts. The
                platform collects 1% commission via PhonePe ({PLATFORM_PHONEPE}
                ).
              </p>
              {selectedMethodObjects.map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <Label
                    htmlFor={`account_${m.id}`}
                    className="text-foreground text-xs flex items-center gap-1.5"
                  >
                    {m.icon}
                    {m.accountLabel}
                    {accountDetails[m.id].trim() && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    )}
                  </Label>
                  <Input
                    id={`account_${m.id}`}
                    type={m.id === "paypal" ? "email" : "text"}
                    value={accountDetails[m.id]}
                    onChange={(e) =>
                      setAccountDetails((prev) => ({
                        ...prev,
                        [m.id]: e.target.value,
                      }))
                    }
                    placeholder={m.accountPlaceholder}
                    className="bg-input border-border text-sm h-9"
                    data-ocid={`list_site.account_${m.id}.input`}
                  />
                  {m.accountHint && (
                    <p className="text-[10px] text-muted-foreground">
                      {m.accountHint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

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
