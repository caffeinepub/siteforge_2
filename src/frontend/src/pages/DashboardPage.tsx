import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Filter,
  Globe,
  IndianRupee,
  KeyRound,
  Layers,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Plus,
  Receipt,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Smartphone,
  Tag,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Site, Transaction } from "../backend";
import { Layout } from "../components/Layout";
import { ListSiteModal } from "../components/ListSiteModal";
import { ProfileSetupModal } from "../components/ProfileSetupModal";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { TransactionDetailModal } from "../components/TransactionDetailModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateProfile,
  useGetCallerUserProfile,
  useGetUserDashboard,
  usePublishSite,
  useUnlistSite,
  useUnreadMessageCount,
  useUpdateBio,
  useUpdateDisplayName,
  useUpdateUsername,
} from "../hooks/useQueries";
import AdminPanelInline from "./AdminPanelInline";
import ChatTab, {
  PinBoxes,
  hasPhonePePIN,
  loadPhonePePIN,
  savePhonePePIN,
} from "./ChatTab";

function getSiteStatusBadge(site: Site) {
  switch (site.status.__kind__) {
    case "draft":
      return (
        <Badge className="bg-muted/50 text-muted-foreground border-border">
          Draft
        </Badge>
      );
    case "published":
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Published
        </Badge>
      );
    case "listed":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Listed
        </Badge>
      );
    case "sold":
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          Sold
        </Badge>
      );
  }
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const USD_TO_INR = 83.5;

type TxFilter = "all" | "purchases" | "sales" | "pending" | "completed";

