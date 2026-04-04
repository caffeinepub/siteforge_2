import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Layers,
  LayoutDashboard,
  Menu,
  Shield,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/siteforge-logo-transparent.dim_80x80.png"
              alt="SiteForge"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              SiteForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/builder/new"
              className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm font-medium"
              data-ocid="nav.builder.link"
            >
              Builder
            </Link>
            <Link
              to="/marketplace"
              className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm font-medium"
              data-ocid="nav.marketplace.link"
            >
              Marketplace
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm font-medium"
                data-ocid="nav.dashboard.link"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground"
                >
                  <Link to="/dashboard" data-ocid="nav.dashboard.button">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-border text-muted-foreground hover:text-foreground"
                  data-ocid="nav.logout.button"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground"
                >
                  <Link to="/login" data-ocid="nav.signin.link">
                    Sign In
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Link to="/register" data-ocid="nav.getstarted.button">
                    Get Started Free
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/builder/new"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Layers className="w-4 h-4" /> Builder
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.admin.link"
                >
                  <Shield className="w-4 h-4 text-primary" /> Admin Panel
                </Link>
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/generated/siteforge-logo-transparent.dim_80x80.png"
                alt="SiteForge"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display font-bold text-lg text-foreground">
                SiteForge
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Build, publish, and trade premium digital assets on the
              world&apos;s most advanced site marketplace.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Site Builder", to: "/builder/new" },
                { label: "Marketplace", to: "/marketplace" },
                { label: "Dashboard", to: "/dashboard" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Bill of Sale",
                "DMCA",
              ].map((item) => (
                <li key={item}>
                  <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">
              Company
            </h4>
            <ul className="space-y-2">
              {["About Us", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {year} SiteForge. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Built with ❤️ using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
