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
  CheckCircle,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Plus,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  Tag,
  Trash2,
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
import ChatTab from "./ChatTab";

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

function getTxStatusIcon(tx: Transaction) {
  if (tx.status.__kind__ === "completed")
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (tx.status.__kind__ === "pending")
    return <Clock className="w-4 h-4 text-yellow-400" />;
  return <XCircle className="w-4 h-4 text-red-400" />;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const isAuthenticated = !!identity;
  const autoCreateAttempted = useRef(false);
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Auto-create profile silently on first login
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
        .catch(() => {
          // Silently ignore — profile may already exist or creation failed
        });
    }
  }, [isFetched, userProfile, identity, createProfile]);

  // Populate settings form from profile
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">
              {userProfile
                ? `Welcome, ${userProfile.displayName}`
                : "Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your sites, listings, and transactions.
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 font-semibold hidden sm:flex items-center gap-2"
            asChild
          >
            <Link to="/builder/new" data-ocid="dashboard.new_site.button">
              <Plus className="w-4 h-4" /> New Site
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
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
            {dashLoading ? (
              <Skeleton className="h-64 rounded-xl bg-card" />
            ) : !dashboard?.transactions?.length ? (
              <div
                className="text-center py-20 card-glow bg-card rounded-xl border border-border"
                data-ocid="dashboard.transactions.empty_state"
              >
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No transactions yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your purchase and sales history will appear here.
                </p>
              </div>
            ) : (
              <div className="card-glow bg-card rounded-xl border border-border overflow-hidden">
                <Table data-ocid="dashboard.transactions.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Site
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Price
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.transactions.map((tx, i) => {
                      const role =
                        tx.buyer.toString() === myPrincipal
                          ? "Buyer"
                          : "Seller";
                      return (
                        <TableRow
                          key={tx.id}
                          className="border-border cursor-pointer hover:bg-accent/30"
                          data-ocid={`dashboard.transactions.row.${i + 1}`}
                          onClick={() => setTxModal(tx)}
                        >
                          <TableCell className="text-foreground font-medium text-sm">
                            {tx.siteId.slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                role === "Buyer"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-green-500/20 text-green-400 border-green-500/30"
                              }
                            >
                              {role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">
                            ${(Number(tx.price) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getTxStatusIcon(tx)}
                              <span className="text-sm capitalize">
                                {tx.status.__kind__}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
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
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-lg">
              <div className="card-glow bg-card rounded-xl border border-border p-6">
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
                      className="bg-input border-border"
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
                      className="bg-input border-border"
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
                      className="bg-input border-border resize-none"
                      data-ocid="settings.bio.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 font-semibold"
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
              <div className="card-glow bg-card rounded-xl border border-border p-6 mt-4">
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