function TransactionsPanel({
  transactions,
  isLoading,
  myPrincipal,
  onViewTx,
}: {
  transactions: import("../backend").Transaction[];
  isLoading: boolean;
  myPrincipal: string;
  onViewTx: (tx: import("../backend").Transaction) => void;
}) {
  const [filter, setFilter] = useState<TxFilter>("all");
  const [search, setSearch] = useState("");

  const totalSpent = transactions
    .filter((t) => t.buyer.toString() === myPrincipal)
    .reduce((sum, t) => sum + Number(t.price) / 100, 0);
  const totalEarned = transactions
    .filter((t) => t.seller.toString() === myPrincipal)
    .reduce((sum, t) => sum + Number(t.price) / 100, 0);

  const filtered = transactions.filter((tx) => {
    const role = tx.buyer.toString() === myPrincipal ? "Buyer" : "Seller";
    const matchFilter =
      filter === "all" ||
      (filter === "purchases" && role === "Buyer") ||
      (filter === "sales" && role === "Seller") ||
      (filter === "pending" && tx.status.__kind__ === "pending") ||
      (filter === "completed" && tx.status.__kind__ === "completed");
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      tx.id.toLowerCase().includes(q) ||
      tx.siteId.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Site ID", "Role", "USD", "INR", "Status", "Date"];
    const rows = transactions.map((tx) => {
      const role = tx.buyer.toString() === myPrincipal ? "Buyer" : "Seller";
      const usd = (Number(tx.price) / 100).toFixed(2);
      const inr = ((Number(tx.price) / 100) * USD_TO_INR).toFixed(2);
      const date = new Date(Number(tx.createdAt) / 1_000_000).toISOString();
      return [
        tx.id,
        tx.siteId,
        role,
        `$${usd}`,
        `₹${inr}`,
        tx.status.__kind__,
        date,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteforge-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-card" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-glow bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <ArrowDownCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold text-foreground">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ ₹
              {(totalSpent * USD_TO_INR).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="text-xl font-bold text-foreground">
              ${totalEarned.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ ₹
              {(totalEarned * USD_TO_INR).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-xl font-bold text-foreground">
              {transactions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {
                transactions.filter((t) => t.status.__kind__ === "completed")
                  .length
              }{" "}
              completed
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Filter tabs */}
        <div
          className="flex gap-1 flex-wrap"
          data-ocid="dashboard.transactions.filter.tab"
        >
          {(
            ["all", "purchases", "sales", "pending", "completed"] as TxFilter[]
          ).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
              data-ocid={`dashboard.transactions.${f}.tab`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID or site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              data-ocid="dashboard.transactions.search_input"
            />
          </div>
          {/* Export CSV */}
          {transactions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
              onClick={handleExportCSV}
              data-ocid="dashboard.transactions.export.button"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table or empty state */}
      {!transactions.length ? (
        <div
          className="text-center py-20 card-glow bg-card rounded-xl border border-border"
          data-ocid="dashboard.transactions.empty_state"
        >
          <Receipt className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No transactions yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Browse the Marketplace to buy your first website and it will appear
            here.
          </p>
          <Button variant="outline" className="mt-4 border-border" asChild>
            <a href="/marketplace">Browse Marketplace →</a>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 card-glow bg-card rounded-xl border border-border"
          data-ocid="dashboard.transactions.empty_state"
        >
          <Filter className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No transactions match this filter.
          </p>
        </div>
      ) : (
        <div className="card-glow bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="dashboard.transactions.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Site</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">USD</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">
                    INR
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx, i) => {
                  const role =
                    tx.buyer.toString() === myPrincipal ? "Buyer" : "Seller";
                  const usdAmt = Number(tx.price) / 100;
                  const inrAmt = usdAmt * USD_TO_INR;
                  const isCompleted = tx.status.__kind__ === "completed";
                  const isPending = tx.status.__kind__ === "pending";
                  return (
                    <TableRow
                      key={tx.id}
                      className="border-border cursor-pointer hover:bg-accent/30"
                      data-ocid={`dashboard.transactions.row.${i + 1}`}
                      onClick={() => onViewTx(tx)}
                    >
                      <TableCell className="text-foreground font-medium text-sm">
                        {tx.siteId.slice(0, 10)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            role === "Buyer"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                          }
                        >
                          {role === "Buyer" ? (
                            <ArrowDownCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowUpCircle className="w-3 h-3 mr-1" />
                          )}
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        ${usdAmt.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                        ₹
                        {inrAmt.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="relative flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-500 block" />
                              <span className="text-sm text-green-400 capitalize">
                                Completed
                              </span>
                            </span>
                          ) : isPending ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse block" />
                              <span className="text-sm text-yellow-400 capitalize">
                                Pending
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 block" />
                              <span className="text-sm text-red-400 capitalize">
                                Cancelled
                              </span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-primary"
                          data-ocid={`dashboard.transactions.row.${i + 1}.button`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: dashboard, isLoading: dashLoading } = useGetUserDashboard();
  const publishSite = usePublishSite();
  const unlistSite = useUnlistSite();
  const updateDisplayName = useUpdateDisplayName();
  const updateUsername = useUpdateUsername();
  const updateBio = useUpdateBio();
  const createProfile = useCreateProfile();
  const navigate = useNavigate();

  const myPrincipal = identity?.getPrincipal().toString() ?? "";
  const { data: unreadCount = 0 } = useUnreadMessageCount(myPrincipal);

  const [listModal, setListModal] = useState<{
    siteId: string;
    siteTitle: string;
  } | null>(null);
  const [txModal, setTxModal] = useState<Transaction | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    displayName: "",
    username: "",
    bio: "",
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const getPhonePeKey = (p: string) => `siteforge:phonepe_upi:${p}`;
  const [phonePeUPI, setPhonePeUPI] = useState<string>("");
  const [phonePeInput, setPhonePeInput] = useState<string>("");
  const [phonePeSaved, setPhonePeSaved] = useState(false);
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinSaved, setPinSaved] = useState(false);
  const [showChangePIN, setShowChangePIN] = useState(false);

  const isAuthenticated = !!identity;
  const autoCreateAttempted = useRef(false);
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (
      isFetched &&
      userProfile === null &&
      identity &&
      !autoCreateAttempted.current
    ) {
      autoCreateAttempted.current = true;
      const principal = identity.getPrincipal().toString();
      const safeSlug = principal.slice(0, 8).replace(/-/g, "");
      createProfile
        .mutateAsync({
          username: `user_${safeSlug}`,
          displayName: `User ${principal.slice(0, 6)}`,
          bio: "",
        })
        .catch(() => {});
    }
  }, [isFetched, userProfile, identity, createProfile]);

  useEffect(() => {
    if (myPrincipal) {
      const stored =
        localStorage.getItem(`siteforge:phonepe_upi:${myPrincipal}`) ?? "";
      setPhonePeUPI(stored);
      setPhonePeInput(stored);
    }
  }, [myPrincipal]);

  if (userProfile && !settingsLoaded) {
    setSettingsForm({
      displayName: userProfile.displayName,
      username: userProfile.username,
      bio: userProfile.bio,
    });
    setSettingsLoaded(true);
  }

  const handlePublish = async (siteId: string, siteTitle: string) => {
    try {
      const url = await publishSite.mutateAsync(siteId);
      toast.success(`"${siteTitle}" published!`, { description: url });
    } catch {
      toast.error("Failed to publish site.");
    }
  };

  const handleUnlist = async (siteId: string) => {
    try {
      await unlistSite.mutateAsync(siteId);
      toast.success("Site unlisted from marketplace.");
    } catch {
      toast.error("Failed to unlist site.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateDisplayName.mutateAsync(settingsForm.displayName),
        updateUsername.mutateAsync(settingsForm.username),
        updateBio.mutateAsync(settingsForm.bio),
      ]);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  const isSavingSettings =
    updateDisplayName.isPending ||
    updateUsername.isPending ||
    updateBio.isPending;

  return (
    <Layout>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {userProfile
                ? `Welcome, ${userProfile.displayName}`
                : "Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your sites, listings, and transactions.
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 font-semibold flex items-center gap-2 w-full sm:w-auto"
            asChild
          >
            <Link to="/builder/new" data-ocid="dashboard.new_site.button">
              <Plus className="w-4 h-4" /> New Site
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="sites" className="space-y-6">
          {/* Scrollable tab bar on mobile */}
          <div className="overflow-x-auto pb-1">
            <TabsList className="bg-card border border-border p-1 h-auto flex-nowrap min-w-max">
              <TabsTrigger
                value="sites"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="dashboard.sites.tab"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" /> My Sites
              </TabsTrigger>
              <TabsTrigger
                value="marketplace"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="dashboard.marketplace.tab"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Marketplace
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="dashboard.transactions.tab"
              >
                <Receipt className="w-4 h-4 mr-2" /> Transactions
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="dashboard.settings.tab"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="dashboard.admin.tab"
              >
                <Shield className="w-4 h-4 mr-2" /> Admin Panel
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
                data-ocid="dashboard.chat.tab"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
                {unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* My Sites Tab */}
          <TabsContent value="sites">
            {dashLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl bg-card" />
                ))}
              </div>
            ) : !dashboard?.sites?.length ? (
              <div
                className="text-center py-20 card-glow bg-card rounded-xl border border-border"
                data-ocid="dashboard.sites.empty_state"
              >
                <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No sites yet
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Start building your first site.
                </p>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/builder/new">Create Your First Site</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.sites.map((site, i) => (
                  <div
                    key={site.id}
                    className="card-glow bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
                    data-ocid={`dashboard.sites.item.${i + 1}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground truncate mr-2">
                        {site.title}
                      </h3>
                      {getSiteStatusBadge(site)}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                      {site.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Updated {formatDate(site.updatedAt)}
                    </p>

                    {site.status.__kind__ === "published" && (
                      <p className="text-xs text-primary mb-3 truncate">
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        {site.status.published}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {site.status.__kind__ === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-xs"
                          onClick={() => handlePublish(site.id, site.title)}
                          disabled={publishSite.isPending}
                          data-ocid={`dashboard.sites.item.${i + 1}.button`}
                        >
                          <Globe className="w-3.5 h-3.5 mr-1" /> Publish
                        </Button>
                      )}
                      {site.status.__kind__ === "published" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-xs"
                          onClick={() =>
                            setListModal({
                              siteId: site.id,
                              siteTitle: site.title,
                            })
                          }
                          data-ocid={`dashboard.sites.item.${i + 1}.button`}
                        >
                          <Tag className="w-3.5 h-3.5 mr-1" /> List for Sale
                        </Button>
                      )}
                      {site.status.__kind__ === "listed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
                          onClick={() => handleUnlist(site.id)}
                          disabled={unlistSite.isPending}
                          data-ocid={`dashboard.sites.item.${i + 1}.delete_button`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Unlist
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/25 text-xs"
                        onClick={() =>
                          navigate({
                            to: "/builder/$siteId",
                            params: { siteId: site.id },
                          })
                        }
                        data-ocid={`dashboard.sites.item.${i + 1}.edit_button`}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            {dashLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl bg-card" />
                ))}
              </div>
            ) : !dashboard?.listings?.length ? (
              <div
                className="text-center py-20 card-glow bg-card rounded-xl border border-border"
                data-ocid="dashboard.marketplace.empty_state"
              >
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No active listings
                </h3>
                <p className="text-muted-foreground text-sm">
                  Publish a site, then list it for sale.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.listings.map((site, i) => (
                  <div
                    key={site.id}
                    className="card-glow bg-card rounded-xl border border-border p-5"
                    data-ocid={`dashboard.marketplace.item.${i + 1}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground truncate mr-2">
                        {site.title}
                      </h3>
                      {getSiteStatusBadge(site)}
                    </div>
                    {site.status.__kind__ === "listed" && (
                      <p className="text-primary font-semibold text-lg mb-2">
                        ${(Number(site.status.listed.price) / 100).toFixed(2)}
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {site.status.__kind__ === "listed"
                        ? site.status.listed.listingDescription
                        : site.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
                      onClick={() => handleUnlist(site.id)}
                      disabled={unlistSite.isPending}
                      data-ocid={`dashboard.marketplace.item.${i + 1}.delete_button`}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Listing
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsPanel
              transactions={dashboard?.transactions ?? []}
              isLoading={dashLoading}
              myPrincipal={myPrincipal}
              onViewTx={setTxModal}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-lg">
              <div className="card-glow bg-card rounded-xl border border-border p-5 sm:p-6">
                <h2 className="font-display font-bold text-xl text-foreground mb-6">
                  Profile Settings
                </h2>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="settingsDisplayName"
                      className="text-foreground"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="settingsDisplayName"
                      value={settingsForm.displayName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      className="bg-input border-border w-full"
                      data-ocid="settings.displayname.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="settingsUsername"
                      className="text-foreground"
                    >
                      Username
                    </Label>
                    <Input
                      id="settingsUsername"
                      value={settingsForm.username}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="bg-input border-border w-full"
                      data-ocid="settings.username.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settingsBio" className="text-foreground">
                      Bio
                    </Label>
                    <Textarea
                      id="settingsBio"
                      value={settingsForm.bio}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={3}
                      className="bg-input border-border resize-none w-full"
                      data-ocid="settings.bio.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 font-semibold w-full sm:w-auto"
                    disabled={isSavingSettings}
                    data-ocid="settings.save.button"
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </div>

              {/* Principal ID Section */}
              <div className="card-glow bg-card rounded-xl border border-border p-5 sm:p-6 mt-4">
                <h2 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Your Principal ID
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  This is your unique identity on the Internet Computer
                  blockchain.
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 font-mono text-xs bg-input border border-border rounded-lg px-3 py-2.5 text-foreground/80 break-all"
                    data-ocid="settings.principal.panel"
                  >
                    {identity?.getPrincipal().toString() ?? "Not authenticated"}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-border shrink-0"
                    onClick={() => {
                      const pid = identity?.getPrincipal().toString();
                      if (pid) {
                        navigator.clipboard.writeText(pid);
                        toast.success("Principal ID copied!");
                      }
                    }}
                    data-ocid="settings.principal.button"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* PhonePe UPI Section */}
              <div className="card-glow bg-card rounded-xl border border-border p-5 sm:p-6 mt-4">
                <h2 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  PhonePe UPI
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Link your PhonePe UPI ID or mobile number to send and receive
                  payments directly in chat.
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phonePeUPI" className="text-foreground">
                      UPI ID or Mobile Number
                    </Label>
                    <Input
                      id="phonePeUPI"
                      value={phonePeInput}
                      onChange={(e) => {
                        setPhonePeInput(e.target.value);
                        setPhonePeSaved(false);
                      }}
                      placeholder="yourname@upi or 9999999999"
                      className="bg-input border-border w-full"
                      data-ocid="settings.phonepe.input"
                    />
                  </div>
                  {phonePeUPI && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      Linked: {phonePeUPI}
                    </div>
                  )}
                  <Button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold w-full sm:w-auto"
                    onClick={() => {
                      if (!phonePeInput.trim()) {
                        toast.error(
                          "Enter your UPI ID or mobile number first.",
                        );
                        return;
                      }
                      localStorage.setItem(
                        getPhonePeKey(myPrincipal),
                        phonePeInput.trim(),
                      );
                      setPhonePeUPI(phonePeInput.trim());
                      setPhonePeSaved(true);
                      toast.success("PhonePe UPI linked successfully!");
                    }}
                    data-ocid="settings.phonepe.save_button"
                  >
                    <IndianRupee className="w-4 h-4 mr-2" />
                    {phonePeSaved ? "Saved!" : "Save UPI"}
                  </Button>

                  {/* PhonePe PIN Section */}
                  <div className="border-t border-border pt-3 mt-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          PhonePe Payment PIN
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Required to authorize payments from chat and
                          marketplace
                        </p>
                      </div>
                      {hasPhonePePIN(myPrincipal) && !showChangePIN && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-sm text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span>PIN set</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                            onClick={() => {
                              setShowChangePIN(true);
                              setPinNew("");
                              setPinConfirm("");
                              setPinSaved(false);
                            }}
                            data-ocid="settings.phonepe.change_pin_button"
                          >
                            Change PIN
                          </Button>
                        </div>
                      )}
                    </div>

                    {(!hasPhonePePIN(myPrincipal) || showChangePIN) && (
                      <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
                        <p className="text-xs text-center text-muted-foreground">
                          {showChangePIN
                            ? "Set a new 4-digit PIN"
                            : "Create a 4-digit PIN to secure payments"}
                        </p>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            New PIN
                          </Label>
                          <PinBoxes value={pinNew} onChange={setPinNew} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Confirm PIN
                          </Label>
                          <PinBoxes
                            value={pinConfirm}
                            onChange={setPinConfirm}
                          />
                        </div>
                        <div className="flex gap-2">
                          {showChangePIN && (
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 border-border"
                              onClick={() => {
                                setShowChangePIN(false);
                                setPinNew("");
                                setPinConfirm("");
                              }}
                              data-ocid="settings.phonepe.cancel_pin_button"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            type="button"
                            className="flex-1 bg-gradient-to-r from-[#5f259f] to-[#8b44d4] hover:opacity-90 text-white font-semibold"
                            disabled={
                              pinNew.length < 4 ||
                              pinConfirm.length < 4 ||
                              pinSaved
                            }
                            onClick={() => {
                              if (pinNew !== pinConfirm) {
                                toast.error(
                                  "PINs do not match. Please try again.",
                                );
                                return;
                              }
                              savePhonePePIN(myPrincipal, pinNew);
                              setPinSaved(true);
                              setShowChangePIN(false);
                              toast.success("PhonePe PIN saved successfully!");
                            }}
                            data-ocid="settings.phonepe.save_pin_button"
                          >
                            {pinSaved
                              ? "PIN Saved ✓"
                              : showChangePIN
                                ? "Update PIN"
                                : "Save PIN"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Admin Panel Tab */}
          <TabsContent value="admin">
            <AdminPanelInline />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {listModal && (
        <ListSiteModal
          siteId={listModal.siteId}
          siteTitle={listModal.siteTitle}
          open={!!listModal}
          onClose={() => setListModal(null)}
        />
      )}
      <TransactionDetailModal
        transaction={txModal}
        open={!!txModal}
        onClose={() => setTxModal(null)}
      />
    </Layout>
  );
}
