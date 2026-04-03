import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserDirectoryEntry } from "../backend";
import { Variant_pending_accepted_declined } from "../backend";
import { UserProfileModal } from "../components/UserProfileModal";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  markConversationAsRead,
  useGetAllUsers,
  useGetMessages,
  useGetUserDashboard,
  useProposeTradeMessage,
  useRespondToTradeProposal,
  useSendMessage,
  useUnreadMessageCount,
} from "../hooks/useQueries";
import {
  isSoundEnabled,
  playMessageSound,
  playPaymentSound,
  setSoundEnabled,
} from "../lib/notificationSounds";
import {
  followUser,
  isFollowing,
  isVerified,
  unfollowUser,
} from "../lib/socialStore";

const PLATFORM_PHONEPE = "9502010856";
const COMMISSION_RATE = 0.01;

// Storage key for user's linked PhonePe UPI
function getPhonePeStorageKey(principal: string) {
  return `siteforge:phonepe_upi:${principal}`;
}

function loadMyPhonePeUPI(principal: string): string {
  return localStorage.getItem(getPhonePeStorageKey(principal)) ?? "";
}

function saveMyPhonePeUPI(principal: string, upi: string) {
  localStorage.setItem(getPhonePeStorageKey(principal), upi);
}

// PIN helpers
const PHONEPE_PIN_KEY = (principal: string) =>
  `siteforge:phonepe_pin:${principal}`;
export const loadPhonePePIN = (principal: string) =>
  localStorage.getItem(PHONEPE_PIN_KEY(principal)) ?? "";
export const savePhonePePIN = (principal: string, pin: string) =>
  localStorage.setItem(PHONEPE_PIN_KEY(principal), pin);
export const hasPhonePePIN = (principal: string) =>
  !!localStorage.getItem(PHONEPE_PIN_KEY(principal));

/** Returns the number if the message text is purely a number (integer or decimal), else null */
function extractPaymentAmount(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const val = Number.parseFloat(trimmed);
  if (!Number.isFinite(val) || val <= 0) return null;
  return val;
}

