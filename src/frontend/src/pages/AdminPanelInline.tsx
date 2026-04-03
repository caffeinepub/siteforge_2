import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BadgeCheck,
  Clock,
  Copy,
  CreditCard,
  Info,
  KeyRound,
  Loader2,
  Shield,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { VerifiedBadge } from "../components/VerifiedBadge";
import {
  useAssignCallerUserRole,
  useGetAllUsers,
  useGetLoginEvents,
  useInitializeAdmin,
  useIsCallerAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";
import { isVerified, setVerified } from "../lib/socialStore";

const ADMIN_PIN = "mahidhar123";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminPanelInline() {
  const [pinInput, setPinInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="card-glow bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-foreground">
                  Admin Access
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your admin PIN to continue
                </p>
              </div>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="pin-inline"
                  className="text-foreground text-sm font-medium"
                >
                  Admin PIN
                </Label>
                <Input
                  id="pin-inline"
                  type="password"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`bg-background border-border text-foreground text-center tracking-widest text-lg ${
                    pinError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  autoFocus
                  data-ocid="admin_inline.pin.input"
                />
                {pinError && (
                  <p className="text-destructive text-xs text-center">
                    Incorrect PIN. Please try again.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                data-ocid="admin_inline.pin.submit_button"
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground tracking-tight">
            Admin Panel
          </h2>
          <p className="text-muted-foreground text-sm">
            Platform configuration and user management
          </p>
        </div>
      </div>

      <Tabs defaultValue="logins" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-0.5">
          <TabsTrigger
            value="logins"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Activity className="w-4 h-4" />
            User Logins
          </TabsTrigger>
          <TabsTrigger
            value="stripe"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <CreditCard className="w-4 h-4" />
            Stripe Settings
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <UserCog className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            data-ocid="admin.verified.tab"
          >
            <BadgeCheck className="w-4 h-4" />
            Verified Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logins" className="space-y-6">
          <UserLoginsTab />
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <StripeSettingsTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          <VerifiedUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserLoginsTab() {
  const { data: events, isLoading } = useGetLoginEvents();

  const sorted = events
    ? [...events].sort((a, b) => Number(b.loginAt - a.loginAt))
    : [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Principal ID copied to clipboard");
    });
  };

  return (
    <Card className="bg-card border-border card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              User Login Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              All login events recorded on the platform, newest first.
            </CardDescription>
          </div>
          {!isLoading && events && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {events.length} {events.length === 1 ? "event" : "events"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No login events recorded yet.</p>
            <p className="text-xs mt-1 opacity-70">
              Login events will appear here once users sign in.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 text-muted-foreground font-semibold">
                    #
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Principal ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Login Time
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((event, idx) => {
                  const loginDate = new Date(Number(event.loginAt) / 1_000_000);
                  const principalStr = event.principal.toString();
                  return (
                    <TableRow
                      key={`${principalStr}-${event.loginAt}`}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground max-w-[240px] truncate block">
                            {principalStr}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                            onClick={() => handleCopy(principalStr)}
                            title="Copy Principal ID"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {loginDate.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StripeSettingsTab() {
  const { data: isConfigured, isLoading: configLoading } =
    useIsStripeConfigured();
  const setStripe = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,GB,CA");

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Stripe secret key is required");
      return;
    }
    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    try {
      await setStripe.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success("Stripe configuration saved successfully");
      setSecretKey("");
    } catch (err) {
      toast.error(
        `Failed to save configuration: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <Card className="bg-card border-border card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Stripe Configuration
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Configure payment processing for marketplace transactions.
            </CardDescription>
          </div>
          <div>
            {configLoading ? (
              <Badge className="bg-muted/50 text-muted-foreground border-border">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Checking...
              </Badge>
            ) : isConfigured ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <ShieldCheck className="w-3 h-3 mr-1" /> Configured
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Not Configured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="stripe-key-inline"
            className="text-foreground text-sm font-medium"
          >
            Stripe Secret Key
          </Label>
          <Input
            id="stripe-key-inline"
            type="password"
            placeholder="sk_live_..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Your Stripe secret key from the Stripe Dashboard. Never share this
            key.
          </p>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="countries-inline"
            className="text-foreground text-sm font-medium"
          >
            Allowed Countries
          </Label>
          <Input
            id="countries-inline"
            type="text"
            placeholder="US,GB,CA"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated ISO 3166-1 alpha-2 country codes (e.g. US, GB, CA,
            AU).
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={setStripe.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {setStripe.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function UserManagementTab() {
  const { data: isCallerAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const initializeAdmin = useInitializeAdmin();
  const assignRole = useAssignCallerUserRole();
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [adminSecret, setAdminSecret] = useState("");

  const handleClaimAdmin = async () => {
    if (!adminSecret.trim()) {
      toast.error("Admin secret is required");
      return;
    }
    try {
      await initializeAdmin.mutateAsync(adminSecret.trim());
      toast.success("Admin role claimed successfully");
      setAdminSecret("");
    } catch (err) {
      toast.error(
        `Failed to claim admin role: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleAssign = async () => {
    if (!principalId.trim()) {
      toast.error("Principal ID is required");
      return;
    }
    try {
      await assignRole.mutateAsync({ user: principalId.trim(), role });
      toast.success(`Role "${role}" assigned to ${principalId.trim()}`);
      setPrincipalId("");
    } catch (err) {
      toast.error(
        `Failed to assign role: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  if (isAdminLoading) {
    return (
      <div className="space-y-6" data-ocid="admin.users.loading_state">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!isCallerAdmin) {
    return (
      <div className="space-y-6" data-ocid="admin.users.panel">
        <Alert className="border-amber-500/20 bg-amber-500/5">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-muted-foreground">
            You are not yet a backend admin. Enter the platform admin secret
            below to claim admin privileges and unlock role management.
          </AlertDescription>
        </Alert>

        <Card className="bg-card border-border card-glow">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Initialize Admin Access
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the CAFFEINE_ADMIN_TOKEN secret to claim admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="admin-secret-inline"
                className="text-foreground text-sm font-medium"
              >
                Admin Secret Token
              </Label>
              <Input
                id="admin-secret-inline"
                type="password"
                placeholder="Enter admin secret token..."
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleClaimAdmin}
              disabled={initializeAdmin.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {initializeAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim Admin Role"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Contact your platform administrator for the admin secret token.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground">
          Enter a user&apos;s Principal ID to assign them a platform role.
        </AlertDescription>
      </Alert>

      <Card className="bg-card border-border card-glow">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Assign User Role
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Grant or revoke platform roles for any registered user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="principal-inline"
              className="text-foreground text-sm font-medium"
            >
              User Principal ID
            </Label>
            <Input
              id="principal-inline"
              type="text"
              placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="role-select-inline"
              className="text-foreground text-sm font-medium"
            >
              Role
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger
                id="role-select-inline"
                className="bg-background border-border text-foreground"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value={UserRole.admin} className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    Admin
                  </span>
                </SelectItem>
                <SelectItem value={UserRole.user} className="text-foreground">
                  <span className="flex items-center gap-2">
                    <UserCog className="w-3.5 h-3.5 text-blue-400" />
                    User
                  </span>
                </SelectItem>
                <SelectItem value={UserRole.guest} className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    Guest
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={assignRole.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {assignRole.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Role"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifiedUsersTab() {
  const { data: allUsers, isLoading } = useGetAllUsers();
  const [verifyTick, setVerifyTick] = useState(0);
  void verifyTick;

  const handleToggleVerified = (principal: string) => {
    const current = isVerified(principal);
    setVerified(principal, !current);
    setVerifyTick((v) => v + 1);
    toast.success(!current ? "Blue tick granted ✔" : "Blue tick removed");
  };

  return (
    <Card className="bg-card border-border card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#1877F2]" />
              Verified Users
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Grant or revoke blue tick verification badges for users.
            </CardDescription>
          </div>
          {!isLoading && allUsers && (
            <Badge className="bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20">
              {allUsers.length} {allUsers.length === 1 ? "user" : "users"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !allUsers?.length ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="admin.verified.empty_state"
          >
            <BadgeCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No users registered yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-muted-foreground font-semibold">
                    User
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">
                    Principal ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-right">
                    Blue Tick
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((entry, idx) => {
                  const principalStr = entry.principal.toString();
                  const displayName =
                    entry.profile?.displayName || "Unknown User";
                  const username = entry.profile?.username || "";
                  const verified = isVerified(principalStr);
                  return (
                    <TableRow
                      key={principalStr}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.verified.item.${idx + 1}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-sm truncate max-w-[140px]">
                                {displayName}
                              </span>
                              {verified && <VerifiedBadge size="sm" />}
                            </div>
                            {username && (
                              <p className="text-xs text-muted-foreground">
                                @{username}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-xs text-muted-foreground max-w-[200px] truncate block">
                          {principalStr}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {verified && (
                            <span className="text-xs text-[#1877F2] font-medium hidden sm:inline">
                              Verified
                            </span>
                          )}
                          <Switch
                            checked={verified}
                            onCheckedChange={() =>
                              handleToggleVerified(principalStr)
                            }
                            className="data-[state=checked]:bg-[#1877F2]"
                            data-ocid="admin.verified.switch"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
