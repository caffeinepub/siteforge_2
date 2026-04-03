import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
import {
  useAssignCallerUserRole,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

const ADMIN_PIN = "mahidhar123";

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

      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="bg-card border border-border">
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
        </TabsList>

        <TabsContent value="stripe" className="space-y-6">
          <StripeSettingsTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
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
  const assignRole = useAssignCallerUserRole();
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);

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

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground">
          Enter a user&apos;s Principal ID to assign them a role. The first
          admin must be assigned via the CLI using{" "}
          <code className="text-primary font-mono text-xs bg-primary/10 px-1 py-0.5 rounded">
            dfx canister call backend assignCallerUserRole
          </code>
          .
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