function truncatePrincipal(p: string) {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}...${p.slice(-4)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── PinBoxes ─────────────────────────────────────────────────────────────────

interface PinBoxesProps {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function PinBoxes({
  value,
  onChange,
  autoFocus,
  hasError,
}: PinBoxesProps) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus first box on mount if autoFocus
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs are stable, intentional on-mount only
  useEffect(() => {
    if (autoFocus) {
      refs[0]?.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value.length > 0) {
        const newVal = value.slice(0, -1);
        onChange(newVal);
        const focusIdx = Math.max(
          0,
          newVal.length === 0
            ? 0
            : newVal.length - 1 < idx
              ? newVal.length
              : idx - 1,
        );
        setTimeout(
          () => refs[Math.max(0, idx > 0 ? idx - 1 : 0)]?.current?.focus(),
          0,
        );
        void focusIdx;
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    let newVal = value;
    if (idx < value.length) {
      // Replace digit at position
      newVal = value.slice(0, idx) + digit + value.slice(idx + 1);
    } else if (value.length === idx) {
      newVal = value + digit;
    }
    if (newVal.length > 4) return;
    onChange(newVal);
    if (idx < 3) {
      setTimeout(() => refs[idx + 1]?.current?.focus(), 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] ? "●" : ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={handleFocus}
          className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold bg-white transition-all outline-none
            ${hasError ? "border-red-400 ring-2 ring-red-200" : value[idx] ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"}
          `}
          placeholder=""
          aria-label={`PIN digit ${idx + 1}`}
          data-ocid={`phonepe.pin.input.${idx + 1}` as any}
        />
      ))}
    </div>
  );
}

// ─── PhonePe Pay Dialog ───────────────────────────────────────────────────────

interface PhonePayDialogProps {
  open: boolean;
  onClose: () => void;
  amountINR: number;
  recipientName: string;
  recipientPhonePe: string;
  myPrincipal: string;
}

function PhonePayDialog({
  open,
  onClose,
  amountINR,
  recipientName,
  recipientPhonePe,
  myPrincipal,
}: PhonePayDialogProps) {
  const [myUPI, setMyUPI] = useState(() => loadMyPhonePeUPI(myPrincipal));
  type Step = "link" | "set_pin" | "confirm" | "done";
  const [step, setStep] = useState<Step>("link");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [enteredPIN, setEnteredPIN] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shake, setShake] = useState(false);

  const commission = amountINR * COMMISSION_RATE;
  const recipientReceives = amountINR - commission;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      const upi = loadMyPhonePeUPI(myPrincipal);
      setMyUPI(upi);
      setNewPIN("");
      setConfirmPIN("");
      setEnteredPIN("");
      setPinError(false);
      setShake(false);
      if (!upi) {
        setStep("link");
      } else if (!hasPhonePePIN(myPrincipal)) {
        setStep("set_pin");
      } else {
        setStep("confirm");
      }
    }
  }, [open, myPrincipal]);

  const handleLink = () => {
    if (!myUPI.trim()) {
      toast.error("Enter your PhonePe UPI ID or mobile number first.");
      return;
    }
    if (newPIN.length !== 4) {
      toast.error("Please enter a 4-digit PIN.");
      return;
    }
    if (newPIN !== confirmPIN) {
      toast.error("PINs do not match. Please try again.");
      return;
    }
    saveMyPhonePeUPI(myPrincipal, myUPI.trim());
    savePhonePePIN(myPrincipal, newPIN);
    toast.success("PhonePe linked and PIN set!");
    setStep("confirm");
  };

  const handleSetPin = () => {
    if (newPIN.length !== 4) {
      toast.error("Please enter a 4-digit PIN.");
      return;
    }
    if (newPIN !== confirmPIN) {
      toast.error("PINs do not match. Please try again.");
      return;
    }
    savePhonePePIN(myPrincipal, newPIN);
    toast.success("PIN set successfully!");
    setStep("confirm");
  };

  const handlePay = () => {
    const storedPin = loadPhonePePIN(myPrincipal);
    if (enteredPIN !== storedPin) {
      setPinError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setPinError(false), 2000);
      setEnteredPIN("");
      return;
    }

    // Build UPI deep link — opens PhonePe (or any UPI app) with details pre-filled
    // recipientPhonePe is the recipient's UPI ID / mobile@upi registered with PhonePe
    const recipientUPI = recipientPhonePe
      ? recipientPhonePe.includes("@")
        ? recipientPhonePe
        : `${recipientPhonePe}@ybl` // PhonePe VPA format
      : "";

    if (recipientUPI) {
      const note = encodeURIComponent(`SiteForge payment to ${recipientName}`);
      const name = encodeURIComponent(recipientName);
      const upiLink = `upi://pay?pa=${encodeURIComponent(recipientUPI)}&pn=${name}&am=${recipientReceives.toFixed(2)}&cu=INR&tn=${note}`;
      // Open UPI deep link — on mobile this launches PhonePe/GPay/BHIM; on desktop shows QR
      window.location.href = upiLink;
      setTimeout(() => setStep("done"), 300);
    } else {
      // No UPI linked for recipient — show done with instruction
      setStep("done");
    }
    toast.success(
      `Payment of ₹${recipientReceives.toFixed(2)} to ${recipientName} initiated via PhonePe!`,
    );
  };

  // Purple gradient header — always visible
  const PurpleHeader = () => (
    <div className="bg-gradient-to-br from-[#5f259f] to-[#8b44d4] px-6 pt-6 pb-8 -mx-6 -mt-4 rounded-t-xl text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
      {/* Logo row */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
          <span className="text-[#5f259f] font-black text-lg leading-none">
            P
          </span>
        </div>
        <span className="text-white font-bold text-lg tracking-wide">
          PhonePe
        </span>
      </div>
      {/* Amount */}
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {getInitials(recipientName)}
          </div>
        </div>
        <p className="text-white/80 text-sm mb-1">Paying {recipientName}</p>
        <p className="text-white text-4xl font-black tracking-tight">
          ₹{amountINR.toLocaleString("en-IN")}
        </p>
        <p className="text-white/60 text-xs mt-1">
          ₹{commission.toFixed(2)} platform fee · ₹
          {recipientReceives.toFixed(2)} received
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-white dark:bg-card border-0 max-w-sm p-6 pt-4 overflow-hidden"
        data-ocid="chat.phonepe_pay.dialog"
      >
        <PurpleHeader />

        <AnimatePresence mode="wait">
          {/* ── Step: link (no UPI yet) ── */}
          {step === "link" && (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-5 space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Your PhonePe UPI / Mobile
                </Label>
                <Input
                  value={myUPI}
                  onChange={(e) => setMyUPI(e.target.value)}
                  placeholder="yourname@upi or 9999999999"
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-200 bg-gray-50"
                  data-ocid="chat.phonepe_link.upi_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Set a 4-digit PhonePe PIN
                </Label>
                <PinBoxes value={newPIN} onChange={setNewPIN} autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Confirm PIN
                </Label>
                <PinBoxes value={confirmPIN} onChange={setConfirmPIN} />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-bold h-12 text-base"
                onClick={handleLink}
                disabled={
                  !myUPI.trim() || newPIN.length < 4 || confirmPIN.length < 4
                }
                data-ocid="chat.phonepe_link.button"
              >
                Link & Set PIN
              </Button>
            </motion.div>
          )}

          {/* ── Step: set_pin (has UPI but no PIN) ── */}
          {step === "set_pin" && (
            <motion.div
              key="set_pin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-5 space-y-4"
            >
              <p className="text-center text-sm text-gray-500">
                Create a PIN to secure your payments
              </p>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  New 4-digit PIN
                </Label>
                <PinBoxes value={newPIN} onChange={setNewPIN} autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Confirm PIN
                </Label>
                <PinBoxes value={confirmPIN} onChange={setConfirmPIN} />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-bold h-12 text-base"
                onClick={handleSetPin}
                disabled={newPIN.length < 4 || confirmPIN.length < 4}
                data-ocid="chat.phonepe_setpin.button"
              >
                Set PIN
              </Button>
            </motion.div>
          )}

          {/* ── Step: confirm (enter PIN to pay) ── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-5 space-y-5"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Enter your 4-digit PIN to pay
                </p>
                {recipientPhonePe && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    To: {recipientPhonePe}
                  </p>
                )}
              </div>

              <motion.div
                animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <PinBoxes
                  value={enteredPIN}
                  onChange={setEnteredPIN}
                  autoFocus
                  hasError={pinError}
                />
              </motion.div>

              {pinError && (
                <p className="text-center text-sm text-red-500 font-medium">
                  Incorrect PIN. Please try again.
                </p>
              )}

              {/* Subtle commission breakdown */}
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-500 flex justify-between">
                <span>Platform fee (1%)</span>
                <span>
                  ₹{commission.toFixed(2)} → PhonePe {PLATFORM_PHONEPE}
                </span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-bold h-12 text-base"
                onClick={handlePay}
                disabled={enteredPIN.length < 4}
                data-ocid="chat.phonepe_pay.button"
              >
                Pay ₹{amountINR.toLocaleString("en-IN")}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
                data-ocid="chat.phonepe_pay.cancel_button"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* ── Step: done ── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </motion.div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Opening PhonePe...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Paying ₹{recipientReceives.toFixed(2)} to{" "}
                  <span className="font-semibold text-gray-700">
                    {recipientName}
                  </span>
                  {recipientPhonePe ? (
                    <span className="block font-mono text-xs mt-0.5 text-gray-400">
                      {recipientPhonePe.includes("@")
                        ? recipientPhonePe
                        : `${recipientPhonePe}@ybl`}
                    </span>
                  ) : null}
                </p>
              </div>
              {recipientPhonePe ? (
                <Button
                  className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-bold h-11"
                  onClick={() => {
                    const recipientUPI = recipientPhonePe.includes("@")
                      ? recipientPhonePe
                      : `${recipientPhonePe}@ybl`;
                    const note = encodeURIComponent(
                      `SiteForge payment to ${recipientName}`,
                    );
                    const name = encodeURIComponent(recipientName);
                    window.location.href = `upi://pay?pa=${encodeURIComponent(recipientUPI)}&pn=${name}&am=${recipientReceives.toFixed(2)}&cu=INR&tn=${note}`;
                  }}
                  data-ocid="chat.phonepe_open.button"
                >
                  Open PhonePe to Pay
                </Button>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Ask {recipientName} to link their PhonePe UPI in their
                  Settings so you can pay them directly.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full h-10 text-sm"
                onClick={onClose}
                data-ocid="chat.phonepe_done.button"
              >
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── UserRow ─────────────────────────────────────────────────────────────────

interface UserRowProps {
  entry: UserDirectoryEntry;
  isSelected: boolean;
  isSelf: boolean;
  myPrincipal: string;
  onClick: () => void;
  onNameClick: (entry: UserDirectoryEntry) => void;
}

function UserRow({
  entry,
  isSelected,
  isSelf,
  myPrincipal,
  onClick,
  onNameClick,
}: UserRowProps) {
  const displayName = entry.profile?.displayName || "Unknown";
  const username = entry.profile?.username || "";
  const principalStr = entry.principal.toString();
  const [followTick, setFollowTick] = useState(0);
  void followTick;

  const verified = isVerified(principalStr);
  const following = isFollowing(myPrincipal, principalStr);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (following) {
      unfollowUser(myPrincipal, principalStr);
    } else {
      followUser(myPrincipal, principalStr);
    }
    setFollowTick((v) => v + 1);
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNameClick(entry);
  };

  return (
    <button
      type="button"
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-accent/30 border-b border-border/40 ${
        isSelected ? "bg-primary/15 border-l-2 border-l-primary" : ""
      }`}
      onClick={onClick}
      data-ocid="chat.user.button"
    >
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback
          className={`text-sm font-bold ${
            isSelf
              ? "bg-primary/20 text-primary"
              : "bg-secondary/40 text-secondary-foreground"
          }`}
        >
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="font-medium text-foreground text-sm truncate hover:text-primary hover:underline transition-colors max-w-[120px]"
            onClick={handleNameClick}
          >
            {displayName}
          </button>
          {verified && <VerifiedBadge size="sm" />}
          {isSelf && (
            <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">
              You
            </Badge>
          )}
        </div>
        {username && (
          <p className="text-xs text-muted-foreground truncate">@{username}</p>
        )}
        <p className="text-[11px] text-muted-foreground/60 font-mono truncate">
          {truncatePrincipal(principalStr)}
        </p>
      </div>
      {!isSelf && (
        <button
          type="button"
          onClick={handleFollowClick}
          className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full border transition-colors font-medium ${
            following
              ? "bg-primary/20 text-primary border-primary/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/40"
              : "bg-transparent text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
          }`}
          data-ocid="chat.follow.button"
        >
          {following ? "Following" : "Follow"}
        </button>
      )}
    </button>
  );
}

// ─── ProposeTradeModal ────────────────────────────────────────────────────────

interface ProposeTradeModalProps {
  open: boolean;
  onClose: () => void;
  partnerName: string;
  partnerPrincipal: string;
}

function ProposeTradeModal({
  open,
  onClose,
  partnerName,
  partnerPrincipal,
}: ProposeTradeModalProps) {
  const { data: dashboard, isLoading } = useGetUserDashboard();
  const proposeTrade = useProposeTradeMessage();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const eligibleSites = dashboard?.sites.filter(
    (s) => s.status.__kind__ === "published" || s.status.__kind__ === "listed",
  );

  const handlePropose = async () => {
    if (!selectedSiteId) return;
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await proposeTrade.mutateAsync({
        to: Principal.fromText(partnerPrincipal),
        siteId: selectedSiteId,
      });
      toast.success("Trade proposal sent!");
      onClose();
      setSelectedSiteId(null);
    } catch {
      toast.error("Failed to send trade proposal.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="chat.trade.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Propose Trade with {partnerName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select one of your published sites to offer in trade.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg bg-background" />
              ))}
            </div>
          ) : !eligibleSites?.length ? (
            <div
              className="text-center py-8 text-muted-foreground text-sm"
              data-ocid="chat.trade.empty_state"
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No published sites available to trade.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {eligibleSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSiteId === site.id
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-background/50 border-border hover:border-primary/30 text-foreground"
                  }`}
                  onClick={() => setSelectedSiteId(site.id)}
                >
                  <p className="font-medium text-sm">{site.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {site.description || "No description"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border"
            data-ocid="chat.trade.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePropose}
            disabled={!selectedSiteId || proposeTrade.isPending}
            className="bg-primary hover:bg-primary/90"
            data-ocid="chat.trade.confirm_button"
          >
            {proposeTrade.isPending ? "Sending..." : "Propose Trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── SoundToggle ─────────────────────────────────────────────────────────────

function SoundToggle() {
  const [enabled, setEnabled] = useState(() => isSoundEnabled());

  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={
        enabled ? "Mute notification sounds" : "Enable notification sounds"
      }
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      data-ocid="chat.sound_toggle.button"
    >
      {enabled ? (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Sound on"
        >
          <title>Sound on</title>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Sound off"
        >
          <title>Sound off</title>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────

interface ChatWindowProps {
  partner: UserDirectoryEntry;
  myPrincipal: string;
  onBack: () => void;
}

function ChatWindow({ partner, myPrincipal, onBack }: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [payDialogAmount, setPayDialogAmount] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const partnerPrincipal = partner.principal.toString();
  const partnerName = partner.profile?.displayName || "Unknown";

  const { data: messages, isLoading } = useGetMessages(partnerPrincipal);
  const sendMessage = useSendMessage();
  const respondToTrade = useRespondToTradeProposal();
  const qc = useQueryClient();
  const prevMsgCountRef = useRef<number>(0);

  // Play notification sound when new messages arrive from partner
  useEffect(() => {
    if (!messages) return;
    const prev = prevMsgCountRef.current;
    const current = messages.length;
    if (current > prev && prev > 0) {
      const newMsgs = messages.slice(prev);
      const hasNewFromPartner = newMsgs.some(
        (m) => m.sender.toString() !== myPrincipal,
      );
      if (hasNewFromPartner) {
        const hasPayment = newMsgs.some(
          (m) =>
            m.sender.toString() !== myPrincipal &&
            extractPaymentAmount(m.content) !== null,
        );
        if (hasPayment) {
          playPaymentSound();
        } else {
          playMessageSound();
        }
      }
    }
    prevMsgCountRef.current = current;
  }, [messages, myPrincipal]);

  const partnerVerified = isVerified(partnerPrincipal);

  // Load recipient's linked PhonePe UPI
  const recipientPhonePe = loadMyPhonePeUPI(partnerPrincipal);

  // Mark conversation as read whenever this chat window is open
  useEffect(() => {
    if (myPrincipal && partnerPrincipal) {
      markConversationAsRead(myPrincipal, partnerPrincipal);
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    }
  }, [myPrincipal, partnerPrincipal, qc]);

  // Also re-mark as read whenever new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0 && myPrincipal && partnerPrincipal) {
      markConversationAsRead(myPrincipal, partnerPrincipal);
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    }
  }, [messages, myPrincipal, partnerPrincipal, qc]);

  // Auto-scroll when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text) return;
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await sendMessage.mutateAsync({
        to: Principal.fromText(partnerPrincipal),
        content: text,
      });
      setMessageText("");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTradeResponse = async (messageId: string, accept: boolean) => {
    try {
      await respondToTrade.mutateAsync({ messageId, accept });
      toast.success(accept ? "Trade accepted!" : "Trade declined.");
    } catch {
      toast.error("Failed to respond to trade.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 shrink-0">
        <button
          type="button"
          className="md:hidden text-muted-foreground hover:text-foreground mr-1"
          onClick={onBack}
          data-ocid="chat.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-secondary/40 text-secondary-foreground text-sm font-bold">
            {getInitials(partnerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground text-sm">
              {partnerName}
            </p>
            {partnerVerified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {truncatePrincipal(partnerPrincipal)}
          </p>
        </div>
        <SoundToggle />
        <Button
          size="sm"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 text-xs gap-1.5"
          onClick={() => setTradeModalOpen(true)}
          data-ocid="chat.propose_trade.button"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Propose Trade
        </Button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isLoading ? (
          <div className="space-y-3" data-ocid="chat.messages.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl bg-card ${
                    i % 2 === 0 ? "w-48" : "w-56"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : !messages?.length ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="chat.messages.empty_state"
          >
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-1 opacity-60">Say hello to get started!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.toString() === myPrincipal;
            const isTradeMsg = !!msg.tradeProposalSiteId;

            if (isTradeMsg) {
              const isPending =
                msg.tradeProposalStatus ===
                Variant_pending_accepted_declined.pending;
              const isAccepted =
                msg.tradeProposalStatus ===
                Variant_pending_accepted_declined.accepted;
              const canRespond = !isMine && isPending;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[320px] bg-card border border-primary/30 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px]">
                        Trade Offer
                      </Badge>
                      {!isPending && (
                        <Badge
                          className={`text-[11px] ${
                            isAccepted
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {isAccepted ? "Accepted" : "Declined"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {msg.tradeProposalSiteTitle || "Site"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {isMine
                        ? "You proposed this trade"
                        : `${partnerName} proposed this trade`}
                    </p>
                    {canRespond && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 text-xs flex-1"
                          onClick={() => handleTradeResponse(msg.id, true)}
                          disabled={respondToTrade.isPending}
                          data-ocid="chat.trade.accept_button"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs flex-1"
                          onClick={() => handleTradeResponse(msg.id, false)}
                          disabled={respondToTrade.isPending}
                          data-ocid="chat.trade.decline_button"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-2 text-right">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            }

            // Check if message content is a payment amount
            const payAmount = extractPaymentAmount(msg.content);
            const showPayButton = payAmount !== null && !isMine;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {/* Amount display */}
                  {payAmount !== null ? (
                    <div className="flex items-center gap-1.5">
                      <IndianRupee
                        className={`w-4 h-4 ${
                          isMine
                            ? "text-primary-foreground/80"
                            : "text-foreground"
                        }`}
                      />
                      <span className="text-base font-bold">{payAmount}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}

                  {/* PhonePe Pay button — shown only to the receiver when msg is a number */}
                  {showPayButton && (
                    <button
                      type="button"
                      onClick={() => setPayDialogAmount(payAmount)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 transition-opacity text-white text-xs font-bold shadow-md"
                      data-ocid="chat.phonepe_pay.inline_button"
                    >
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[#5f259f] font-black text-[9px] leading-none">
                          P
                        </span>
                      </div>
                      Pay ₹{payAmount} via PhonePe
                    </button>
                  )}

                  <p
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? "text-primary-foreground/60 text-right"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border bg-card/80 shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${partnerName}... (type a number like 99 to request payment)`}
            rows={1}
            className="bg-input border-border resize-none min-h-[40px] max-h-[120px] text-sm"
            style={{ height: "auto", overflowY: "auto" }}
            data-ocid="chat.message.input"
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            className="bg-primary hover:bg-primary/90 shrink-0 h-10 w-10 p-0"
            data-ocid="chat.send.button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5">
          Press Enter to send · Shift+Enter for new line · Send a number to
          request PhonePe payment
        </p>
      </div>

      <ProposeTradeModal
        open={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        partnerName={partnerName}
        partnerPrincipal={partnerPrincipal}
      />

      {/* PhonePe Pay Dialog */}
      {payDialogAmount !== null && (
        <PhonePayDialog
          open={payDialogAmount !== null}
          onClose={() => setPayDialogAmount(null)}
          amountINR={payDialogAmount}
          recipientName={partnerName}
          recipientPhonePe={recipientPhonePe}
          myPrincipal={myPrincipal}
        />
      )}
    </div>
  );
}

// ─── ChatTab (main export) ────────────────────────────────────────────────────

export default function ChatTab() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDirectoryEntry | null>(
    null,
  );
  const [profileModalUser, setProfileModalUser] =
    useState<UserDirectoryEntry | null>(null);
  const qc = useQueryClient();

  const { data: allUsers, isLoading: usersLoading, refetch } = useGetAllUsers();
  const { data: unreadTotal } = useUnreadMessageCount(myPrincipal);
  const prevUnreadRef = useRef<number>(0);

  // Play sound when new unread messages arrive (while not in a conversation)
  useEffect(() => {
    if (unreadTotal === undefined) return;
    const prev = prevUnreadRef.current;
    if (unreadTotal > prev && !selectedUser) {
      playMessageSound();
    }
    prevUnreadRef.current = unreadTotal;
  }, [unreadTotal, selectedUser]);

  const allPrincipalStrings = (allUsers ?? []).map((e) =>
    e.principal.toString(),
  );

  const filteredUsers = (allUsers ?? []).filter((entry) => {
    if (entry.principal.toString() === myPrincipal) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch =
      entry.profile?.displayName?.toLowerCase().includes(q) ||
      entry.profile?.username?.toLowerCase().includes(q);
    const principalMatch = entry.principal.toString().toLowerCase().includes(q);
    return nameMatch || principalMatch;
  });

  const myEntry = (allUsers ?? []).find(
    (e) => e.principal.toString() === myPrincipal,
  );

  // Mark conversation as read when a user is selected
  useEffect(() => {
    if (selectedUser && myPrincipal) {
      markConversationAsRead(myPrincipal, selectedUser.principal.toString());
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    }
  }, [selectedUser, myPrincipal, qc]);

  const showRightPanel = !!selectedUser;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-card rounded-xl border border-border overflow-hidden">
      {/* Left Panel — User List */}
      <div
        className={`w-full md:w-72 shrink-0 flex flex-col border-r border-border ${
          showRightPanel ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-card/90 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Users
              {allUsers && (
                <Badge className="bg-muted/50 text-muted-foreground border-border text-[10px] px-1.5">
                  {filteredUsers.length}
                </Badge>
              )}
            </h3>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => refetch()}
              data-ocid="chat.users.button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-input border-border text-xs h-8"
              data-ocid="chat.search.input"
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Self entry at top */}
        {myEntry && (
          <div className="border-b border-border/60">
            <UserRow
              entry={myEntry}
              isSelected={false}
              isSelf={true}
              myPrincipal={myPrincipal}
              onClick={() => {}}
              onNameClick={(entry) => setProfileModalUser(entry)}
            />
          </div>
        )}

        {/* User list */}
        <ScrollArea className="flex-1">
          {usersLoading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border/40"
                >
                  <Skeleton className="w-10 h-10 rounded-full bg-card" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24 rounded bg-card" />
                    <Skeleton className="h-3 w-16 rounded bg-card" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="chat.users.empty_state"
            >
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {searchQuery ? "No users found." : "No other users yet."}
            </div>
          ) : (
            filteredUsers.map((entry) => (
              <UserRow
                key={entry.principal.toString()}
                entry={entry}
                isSelected={
                  selectedUser?.principal.toString() ===
                  entry.principal.toString()
                }
                isSelf={false}
                myPrincipal={myPrincipal}
                onClick={() => setSelectedUser(entry)}
                onNameClick={(e) => setProfileModalUser(e)}
              />
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right Panel — Chat Window */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          showRightPanel ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedUser ? (
          <ChatWindow
            partner={selectedUser}
            myPrincipal={myPrincipal}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3"
            data-ocid="chat.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary/50" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/60">
                Select a user to start chatting
              </p>
              <p className="text-xs mt-1 opacity-50">
                Choose someone from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {profileModalUser && (
        <UserProfileModal
          open={!!profileModalUser}
          onClose={() => setProfileModalUser(null)}
          principal={profileModalUser.principal.toString()}
          profile={
            profileModalUser.profile
              ? {
                  displayName: profileModalUser.profile.displayName,
                  username: profileModalUser.profile.username,
                  bio: profileModalUser.profile.bio,
                  joinedAt: profileModalUser.profile.joinedAt,
                }
              : null
          }
          myPrincipal={myPrincipal}
          allPrincipals={allPrincipalStrings}
        />
      )}
    </div>
  );
}
