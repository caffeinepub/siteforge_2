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
  Loader2,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Site } from "../backend";
import { Layout } from "../components/Layout";
import {
  useCreateCheckoutSession,
  useGetMarketplaceListings,
} from "../hooks/useQueries";

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

  if (!site) return null;
  const publishedUrl = getPublishedUrl(site);
  const price = getListingPrice(site);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-xl bg-card border-border"
        data-ocid="marketplace.site_detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl text-foreground">
            {site.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={getThumbnail(index)}
              alt={site.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/15 text-primary border-primary/25 text-base px-3 py-1">
              ${(Number(price) / 100).toFixed(2)}
            </Badge>
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
          <p className="text-muted-foreground leading-relaxed">
            {getListingDescription(site)}
          </p>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Price includes full ownership transfer + legal bill of sale
            </p>
            <p className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Secure escrow payment via Stripe
            </p>
          </div>

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
                Buy Now &mdash; ${(Number(price) / 100).toFixed(2)}
              </>
            )}
          </Button>
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
              <h1 className="font-display font-bold text-3xl text-foreground">
                Marketplace
              </h1>
              <p className="text-muted-foreground text-sm">
                Premium digital sites available for immediate purchase.
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sites..."
                className="pl-10 bg-card border-border"
                data-ocid="marketplace.search_input"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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
            {filteredListings.map((site, i) => (
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
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground leading-snug truncate mr-2">
                      {site.title}
                    </h3>
                    <Badge className="bg-primary/15 text-primary border-primary/25 shrink-0 text-sm">
                      ${(Number(getListingPrice(site)) / 100).toFixed(0)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                    {getListingDescription(site)}
                  </p>
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
            ))}
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
