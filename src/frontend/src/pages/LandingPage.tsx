import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Globe,
  Layers,
  LayoutDashboard,
  Lock,
  Menu,
  RefreshCw,
  Shield,
  ShoppingBag,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { useGetMarketplaceListings } from "../hooks/useQueries";

const ADMIN_PIN = "mahidhar123";

const SAMPLE_LISTINGS = [
  {
    id: "sample-1",
    title: "TechNova SaaS Dashboard",
    description:
      "Complete analytics platform with dark theme, data visualization, and subscription management.",
    price: 129900n,
    category: "SaaS",
    thumbnail: "/assets/generated/site-thumb-saas.dim_600x400.jpg",
  },
  {
    id: "sample-2",
    title: "Luxe E-Commerce Store",
    description:
      "Premium product listings, cart flows, checkout integration. Mobile-first responsive design.",
    price: 89900n,
    category: "E-Commerce",
    thumbnail: "/assets/generated/site-thumb-ecommerce.dim_600x400.jpg",
  },
  {
    id: "sample-3",
    title: "Folio Creative Portfolio",
    description:
      "Stunning minimalist portfolio for designers and developers with project showcase grid.",
    price: 49900n,
    category: "Portfolio",
    thumbnail: "/assets/generated/site-thumb-portfolio.dim_600x400.jpg",
  },
  {
    id: "sample-4",
    title: "LaunchPad Startup Site",
    description:
      "Full startup landing page with hero, features, pricing, testimonials and waitlist form.",
    price: 74900n,
    category: "Startup",
    thumbnail: "/assets/generated/site-thumb-startup.dim_600x400.jpg",
  },
  {
    id: "sample-5",
    title: "The Writer's Blog Platform",
    description:
      "Editorial-grade blog with article grid, categories, dark reading mode and newsletter opt-in.",
    price: 34900n,
    category: "Blog",
    thumbnail: "/assets/generated/site-thumb-blog.dim_600x400.jpg",
  },
  {
    id: "sample-6",
    title: "Bistro Restaurant Website",
    description:
      "Upscale restaurant site with menu, reservations, gallery, and online ordering integration.",
    price: 59900n,
    category: "Restaurant",
    thumbnail: "/assets/generated/site-thumb-restaurant.dim_600x400.jpg",
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Visual Builder",
    description:
      "Build stunning sites with our intuitive drag-and-drop editor. No coding required.",
  },
  {
    icon: Globe,
    title: "Instant Publish",
    description:
      "Deploy to a live URL with one click. Get a professional subdomain instantly.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description:
      "Buy and sell premium digital sites in our secure, escrow-protected marketplace.",
  },
];

const TRANSFER_STEPS = [
  {
    icon: CreditCard,
    label: "Secure Payment",
    desc: "Escrow-protected Stripe payment",
  },
  {
    icon: RefreshCw,
    label: "Automated Transfer",
    desc: "Ownership transferred instantly",
  },
  {
    icon: BadgeCheck,
    label: "Validation",
    desc: "Legal bill of sale generated",
  },
  {
    icon: Lock,
    label: "Ownership Confirmed",
    desc: "Full control transferred to buyer",
  },
];

export default function LandingPage() {
  const { data: marketplaceListings } = useGetMarketplaceListings();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleOpenPinModal = () => {
    setMenuOpen(false);
    setPin("");
    setPinError("");
    setPinModalOpen(true);
  };

  const handleClosePinModal = (open: boolean) => {
    if (!open) {
      setPin("");
      setPinError("");
    }
    setPinModalOpen(open);
  };

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      setPinModalOpen(false);
      setPin("");
      setPinError("");
      navigate({ to: "/admin" });
    } else {
      setPinError("Incorrect PIN");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePinSubmit();
    }
  };

  const displayListings =
    marketplaceListings && marketplaceListings.length > 0
      ? marketplaceListings.slice(0, 6).map((site) => ({
          id: site.id,
          title: site.title,
          description: site.description,
          price:
            site.status.__kind__ === "listed" ? site.status.listed.price : 0n,
          category: "Listed",
          thumbnail: "/assets/generated/site-thumb-saas.dim_600x400.jpg",
        }))
      : SAMPLE_LISTINGS;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 px-4 py-1.5 text-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              The Future of Digital Asset Trading
            </Badge>

            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05] tracking-tight mb-6">
              Build, Publish & <span className="text-primary">Trade</span>
              <br />
              Premium Sites
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
              The all-in-one platform to create stunning websites, deploy them
              instantly, and trade digital assets with legally binding ownership
              transfer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link
                  to="/marketplace"
                  data-ocid="hero.explore_marketplace.button"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Explore Marketplace
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-accent font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link to="/builder/new" data-ocid="hero.start_building.button">
                  Start Building
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="mt-16 flex justify-center gap-8 text-sm text-muted-foreground">
              {[
                { label: "Sites Published", value: "12,400+" },
                { label: "Marketplace Sales", value: "$3.2M+" },
                { label: "Active Builders", value: "8,900+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Three Pillars of Power
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to build, ship, and monetize digital assets at
              scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="card-glow bg-card rounded-xl p-8 border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mb-5 icon-glow group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ownership Transfer Steps */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Seamless Ownership Transfer
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our automated 4-step process ensures every sale is legally
              protected and instantly executed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {TRANSFER_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mx-auto icon-glow">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute top-1 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {step.label}
                </h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Marketplace Listings */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
                Featured Listings
              </h2>
              <p className="text-muted-foreground">
                Premium sites ready for immediate ownership transfer.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-border hidden sm:flex items-center gap-2"
              asChild
            >
              <Link to="/marketplace" data-ocid="featured.view_all.button">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-glow bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-colors group"
                data-ocid={`featured.item.${i + 1}`}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={listing.thumbnail}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground leading-snug">
                      {listing.title}
                    </h3>
                    <Badge className="bg-primary/15 text-primary border-primary/25 ml-2 shrink-0 text-xs">
                      ${(Number(listing.price) / 100).toFixed(0)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                    {listing.description}
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/25 font-medium"
                    asChild
                  >
                    <Link
                      to="/marketplace"
                      data-ocid={`featured.item.${i + 1}.button`}
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-card border border-border rounded-2xl p-12 overflow-hidden"
          >
            <div className="absolute inset-0 hero-glow opacity-50 pointer-events-none" />
            <div className="relative">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6 icon-glow" />
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
                Start Building Today
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of creators building and monetizing premium
                digital sites on SiteForge.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 font-semibold px-10"
                asChild
              >
                <Link to="/register" data-ocid="cta.getstarted.button">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Slide-out Nav Menu ── */}
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        data-ocid="admin.open_modal_button"
        aria-label="Open menu"
        className="fixed top-4 right-4 z-[100] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur-sm text-muted-foreground shadow-md hover:bg-accent hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-out panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-72 z-[120] bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-display font-bold text-foreground text-lg">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav buttons */}
            <div className="flex-1 px-4 py-6 flex flex-col gap-2">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.dashboard.button"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Dashboard
              </Link>

              <Link
                to="/marketplace"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.marketplace.button"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                Marketplace
              </Link>

              <Link
                to="/builder/new"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.build.button"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Wrench className="w-4 h-4 text-primary" />
                Build
              </Link>

              {/* Divider */}
              <div className="my-2 border-t border-border" />

              {/* Admin Panel button below the three */}
              <button
                type="button"
                onClick={handleOpenPinModal}
                data-ocid="nav.admin.button"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN entry dialog */}
      <Dialog open={pinModalOpen} onOpenChange={handleClosePinModal}>
        <DialogContent className="sm:max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Access
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="admin-pin">Enter PIN</Label>
              <Input
                id="admin-pin"
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (pinError) setPinError("");
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                data-ocid="admin.input"
              />
              {pinError && (
                <p
                  className="text-sm text-destructive font-medium"
                  data-ocid="admin.error_state"
                  role="alert"
                >
                  {pinError}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 font-semibold"
              onClick={handlePinSubmit}
              data-ocid="admin.confirm_button"
            >
              Access Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
