import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlignJustify,
  ArrowLeft,
  BarChart2,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  DollarSign,
  ExternalLink,
  Globe,
  Image,
  Layout,
  Loader2,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Plus,
  Redo2,
  Save,
  Search,
  Send,
  Settings,
  Smartphone,
  Star,
  Tablet,
  Trash2,
  TrendingUp,
  Undo2,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  useCreateSite,
  useGetSiteById,
  usePublishSite,
  useUpdateSite,
} from "../hooks/useQueries";
import { useUserRegistration } from "../lib/userRegistration";

// ============================================================
// TYPES
// ============================================================

type HeroBlock = {
  type: "hero";
  heading: string;
  subheading: string;
  ctaText: string;
  ctaColor: string;
};
type FeaturesBlock = {
  type: "features";
  heading: string;
  items: { icon: string; title: string; description: string }[];
};
type PricingBlock = {
  type: "pricing";
  heading: string;
  tiers: { name: string; price: string; features: string[] }[];
};
type TestimonialsBlock = {
  type: "testimonials";
  heading: string;
  items: { author: string; quote: string; role: string }[];
};
type FooterBlock = {
  type: "footer";
  companyName: string;
  links: { label: string; url: string }[];
};
type NavbarBlock = {
  type: "navbar";
  logo: string;
  links: { label: string; url: string }[];
};
type GalleryBlock = {
  type: "gallery";
  heading: string;
  items: { color: string; caption: string; src?: string }[];
};
type ContactBlock = {
  type: "contact";
  heading: string;
  subheading: string;
  email: string;
  phone: string;
};
type CtaBlock = {
  type: "cta";
  heading: string;
  subheading: string;
  ctaText: string;
  ctaColor: string;
  bgColor: string;
};
type FaqBlock = {
  type: "faq";
  heading: string;
  items: { question: string; answer: string }[];
};
type TeamBlock = {
  type: "team";
  heading: string;
  members: {
    name: string;
    role: string;
    initials: string;
    avatarSrc?: string;
  }[];
};
type StatsBlock = {
  type: "stats";
  heading: string;
  items: { value: string; label: string }[];
};

type TextLabelBlock = {
  type: "text-label";
  content: string;
  tag: "h1" | "h2" | "h3" | "p";
  align: "left" | "center" | "right";
  fontSize: number;
  color: string;
};
type TextButtonBlock = {
  type: "text-button";
  label: string;
  url: string;
  size: "sm" | "md" | "lg";
  variant: "solid" | "outline" | "ghost";
  align: "left" | "center" | "right";
  bgColor: string;
  textColor: string;
};
type ImageBlock = {
  type: "image-block";
  src: string;
  caption: string;
  alt: string;
  width: "full" | "large" | "medium" | "small";
  align: "left" | "center" | "right";
  borderRadius: number;
};
type ImageButtonBlock = {
  type: "image-button";
  src: string;
  url: string;
  overlayText: string;
  borderRadius: number;
  width: "full" | "large" | "medium";
};
type VideoEmbedBlock = {
  type: "video-embed";
  videoUrl: string;
  caption: string;
  autoplay: boolean;
};
type SpacerBlock = {
  type: "spacer";
  height: number;
  showLine: boolean;
  lineColor: string;
  lineStyle: "solid" | "dashed" | "dotted";
};
type QuoteBlock = {
  type: "quote";
  quoteText: string;
  author: string;
  authorRole: string;
  avatarSrc: string;
  bgColor: string;
};
type SocialLinksBlock = {
  type: "social-links";
  links: {
    platform:
      | "twitter"
      | "instagram"
      | "linkedin"
      | "youtube"
      | "facebook"
      | "tiktok"
      | "github";
    url: string;
  }[];
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg";
};
type BannerBlock = {
  type: "banner";
  message: string;
  icon: string;
  bgColor: string;
  textColor: string;
  dismissible: boolean;
};
type MapEmbedBlock = {
  type: "map-embed";
  address: string;
  embedUrl: string;
  height: number;
};
type CodeSnippetBlock = {
  type: "code-snippet";
  code: string;
  language: string;
  showLineNumbers: boolean;
};
type CountdownBlock = {
  type: "countdown";
  targetDate: string;
  label: string;
  bgColor: string;
  textColor: string;
};
type RichTextBlock = {
  type: "rich-text";
  html: string;
};
type IconTextBlock = {
  type: "icon-text";
  icon: string;
  heading: string;
  description: string;
  align: "left" | "center";
};
type AccordionItemBlock = {
  type: "accordion-item";
  question: string;
  answer: string;
  defaultOpen: boolean;
};
type Block =
  | HeroBlock
  | FeaturesBlock
  | PricingBlock
  | TestimonialsBlock
  | FooterBlock
  | NavbarBlock
  | GalleryBlock
  | ContactBlock
  | CtaBlock
  | FaqBlock
  | TeamBlock
  | StatsBlock
  | TextLabelBlock
  | TextButtonBlock
  | ImageBlock
  | ImageButtonBlock
  | VideoEmbedBlock
  | SpacerBlock
  | QuoteBlock
  | SocialLinksBlock
  | BannerBlock
  | MapEmbedBlock
  | CodeSnippetBlock
  | CountdownBlock
  | RichTextBlock
  | IconTextBlock
  | AccordionItemBlock;

type ThemePreset = "dark" | "light" | "ocean" | "forest" | "sunset";
type DeviceMode = "desktop" | "tablet" | "mobile";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const SECTION_TYPES: {
  type: Block["type"];
  icon: React.ElementType;
  label: string;
  category: string;
}[] = [
  { type: "navbar", icon: AlignJustify, label: "Navbar", category: "Layout" },
  { type: "hero", icon: Layout, label: "Hero", category: "Layout" },
  { type: "footer", icon: AlignJustify, label: "Footer", category: "Layout" },
  {
    type: "spacer",
    icon: AlignJustify,
    label: "Spacer / Divider",
    category: "Layout",
  },
  { type: "text-label", icon: Layout, label: "Text Label", category: "Text" },
  { type: "text-button", icon: Zap, label: "Text Button", category: "Text" },
  {
    type: "rich-text",
    icon: AlignJustify,
    label: "Rich Text",
    category: "Text",
  },
  {
    type: "code-snippet",
    icon: TrendingUp,
    label: "Code Snippet",
    category: "Text",
  },
  { type: "banner", icon: Star, label: "Banner / Alert", category: "Text" },
  { type: "image-block", icon: Image, label: "Image", category: "Media" },
  {
    type: "image-button",
    icon: Image,
    label: "Image Button",
    category: "Media",
  },
  { type: "video-embed", icon: Globe, label: "Video Embed", category: "Media" },
  { type: "gallery", icon: Image, label: "Gallery", category: "Media" },
  { type: "map-embed", icon: Globe, label: "Map Embed", category: "Media" },
  {
    type: "accordion-item",
    icon: ChevronDown,
    label: "Accordion",
    category: "Interactive",
  },
  {
    type: "countdown",
    icon: TrendingUp,
    label: "Countdown",
    category: "Interactive",
  },
  {
    type: "quote",
    icon: MessageSquare,
    label: "Pull Quote",
    category: "Interactive",
  },
  { type: "features", icon: Star, label: "Features", category: "Content" },
  { type: "cta", icon: Zap, label: "CTA Banner", category: "Content" },
  { type: "faq", icon: MessageSquare, label: "FAQ", category: "Content" },
  { type: "icon-text", icon: Star, label: "Icon + Text", category: "Content" },
  { type: "team", icon: Users, label: "Team", category: "People & Social" },
  {
    type: "testimonials",
    icon: MessageSquare,
    label: "Testimonials",
    category: "People & Social",
  },
  {
    type: "social-links",
    icon: Globe,
    label: "Social Links",
    category: "People & Social",
  },
  { type: "pricing", icon: DollarSign, label: "Pricing", category: "Commerce" },
  { type: "stats", icon: TrendingUp, label: "Stats", category: "Commerce" },
  { type: "contact", icon: Mail, label: "Contact", category: "Commerce" },
];

const THEME_PRESETS: Record<
  ThemePreset,
  {
    label: string;
    colors: {
      bg: string;
      text: string;
      accent: string;
      border: string;
      card: string;
      swatch: string;
    };
  }
> = {
  dark: {
    label: "Dark",
    colors: {
      bg: "#0f172a",
      text: "#f1f5f9",
      accent: "#6366f1",
      border: "#1e293b",
      card: "#1e293b",
      swatch: "#0f172a",
    },
  },
  light: {
    label: "Light",
    colors: {
      bg: "#f8fafc",
      text: "#1e293b",
      accent: "#6366f1",
      border: "#e2e8f0",
      card: "#ffffff",
      swatch: "#f8fafc",
    },
  },
  ocean: {
    label: "Ocean",
    colors: {
      bg: "#0c1445",
      text: "#e0f0ff",
      accent: "#38bdf8",
      border: "#1e3a6e",
      card: "#0f2060",
      swatch: "#0c1445",
    },
  },
  forest: {
    label: "Forest",
    colors: {
      bg: "#0d1f1a",
      text: "#d1fae5",
      accent: "#34d399",
      border: "#1a3d2f",
      card: "#122d24",
      swatch: "#0d1f1a",
    },
  },
  sunset: {
    label: "Sunset",
    colors: {
      bg: "#1a0a00",
      text: "#fff7ed",
      accent: "#fb923c",
      border: "#3d1a00",
      card: "#2d1000",
      swatch: "#1a0a00",
    },
  },
};

const TEMPLATES: {
  name: string;
  description: string;
  icon: React.ElementType;
  blocks: Block["type"][];
}[] = [
  {
    name: "SaaS Landing",
    description: "Perfect for software products and startups.",
    icon: Zap,
    blocks: ["navbar", "hero", "features", "pricing", "testimonials", "footer"],
  },
  {
    name: "Portfolio",
    description: "Showcase your creative work and projects.",
    icon: Image,
    blocks: ["navbar", "hero", "gallery", "testimonials", "footer"],
  },
  {
    name: "Agency",
    description: "Full-service agency with team and contact.",
    icon: Users,
    blocks: [
      "navbar",
      "hero",
      "stats",
      "features",
      "team",
      "contact",
      "footer",
    ],
  },
];

// ============================================================
// EXTENDED TEMPLATE LIBRARY WITH SEARCH METADATA
// ============================================================

const SEARCH_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  tags: string[];
  thumbnail: string | null;
  blocks: Block["type"][];
}[] = [
  {
    id: "saas",
    name: "SaaS Landing",
    description: "Software product or startup landing page",
    tags: ["saas", "startup", "software", "app"],
    thumbnail: "/assets/generated/site-thumb-saas.dim_600x400.jpg",
    blocks: ["navbar", "hero", "features", "pricing", "testimonials", "footer"],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase creative work and personal projects",
    tags: ["portfolio", "designer", "artist", "photography", "creative"],
    thumbnail: "/assets/generated/site-thumb-portfolio.dim_600x400.jpg",
    blocks: ["navbar", "hero", "gallery", "testimonials", "footer"],
  },
  {
    id: "agency",
    name: "Agency",
    description: "Full-service agency or consulting firm",
    tags: ["agency", "company", "business", "consulting"],
    thumbnail: null,
    blocks: [
      "navbar",
      "hero",
      "stats",
      "features",
      "team",
      "contact",
      "footer",
    ],
  },
  {
    id: "blog",
    name: "Blog / Personal",
    description: "Personal blog or thought leadership site",
    tags: ["blog", "personal", "writing", "journal"],
    thumbnail: "/assets/generated/site-thumb-blog.dim_600x400.jpg",
    blocks: ["navbar", "hero", "features", "footer"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    description: "Online shop or product showcase",
    tags: ["ecommerce", "shop", "store", "products", "retail"],
    thumbnail: "/assets/generated/site-thumb-ecommerce.dim_600x400.jpg",
    blocks: ["navbar", "hero", "gallery", "pricing", "footer"],
  },
  {
    id: "restaurant",
    name: "Restaurant / Cafe",
    description: "Food business menu and reservation page",
    tags: ["restaurant", "cafe", "food", "menu", "dining"],
    thumbnail: "/assets/generated/site-thumb-restaurant.dim_600x400.jpg",
    blocks: ["navbar", "hero", "gallery", "features", "contact", "footer"],
  },
  {
    id: "startup",
    name: "Startup",
    description: "Modern startup or product launch page",
    tags: ["startup", "launch", "product", "growth"],
    thumbnail: "/assets/generated/site-thumb-startup.dim_600x400.jpg",
    blocks: ["navbar", "hero", "stats", "features", "pricing", "footer"],
  },
  {
    id: "personal-brand",
    name: "Personal Brand",
    description: "Speaker, coach, or influencer page",
    tags: ["personal", "brand", "speaker", "coach", "influencer"],
    thumbnail: null,
    blocks: ["navbar", "hero", "testimonials", "contact", "footer"],
  },
  {
    id: "nonprofit",
    name: "Nonprofit / NGO",
    description: "Charity, cause, or community organization",
    tags: ["nonprofit", "charity", "ngo", "community", "cause"],
    thumbnail: null,
    blocks: [
      "navbar",
      "hero",
      "stats",
      "features",
      "team",
      "contact",
      "footer",
    ],
  },
  {
    id: "event",
    name: "Event / Conference",
    description: "Event landing page with schedule and tickets",
    tags: ["event", "conference", "meetup", "ticket", "schedule"],
    thumbnail: null,
    blocks: ["navbar", "hero", "features", "pricing", "team", "footer"],
  },
];

// ============================================================
// BLOCK FACTORY
// ============================================================

function createBlock(type: Block["type"]): Block {
  switch (type) {
    case "hero":
      return {
        type: "hero",
        heading: "Build Something Amazing",
        subheading:
          "Launch your idea with a beautiful, high-converting landing page in minutes.",
        ctaText: "Get Started Free",
        ctaColor: "#6366f1",
      };
    case "features":
      return {
        type: "features",
        heading: "Why Choose Us",
        items: [
          {
            icon: "⚡",
            title: "Lightning Fast",
            description: "Optimized for maximum performance.",
          },
          {
            icon: "🔒",
            title: "Secure by Default",
            description: "Enterprise-grade security built-in.",
          },
          {
            icon: "🎨",
            title: "Beautiful Design",
            description: "Professional UI out of the box.",
          },
        ],
      };
    case "pricing":
      return {
        type: "pricing",
        heading: "Simple Pricing",
        tiers: [
          {
            name: "Starter",
            price: "$9/mo",
            features: ["5 Projects", "Basic Analytics", "Email Support"],
          },
          {
            name: "Pro",
            price: "$29/mo",
            features: [
              "Unlimited Projects",
              "Advanced Analytics",
              "Priority Support",
            ],
          },
        ],
      };
    case "testimonials":
      return {
        type: "testimonials",
        heading: "What Our Users Say",
        items: [
          {
            author: "Sarah Chen",
            role: "Product Designer",
            quote:
              "This platform completely transformed how our team works together.",
          },
          {
            author: "Marcus Rivera",
            role: "CTO at TechFlow",
            quote:
              "The best investment we made this year. Absolutely outstanding.",
          },
        ],
      };
    case "footer":
      return {
        type: "footer",
        companyName: "My Company",
        links: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Contact", url: "/contact" },
        ],
      };
    case "navbar":
      return {
        type: "navbar",
        logo: "Brand",
        links: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Services", url: "/services" },
          { label: "Contact", url: "/contact" },
        ],
      };
    case "gallery":
      return {
        type: "gallery",
        heading: "Our Work",
        items: [
          {
            color: "linear-gradient(135deg,#667eea,#764ba2)",
            caption: "Branding",
          },
          {
            color: "linear-gradient(135deg,#f093fb,#f5576c)",
            caption: "Design",
          },
          {
            color: "linear-gradient(135deg,#4facfe,#00f2fe)",
            caption: "Development",
          },
          {
            color: "linear-gradient(135deg,#43e97b,#38f9d7)",
            caption: "Motion",
          },
          {
            color: "linear-gradient(135deg,#fa709a,#fee140)",
            caption: "Photography",
          },
          {
            color: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
            caption: "Strategy",
          },
        ],
      };
    case "contact":
      return {
        type: "contact",
        heading: "Get In Touch",
        subheading: "Have a project in mind? We'd love to hear from you.",
        email: "hello@company.com",
        phone: "+1 (555) 123-4567",
      };
    case "cta":
      return {
        type: "cta",
        heading: "Ready to Get Started?",
        subheading: "Join thousands of teams already using our platform.",
        ctaText: "Start Your Free Trial",
        ctaColor: "#6366f1",
        bgColor: "#1e1b4b",
      };
    case "faq":
      return {
        type: "faq",
        heading: "Frequently Asked Questions",
        items: [
          {
            question: "How do I get started?",
            answer:
              "Sign up for a free account and follow our quick-start guide to launch your first project in minutes.",
          },
          {
            question: "Is there a free trial?",
            answer:
              "Yes! Our 14-day free trial includes full access to all Pro features with no credit card required.",
          },
          {
            question: "Can I cancel anytime?",
            answer:
              "Absolutely. You can cancel your subscription at any time with no cancellation fees or hidden charges.",
          },
        ],
      };
    case "team":
      return {
        type: "team",
        heading: "Meet the Team",
        members: [
          { name: "Alex Johnson", role: "CEO & Co-founder", initials: "AJ" },
          { name: "Maria García", role: "Head of Design", initials: "MG" },
          { name: "Kai Tanaka", role: "Lead Engineer", initials: "KT" },
          { name: "Priya Patel", role: "Growth Lead", initials: "PP" },
        ],
      };
    case "text-label":
      return {
        type: "text-label",
        content: "Your heading text here",
        tag: "h2",
        align: "center",
        fontSize: 32,
        color: "#ffffff",
      };
    case "text-button":
      return {
        type: "text-button",
        label: "Click Me",
        url: "#",
        size: "md",
        variant: "solid",
        align: "center",
        bgColor: "#6366f1",
        textColor: "#ffffff",
      };
    case "image-block":
      return {
        type: "image-block",
        src: "",
        caption: "",
        alt: "Image",
        width: "large",
        align: "center",
        borderRadius: 8,
      };
    case "image-button":
      return {
        type: "image-button",
        src: "",
        url: "#",
        overlayText: "",
        borderRadius: 8,
        width: "large",
      };
    case "video-embed":
      return {
        type: "video-embed",
        videoUrl: "",
        caption: "",
        autoplay: false,
      };
    case "spacer":
      return {
        type: "spacer",
        height: 40,
        showLine: false,
        lineColor: "#e2e8f0",
        lineStyle: "solid",
      };
    case "quote":
      return {
        type: "quote",
        quoteText: "The best way to predict the future is to create it.",
        author: "Peter Drucker",
        authorRole: "Management Consultant",
        avatarSrc: "",
        bgColor: "#1e1b4b",
      };
    case "social-links":
      return {
        type: "social-links",
        links: [
          { platform: "twitter", url: "https://twitter.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "linkedin", url: "https://linkedin.com" },
        ],
        align: "center",
        size: "md",
      };
    case "banner":
      return {
        type: "banner",
        message: "Special offer: Get 20% off today only!",
        icon: "",
        bgColor: "#6366f1",
        textColor: "#ffffff",
        dismissible: true,
      };
    case "map-embed":
      return {
        type: "map-embed",
        address: "New York, NY",
        embedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583091352!2d-74.11976397304606!3d40.69766374859258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890",
        height: 300,
      };
    case "code-snippet":
      return {
        type: "code-snippet",
        code: 'function hello() {\n  console.log("Hello, World!");\n}',
        language: "javascript",
        showLineNumbers: true,
      };
    case "countdown":
      return {
        type: "countdown",
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        label: "Launching in",
        bgColor: "#0f172a",
        textColor: "#6366f1",
      };
    case "rich-text":
      return {
        type: "rich-text",
        html: "<p>Start writing your content here. Use the toolbar to <strong>format</strong> your text.</p>",
      };
    case "icon-text":
      return {
        type: "icon-text",
        icon: "*",
        heading: "Our Mission",
        description:
          "We build tools that help people create beautiful things on the web.",
        align: "center",
      };
    case "accordion-item":
      return {
        type: "accordion-item",
        question: "What is your question?",
        answer: "Your detailed answer goes here.",
        defaultOpen: false,
      };
    case "stats":
      return {
        type: "stats",
        heading: "By the Numbers",
        items: [
          { value: "10K+", label: "Happy Customers" },
          { value: "99.9%", label: "Uptime" },
          { value: "50+", label: "Countries" },
          { value: "$2M+", label: "Revenue Generated" },
        ],
      };
  }
}

function RichTextRenderer({
  html,
  style,
}: { html: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = html;
    }
  }, [html]);
  return <div ref={ref} style={style} />;
}

// ============================================================
// IMAGE UPLOAD HELPERS
// ============================================================

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadButton({
  onUpload,
  label = "Upload Image",
  currentSrc,
}: {
  onUpload: (src: string) => void;
  label?: string;
  currentSrc?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        {label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const src = await readFileAsBase64(file);
              onUpload(src);
            }
          }}
        />
      </label>
      {currentSrc && (
        <div className="relative w-full h-20 rounded overflow-hidden border border-border">
          <img
            src={currentSrc}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onUpload("")}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return "";
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([-\w]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "X",
  instagram: "Ig",
  linkedin: "in",
  youtube: "YT",
  facebook: "f",
  tiktok: "Tk",
  github: "Gh",
};

// ============================================================
// CANVAS BLOCK PREVIEWS
// ============================================================

function BlockPreview({
  block,
  selected,
  onClick,
  theme,
}: {
  block: Block;
  selected: boolean;
  onClick: () => void;
  theme: ThemePreset;
}) {
  const t = THEME_PRESETS[theme].colors;
  const base = `cursor-pointer border-2 transition-all rounded-lg ${selected ? "border-indigo-500" : "border-transparent hover:border-indigo-400/40"}`;

  if (block.type === "navbar") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          border: `2px solid ${selected ? "#6366f1" : "transparent"}`,
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: t.accent, fontWeight: 700, fontSize: 16 }}>
            {block.logo}
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {block.links.map((link, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
                key={i}
                style={{ color: t.text, fontSize: 13, opacity: 0.8 }}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "hero") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: `linear-gradient(135deg, ${t.bg} 0%, ${t.card} 100%)`,
          padding: "40px 24px",
          textAlign: "center",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: t.text,
            marginBottom: 8,
          }}
        >
          {block.heading}
        </h2>
        <p
          style={{
            color: t.text,
            opacity: 0.7,
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          {block.subheading}
        </p>
        <button
          type="button"
          style={{
            background: block.ctaColor,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {block.ctaText}
        </button>
      </div>
    );
  }

  if (block.type === "features") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 20,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${block.items.length}, 1fr)`,
            gap: 16,
          }}
        >
          {block.items.map((item, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
              key={i}
              style={{
                textAlign: "center",
                padding: "12px",
                borderRadius: 8,
                background: t.bg,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.text,
                  opacity: 0.6,
                  marginTop: 4,
                }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "pricing") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 16,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${block.tiers.length}, 1fr)`,
            gap: 12,
          }}
        >
          {block.tiers.map((tier, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
              key={i}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, color: t.text }}>{tier.name}</div>
              <div style={{ color: t.accent, fontWeight: 600, marginTop: 4 }}>
                {tier.price}
              </div>
              <ul style={{ marginTop: 8, listStyle: "none", padding: 0 }}>
                {tier.features.map((f, fi) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
                    key={fi}
                    style={{
                      fontSize: 11,
                      color: t.text,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    ✓ {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "testimonials") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 16,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {block.items.map((item, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
              key={i}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: 14,
              }}
            >
              <p
                style={{
                  color: t.text,
                  fontSize: 12,
                  fontStyle: "italic",
                  opacity: 0.85,
                  marginBottom: 8,
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div style={{ fontWeight: 600, color: t.text, fontSize: 12 }}>
                {item.author}
              </div>
              <div style={{ color: t.text, fontSize: 11, opacity: 0.6 }}>
                {item.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "footer") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.bg,
          padding: "16px 24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>
            {block.companyName}
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {block.links.map((link, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
                key={i}
                style={{ color: t.text, fontSize: 11, opacity: 0.6 }}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "gallery") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 16,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {block.items.map((item, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in canvas block rendering
              key={i}
              style={{
                borderRadius: 8,
                height: 64,
                background: item.src ? undefined : item.color,
                backgroundImage: item.src ? `url(${item.src})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                padding: "6px 8px",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                {item.caption}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "contact") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 4,
          }}
        >
          {block.heading}
        </h3>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: t.text,
            opacity: 0.65,
            marginBottom: 16,
          }}
        >
          {block.subheading}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: t.text,
              opacity: 0.7,
            }}
          >
            Name
          </div>
          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: t.text,
              opacity: 0.7,
            }}
          >
            Email
          </div>
          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: t.text,
              opacity: 0.7,
              gridColumn: "span 2",
              height: 48,
            }}
          >
            Message
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: t.accent,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ✉ {block.email}
          </span>
          <span
            style={{
              fontSize: 12,
              color: t.accent,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            📞 {block.phone}
          </span>
        </div>
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: block.bgColor,
          padding: "40px 24px",
          textAlign: "center",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 8,
          }}
        >
          {block.heading}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          {block.subheading}
        </p>
        <button
          type="button"
          style={{
            background: block.ctaColor,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {block.ctaText}
        </button>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 16,
          }}
        >
          {block.heading}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {block.items.map((item, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
              key={i}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: t.text,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Q: {item.question}
              </div>
              <div style={{ fontSize: 12, color: t.text, opacity: 0.65 }}>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "team") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 20,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(block.members.length, 4)}, 1fr)`,
            gap: 12,
          }}
        >
          {block.members.map((member, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            <div key={i} style={{ textAlign: "center", padding: 12 }}>
              {member.avatarSrc ? (
                <img
                  src={member.avatarSrc}
                  alt={member.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 8px",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  {member.initials}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>
                {member.name}
              </div>
              <div style={{ fontSize: 11, color: t.text, opacity: 0.6 }}>
                {member.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "stats") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "32px 24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: t.text,
            marginBottom: 24,
          }}
        >
          {block.heading}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${block.items.length}, 1fr)`,
            gap: 16,
          }}
        >
          {block.items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: t.accent }}>
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: t.text,
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "text-label") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          textAlign: block.align,
        }}
      >
        {block.tag === "h1" && (
          <h1
            style={{
              color: block.color,
              fontSize: block.fontSize,
              fontWeight: 800,
              margin: 0,
            }}
          >
            {block.content}
          </h1>
        )}
        {block.tag === "h2" && (
          <h2
            style={{
              color: block.color,
              fontSize: block.fontSize,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {block.content}
          </h2>
        )}
        {block.tag === "h3" && (
          <h3
            style={{
              color: block.color,
              fontSize: block.fontSize,
              fontWeight: 600,
              margin: 0,
            }}
          >
            {block.content}
          </h3>
        )}
        {block.tag === "p" && (
          <p
            style={{ color: block.color, fontSize: block.fontSize, margin: 0 }}
          >
            {block.content}
          </p>
        )}
      </div>
    );
  }

  if (block.type === "text-button") {
    const padMap = { sm: "6px 16px", md: "10px 24px", lg: "14px 32px" };
    const btnStyle: React.CSSProperties =
      block.variant === "solid"
        ? { background: block.bgColor, color: block.textColor, border: "none" }
        : block.variant === "outline"
          ? {
              background: "transparent",
              color: block.bgColor,
              border: `2px solid ${block.bgColor}`,
            }
          : { background: "transparent", color: block.bgColor, border: "none" };
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          textAlign: block.align,
        }}
      >
        <button
          type="button"
          style={{
            ...btnStyle,
            padding: padMap[block.size],
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {block.label}
        </button>
      </div>
    );
  }

  if (block.type === "image-block") {
    const widthMap = {
      full: "100%",
      large: "80%",
      medium: "55%",
      small: "30%",
    };
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          textAlign: block.align,
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: widthMap[block.width],
            maxWidth: "100%",
          }}
        >
          {block.src ? (
            <img
              src={block.src}
              alt={block.alt}
              style={{
                width: "100%",
                borderRadius: block.borderRadius,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 120,
                background: t.bg,
                borderRadius: block.borderRadius,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed ${t.border}`,
              }}
            >
              <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>
                Upload an image in Properties
              </span>
            </div>
          )}
          {block.caption && (
            <p
              style={{
                color: t.text,
                opacity: 0.6,
                fontSize: 12,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {block.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "image-button") {
    const widthMap = { full: "100%", large: "70%", medium: "45%" };
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          textAlign: "center",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: widthMap[block.width],
            maxWidth: "100%",
            position: "relative",
            cursor: "pointer",
          }}
        >
          {block.src ? (
            <img
              src={block.src}
              alt="Click to navigate"
              style={{
                width: "100%",
                borderRadius: block.borderRadius,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 120,
                background: t.bg,
                borderRadius: block.borderRadius,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed ${t.border}`,
              }}
            >
              <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>
                Upload a clickable image
              </span>
            </div>
          )}
          {block.overlayText && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {block.overlayText}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "video-embed") {
    const embedUrl = getVideoEmbedUrl(block.videoUrl);
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        {embedUrl ? (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              allowFullScreen
              title="Video embed"
            />
          </div>
        ) : (
          <div
            style={{
              height: 160,
              background: t.bg,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px dashed ${t.border}`,
            }}
          >
            <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>
              Paste YouTube or Vimeo URL in properties
            </span>
          </div>
        )}
        {block.caption && (
          <p
            style={{
              color: t.text,
              opacity: 0.6,
              fontSize: 12,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {block.caption}
          </p>
        )}
      </div>
    );
  }

  if (block.type === "spacer") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: "transparent",
          padding: "4px",
          border: selected ? "2px dashed #6366f1" : "2px dashed transparent",
        }}
      >
        <div
          style={{
            height: block.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {block.showLine ? (
            <hr
              style={{
                width: "100%",
                border: "none",
                borderTop: `1px ${block.lineStyle} ${block.lineColor}`,
              }}
            />
          ) : (
            selected && (
              <span style={{ color: t.text, opacity: 0.3, fontSize: 11 }}>
                Spacer ({block.height}px)
              </span>
            )
          )}
        </div>
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: block.bgColor,
          padding: "32px 24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: t.accent,
            marginBottom: 12,
            lineHeight: 1,
          }}
        >
          "
        </div>
        <p
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontStyle: "italic",
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {block.quoteText}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {block.avatarSrc ? (
            <img
              src={block.avatarSrc}
              alt={block.author}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: t.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {block.author.charAt(0)}
            </div>
          )}
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13 }}>
              {block.author}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {block.authorRole}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "social-links") {
    const sizeMap = { sm: 32, md: 40, lg: 52 };
    const sz = sizeMap[block.size];
    const justifyMap = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
    };
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: justifyMap[block.align],
          }}
        >
          {block.links.map((link, idx) => (
            <div
              key={`${link.platform}-${idx}`}
              style={{
                width: sz,
                height: sz,
                borderRadius: "50%",
                background: t.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: Math.round(sz * 0.35),
              }}
            >
              {(SOCIAL_ICONS[link.platform] ?? link.platform.charAt(0)).slice(
                0,
                2,
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "banner") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: block.bgColor,
          padding: "14px 24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {block.icon && <span style={{ fontSize: 18 }}>{block.icon}</span>}
        <span style={{ color: block.textColor, fontWeight: 500, fontSize: 14 }}>
          {block.message}
        </span>
        {block.dismissible && (
          <span
            style={{
              color: block.textColor,
              opacity: 0.6,
              fontSize: 18,
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            x
          </span>
        )}
      </div>
    );
  }

  if (block.type === "map-embed") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "8px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
        }}
      >
        {block.embedUrl ? (
          <iframe
            src={block.embedUrl}
            width="100%"
            height={block.height}
            style={{ border: 0, borderRadius: 8 }}
            allowFullScreen
            loading="lazy"
            title="Map embed"
          />
        ) : (
          <div
            style={{
              height: block.height,
              background: t.bg,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px dashed ${t.border}`,
            }}
          >
            <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>
              Enter Google Maps embed URL in properties
            </span>
          </div>
        )}
      </div>
    );
  }

  if (block.type === "code-snippet") {
    const lines = block.code.split("\n");
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: "#0d1117",
          padding: "16px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace" }}
          >
            {block.language}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        </div>
        <pre style={{ margin: 0, overflowX: "auto" }}>
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern
            <div key={i} style={{ display: "flex", gap: 12 }}>
              {block.showLineNumbers && (
                <span
                  style={{
                    color: "#8b949e",
                    fontFamily: "monospace",
                    fontSize: 12,
                    userSelect: "none",
                    minWidth: 20,
                    textAlign: "right",
                  }}
                >
                  {i + 1}
                </span>
              )}
              <code
                style={{
                  color: "#c9d1d9",
                  fontFamily: "monospace",
                  fontSize: 12,
                  whiteSpace: "pre",
                }}
              >
                {line || " "}
              </code>
            </div>
          ))}
        </pre>
      </div>
    );
  }

  if (block.type === "countdown") {
    return (
      <CountdownPreview
        block={block}
        selected={selected}
        onClick={onClick}
        theme={theme}
      />
    );
  }

  if (block.type === "rich-text") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          color: t.text,
        }}
      >
        <RichTextRenderer
          html={block.html}
          style={{ fontSize: 14, lineHeight: 1.7 }}
        />
      </div>
    );
  }

  if (block.type === "icon-text") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
      <div
        className={base}
        onClick={onClick}
        style={{
          background: t.card,
          padding: "32px 24px",
          border: selected ? "2px solid #6366f1" : "2px solid transparent",
          textAlign: block.align,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>{block.icon}</div>
        <h3
          style={{
            color: t.text,
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          {block.heading}
        </h3>
        <p style={{ color: t.text, opacity: 0.7, fontSize: 14 }}>
          {block.description}
        </p>
      </div>
    );
  }

  if (block.type === "accordion-item") {
    return (
      <AccordionPreview
        block={block}
        selected={selected}
        onClick={onClick}
        theme={theme}
      />
    );
  }

  return null;
}

// ============================================================
// COUNTDOWN & ACCORDION SUB-COMPONENTS
// ============================================================

function CountdownPreview({
  block,
  selected,
  onClick,
  theme,
}: {
  block: CountdownBlock;
  selected: boolean;
  onClick: () => void;
  theme: ThemePreset;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const t = THEME_PRESETS[theme].colors;

  useEffect(() => {
    function calc() {
      const diff = new Date(block.targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [block.targetDate]);

  const base = `cursor-pointer border-2 transition-all rounded-lg ${selected ? "border-indigo-500" : "border-transparent hover:border-indigo-400/40"}`;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
    <div
      className={base}
      onClick={onClick}
      style={{
        background: block.bgColor,
        padding: "32px 24px",
        border: selected ? "2px solid #6366f1" : "2px solid transparent",
        textAlign: "center",
      }}
    >
      <p
        style={{ color: t.text, opacity: 0.7, fontSize: 14, marginBottom: 20 }}
      >
        {block.label}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
          <div key={unit} style={{ textAlign: "center" }}>
            <div
              style={{
                color: block.textColor,
                fontWeight: 800,
                fontSize: 36,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {String(timeLeft[unit]).padStart(2, "0")}
            </div>
            <div
              style={{
                color: t.text,
                opacity: 0.5,
                fontSize: 11,
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionPreview({
  block,
  selected,
  onClick,
  theme,
}: {
  block: AccordionItemBlock;
  selected: boolean;
  onClick: () => void;
  theme: ThemePreset;
}) {
  const [open, setOpen] = useState(block.defaultOpen);
  const t = THEME_PRESETS[theme].colors;
  const base = `cursor-pointer border-2 transition-all rounded-lg ${selected ? "border-indigo-500" : "border-transparent hover:border-indigo-400/40"}`;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing pattern in canvas block rendering
    <div
      className={base}
      onClick={onClick}
      style={{
        background: t.card,
        border: selected ? "2px solid #6366f1" : "2px solid transparent",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            color: t.text,
            fontWeight: 600,
            fontSize: 14,
            textAlign: "left",
          }}
        >
          {block.question}
        </span>
        <span
          style={{
            color: t.text,
            opacity: 0.5,
            fontSize: 18,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
            display: "inline-block",
          }}
        >
          v
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 20px 16px",
            color: t.text,
            fontSize: 13,
            opacity: 0.7,
            lineHeight: 1.6,
          }}
        >
          {block.answer}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROPERTIES PANEL
// ============================================================

function PropertiesPanel({
  block,
  onChange,
}: {
  block: Block | null;
  onChange: (updated: Block) => void;
}) {
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Layout className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">
          Click a section on the canvas to edit its properties
        </p>
      </div>
    );
  }

  if (block.type === "navbar") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Navbar</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Logo / Brand Name
          </Label>
          <Input
            value={block.logo}
            onChange={(e) => onChange({ ...block, logo: e.target.value })}
            className="bg-input border-border text-sm h-8"
            data-ocid="builder.navbar_logo.input"
          />
        </div>
        {block.links.map((link, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
          <div key={i} className="flex gap-2">
            <Input
              value={link.label}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], label: e.target.value };
                onChange({ ...block, links });
              }}
              placeholder="Label"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={link.url}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], url: e.target.value };
                onChange({ ...block, links });
              }}
              placeholder="URL"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "hero") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Hero Section</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Heading</Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
            data-ocid="builder.heading.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subheading</Label>
          <Textarea
            value={block.subheading}
            onChange={(e) => onChange({ ...block, subheading: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={2}
            data-ocid="builder.subheading.textarea"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">CTA Text</Label>
          <Input
            value={block.ctaText}
            onChange={(e) => onChange({ ...block, ctaText: e.target.value })}
            className="bg-input border-border text-sm h-8"
            data-ocid="builder.cta.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">CTA Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.ctaColor}
              onChange={(e) => onChange({ ...block, ctaColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-sm font-mono">
              {block.ctaColor}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "features") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Features Section
        </h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.items.map((item, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            key={i}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Feature {i + 1}
            </p>
            <Input
              value={item.icon}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], icon: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Emoji"
              className="bg-input border-border text-sm h-7 w-16"
            />
            <Input
              value={item.title}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], title: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Title"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={item.description}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], description: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Description"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "pricing") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Pricing</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.tiers.map((tier, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            key={i}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Tier {i + 1}
            </p>
            <Input
              value={tier.name}
              onChange={(e) => {
                const tiers = [...block.tiers];
                tiers[i] = { ...tiers[i], name: e.target.value };
                onChange({ ...block, tiers });
              }}
              placeholder="Name"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={tier.price}
              onChange={(e) => {
                const tiers = [...block.tiers];
                tiers[i] = { ...tiers[i], price: e.target.value };
                onChange({ ...block, tiers });
              }}
              placeholder="Price"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "testimonials") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Testimonials</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.items.map((item, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            key={i}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Testimonial {i + 1}
            </p>
            <Input
              value={item.author}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], author: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Author"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={item.role}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], role: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Role"
              className="bg-input border-border text-sm h-7"
            />
            <Textarea
              value={item.quote}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], quote: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Quote"
              rows={2}
              className="bg-input border-border text-sm resize-none"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "footer") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Footer</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Company Name</Label>
          <Input
            value={block.companyName}
            onChange={(e) =>
              onChange({ ...block, companyName: e.target.value })
            }
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.links.map((link, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
          <div key={i} className="flex gap-2">
            <Input
              value={link.label}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], label: e.target.value };
                onChange({ ...block, links });
              }}
              placeholder="Label"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={link.url}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], url: e.target.value };
                onChange({ ...block, links });
              }}
              placeholder="URL"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "gallery") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Gallery</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.items.map((item, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: gallery items don't have stable IDs
            key={i}
            className="border border-border rounded-lg p-2 space-y-2"
          >
            <p className="text-xs text-muted-foreground">Photo {i + 1}</p>
            <ImageUploadButton
              onUpload={(src) => {
                const items = [...block.items];
                items[i] = { ...items[i], src };
                onChange({ ...block, items });
              }}
              label="Upload Photo"
              currentSrc={item.src}
            />
            <Input
              value={item.caption}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], caption: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Caption"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "contact") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Contact</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Heading</Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subheading</Label>
          <Textarea
            value={block.subheading}
            onChange={(e) => onChange({ ...block, subheading: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input
            value={block.email}
            onChange={(e) => onChange({ ...block, email: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Phone</Label>
          <Input
            value={block.phone}
            onChange={(e) => onChange({ ...block, phone: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">CTA Banner</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Heading</Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subheading</Label>
          <Textarea
            value={block.subheading}
            onChange={(e) => onChange({ ...block, subheading: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">CTA Text</Label>
          <Input
            value={block.ctaText}
            onChange={(e) => onChange({ ...block, ctaText: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Button Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.ctaColor}
              onChange={(e) => onChange({ ...block, ctaColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.ctaColor}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Background Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.bgColor}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">FAQ</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.items.map((item, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            key={i}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Item {i + 1}
            </p>
            <Input
              value={item.question}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], question: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Question"
              className="bg-input border-border text-sm h-7"
            />
            <Textarea
              value={item.answer}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], answer: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Answer"
              rows={2}
              className="bg-input border-border text-sm resize-none"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "team") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Team</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.members.map((member, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
            key={i}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Member {i + 1}
            </p>
            <Input
              value={member.name}
              onChange={(e) => {
                const members = [...block.members];
                members[i] = { ...members[i], name: e.target.value };
                onChange({ ...block, members });
              }}
              placeholder="Name"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={member.role}
              onChange={(e) => {
                const members = [...block.members];
                members[i] = { ...members[i], role: e.target.value };
                onChange({ ...block, members });
              }}
              placeholder="Role"
              className="bg-input border-border text-sm h-7"
            />
            <Input
              value={member.initials}
              onChange={(e) => {
                const members = [...block.members];
                members[i] = { ...members[i], initials: e.target.value };
                onChange({ ...block, members });
              }}
              placeholder="Initials (e.g. AJ)"
              className="bg-input border-border text-sm h-7"
            />
            <ImageUploadButton
              onUpload={(src) => {
                const members = [...block.members];
                members[i] = { ...members[i], avatarSrc: src };
                onChange({ ...block, members });
              }}
              label="Upload Avatar"
              currentSrc={member.avatarSrc}
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "stats") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Stats</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Section Heading
          </Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        {block.items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={item.value}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], value: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Value"
              className="bg-input border-border text-sm h-7 w-20"
            />
            <Input
              value={item.label}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...items[i], label: e.target.value };
                onChange({ ...block, items });
              }}
              placeholder="Label"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "text-label") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Text Label</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Content</Label>
          <Textarea
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tag</Label>
          <div className="flex gap-1">
            {(["h1", "h2", "h3", "p"] as const).map((tagOpt) => (
              <button
                key={tagOpt}
                type="button"
                onClick={() => onChange({ ...block, tag: tagOpt })}
                className={`px-2 py-1 text-xs rounded border ${block.tag === tagOpt ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {tagOpt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...block, align: a })}
                className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Font Size: {block.fontSize}px
          </Label>
          <input
            type="range"
            min={12}
            max={96}
            value={block.fontSize}
            onChange={(e) =>
              onChange({ ...block, fontSize: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.color}
              onChange={(e) => onChange({ ...block, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.color}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "text-button") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Text Button</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Button Label</Label>
          <Input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Link URL</Label>
          <Input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Size</Label>
          <div className="flex gap-1">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...block, size: s })}
                className={`px-2 py-1 text-xs rounded border ${block.size === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Style</Label>
          <div className="flex gap-1">
            {(["solid", "outline", "ghost"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...block, variant: v })}
                className={`px-2 py-1 text-xs rounded border ${block.variant === v ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...block, align: a })}
                className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Background Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.bgColor}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.textColor}
              onChange={(e) =>
                onChange({ ...block, textColor: e.target.value })
              }
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.textColor}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "image-block") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Image</h3>
        <ImageUploadButton
          onUpload={(src) => onChange({ ...block, src })}
          label="Upload from Device"
          currentSrc={block.src}
        />
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Caption</Label>
          <Input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Optional caption"
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alt Text</Label>
          <Input
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Describe the image"
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Width</Label>
          <div className="flex gap-1 flex-wrap">
            {(["small", "medium", "large", "full"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ ...block, width: w })}
                className={`px-2 py-1 text-xs rounded border ${block.width === w ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...block, align: a })}
                className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Border Radius: {block.borderRadius}px
          </Label>
          <input
            type="range"
            min={0}
            max={48}
            value={block.borderRadius}
            onChange={(e) =>
              onChange({ ...block, borderRadius: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (block.type === "image-button") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Image Button</h3>
        <ImageUploadButton
          onUpload={(src) => onChange({ ...block, src })}
          label="Upload from Device"
          currentSrc={block.src}
        />
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Link URL</Label>
          <Input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Overlay Text</Label>
          <Input
            value={block.overlayText}
            onChange={(e) =>
              onChange({ ...block, overlayText: e.target.value })
            }
            placeholder="Optional text overlay"
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Width</Label>
          <div className="flex gap-1">
            {(["medium", "large", "full"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ ...block, width: w })}
                className={`px-2 py-1 text-xs rounded border ${block.width === w ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Border Radius: {block.borderRadius}px
          </Label>
          <input
            type="range"
            min={0}
            max={48}
            value={block.borderRadius}
            onChange={(e) =>
              onChange({ ...block, borderRadius: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (block.type === "video-embed") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Video Embed</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            YouTube / Vimeo URL
          </Label>
          <Input
            value={block.videoUrl}
            onChange={(e) => onChange({ ...block, videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Caption</Label>
          <Input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Optional caption"
            className="bg-input border-border text-sm h-8"
          />
        </div>
      </div>
    );
  }

  if (block.type === "spacer") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Spacer / Divider
        </h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Height: {block.height}px
          </Label>
          <input
            type="range"
            min={8}
            max={200}
            value={block.height}
            onChange={(e) =>
              onChange({ ...block, height: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.showLine}
            onChange={(e) => onChange({ ...block, showLine: e.target.checked })}
            id="spacer-line"
          />
          <Label
            htmlFor="spacer-line"
            className="text-xs text-muted-foreground"
          >
            Show divider line
          </Label>
        </div>
        {block.showLine && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Line Color
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={block.lineColor}
                  onChange={(e) =>
                    onChange({ ...block, lineColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                />
                <span className="text-muted-foreground text-xs font-mono">
                  {block.lineColor}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Line Style
              </Label>
              <div className="flex gap-1">
                {(["solid", "dashed", "dotted"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...block, lineStyle: s })}
                    className={`px-2 py-1 text-xs rounded border ${block.lineStyle === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Pull Quote</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Quote Text</Label>
          <Textarea
            value={block.quoteText}
            onChange={(e) => onChange({ ...block, quoteText: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Author Name</Label>
          <Input
            value={block.author}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Author Role</Label>
          <Input
            value={block.authorRole}
            onChange={(e) => onChange({ ...block, authorRole: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Avatar</Label>
          <ImageUploadButton
            onUpload={(src) => onChange({ ...block, avatarSrc: src })}
            label="Upload Avatar"
            currentSrc={block.avatarSrc}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Background Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.bgColor}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "social-links") {
    const PLATFORMS = [
      "twitter",
      "instagram",
      "linkedin",
      "youtube",
      "facebook",
      "tiktok",
      "github",
    ] as const;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Social Links</h3>
        {block.links.map((link, i) => (
          <div
            key={`${link.platform}-${i}`}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground capitalize">
                {link.platform}
              </p>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    links: block.links.filter((_, idx) => idx !== i),
                  })
                }
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <select
              value={link.platform}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = {
                  ...links[i],
                  platform: e.target.value as typeof link.platform,
                };
                onChange({ ...block, links });
              }}
              className="w-full bg-input border border-border rounded text-sm p-1 text-foreground"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Input
              value={link.url}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], url: e.target.value };
                onChange({ ...block, links });
              }}
              placeholder="URL"
              className="bg-input border-border text-sm h-7"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...block,
              links: [...block.links, { platform: "twitter", url: "" }],
            })
          }
          className="w-full py-1.5 text-xs rounded border border-dashed border-border text-muted-foreground hover:border-indigo-500 hover:text-indigo-400"
        >
          + Add Link
        </button>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...block, align: a })}
                className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Icon Size</Label>
          <div className="flex gap-1">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...block, size: s })}
                className={`px-2 py-1 text-xs rounded border ${block.size === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "banner") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Banner / Alert
        </h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Message</Label>
          <Textarea
            value={block.message}
            onChange={(e) => onChange({ ...block, message: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Icon (emoji)</Label>
          <Input
            value={block.icon}
            onChange={(e) => onChange({ ...block, icon: e.target.value })}
            placeholder="e.g. !"
            className="bg-input border-border text-sm h-8 w-20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Background Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.bgColor}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.textColor}
              onChange={(e) =>
                onChange({ ...block, textColor: e.target.value })
              }
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.textColor}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.dismissible}
            onChange={(e) =>
              onChange({ ...block, dismissible: e.target.checked })
            }
            id="banner-dismiss"
          />
          <Label
            htmlFor="banner-dismiss"
            className="text-xs text-muted-foreground"
          >
            Show dismiss button
          </Label>
        </div>
      </div>
    );
  }

  if (block.type === "map-embed") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Map Embed</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Google Maps Embed URL
          </Label>
          <Textarea
            value={block.embedUrl}
            onChange={(e) => onChange({ ...block, embedUrl: e.target.value })}
            placeholder="Paste Google Maps embed URL here"
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
          <p className="text-[10px] text-muted-foreground">
            Google Maps &rarr; Share &rarr; Embed a map &rarr; copy src URL
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Height: {block.height}px
          </Label>
          <input
            type="range"
            min={150}
            max={600}
            value={block.height}
            onChange={(e) =>
              onChange({ ...block, height: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (block.type === "code-snippet") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Code Snippet</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Language</Label>
          <select
            value={block.language}
            onChange={(e) => onChange({ ...block, language: e.target.value })}
            className="w-full bg-input border border-border rounded text-sm p-1.5 text-foreground"
          >
            {[
              "javascript",
              "typescript",
              "python",
              "css",
              "html",
              "bash",
              "json",
              "sql",
              "rust",
              "go",
            ].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Code</Label>
          <Textarea
            value={block.code}
            onChange={(e) => onChange({ ...block, code: e.target.value })}
            className="bg-input border-border text-xs font-mono resize-none"
            rows={6}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.showLineNumbers}
            onChange={(e) =>
              onChange({ ...block, showLineNumbers: e.target.checked })
            }
            id="code-lines"
          />
          <Label htmlFor="code-lines" className="text-xs text-muted-foreground">
            Show line numbers
          </Label>
        </div>
      </div>
    );
  }

  if (block.type === "countdown") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Countdown Timer
        </h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Target Date & Time
          </Label>
          <Input
            type="datetime-local"
            value={block.targetDate}
            onChange={(e) => onChange({ ...block, targetDate: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Background Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.bgColor}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Accent / Number Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.textColor}
              onChange={(e) =>
                onChange({ ...block, textColor: e.target.value })
              }
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">
              {block.textColor}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "rich-text") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Rich Text / HTML
        </h3>
        <div className="flex gap-1 flex-wrap">
          {[
            { label: "B", insert: "<strong>bold text</strong>" },
            { label: "I", insert: "<em>italic text</em>" },
            { label: "U", insert: "<u>underlined text</u>" },
            { label: "Link", insert: '<a href="#">link text</a>' },
            {
              label: "UL",
              insert: "<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>",
            },
          ].map(({ label, insert }) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                onChange({ ...block, html: `${block.html} ${insert}` })
              }
              className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:bg-muted"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">HTML Content</Label>
          <Textarea
            value={block.html}
            onChange={(e) => onChange({ ...block, html: e.target.value })}
            className="bg-input border-border text-xs font-mono resize-none"
            rows={8}
          />
          <p className="text-[10px] text-muted-foreground">
            Supports &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;ul&gt;,
            &lt;h1&gt;-&lt;h6&gt;, etc.
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "icon-text") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Icon + Text</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Icon (emoji)</Label>
          <Input
            value={block.icon}
            onChange={(e) => onChange({ ...block, icon: e.target.value })}
            placeholder="e.g. *"
            className="bg-input border-border text-sm h-8 w-20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Heading</Label>
          <Input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={block.description}
            onChange={(e) =>
              onChange({ ...block, description: e.target.value })
            }
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...block, align: a })}
                className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "accordion-item") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          Accordion Item
        </h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Input
            value={block.question}
            onChange={(e) => onChange({ ...block, question: e.target.value })}
            className="bg-input border-border text-sm h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Textarea
            value={block.answer}
            onChange={(e) => onChange({ ...block, answer: e.target.value })}
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.defaultOpen}
            onChange={(e) =>
              onChange({ ...block, defaultOpen: e.target.checked })
            }
            id="acc-open"
          />
          <Label htmlFor="acc-open" className="text-xs text-muted-foreground">
            Open by default
          </Label>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// AI ASSISTANT ENGINE
// ============================================================

function getAiResponse(
  prompt: string,
  currentBlocks: Block[],
  onSetBlocks: (blocks: Block[]) => void,
  selectedBlock: Block | null,
  onUpdateBlock: (b: Block) => void,
): string {
  const p = prompt.toLowerCase();

  // Template suggestions
  if (
    p.includes("portfolio") ||
    p.includes("designer") ||
    p.includes("artist") ||
    p.includes("photography")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "portfolio");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "I've set up a Portfolio site for you — perfect for showcasing your creative work! Customize each section in the Properties panel on the right. ✨";
    }
  }

  if (
    p.includes("saas") ||
    p.includes("startup") ||
    p.includes("software") ||
    p.includes("app") ||
    p.includes("product")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "saas");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Done! I've built a SaaS Landing page structure for you — navbar, hero, features, pricing, testimonials, and footer. Start customizing in the Properties panel! 🚀";
    }
  }

  if (
    p.includes("agency") ||
    p.includes("company") ||
    p.includes("business") ||
    p.includes("consulting")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "agency");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Great choice! I've created an Agency site with stats, team showcase, and contact section. Your business site is ready to customize. 💼";
    }
  }

  if (
    p.includes("blog") ||
    p.includes("journal") ||
    p.includes("writing") ||
    p.includes("personal site")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "blog");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Blog site ready! I've set up a clean layout perfect for your articles and personal writing. Start customizing in the Properties panel. ✍️";
    }
  }

  if (
    p.includes("ecommerce") ||
    p.includes("e-commerce") ||
    p.includes("shop") ||
    p.includes("store") ||
    p.includes("sell") ||
    p.includes("products") ||
    p.includes("retail")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "ecommerce");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "E-commerce store built! Gallery, pricing, and all the essentials are in place. Customize your products in the Properties panel. 🛒";
    }
  }

  if (
    p.includes("restaurant") ||
    p.includes("cafe") ||
    p.includes("food") ||
    p.includes("menu") ||
    p.includes("dining")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "restaurant");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Your restaurant site is ready! Complete with gallery, menu highlights, and a contact section for reservations. 🍽️";
    }
  }

  if (
    p.includes("event") ||
    p.includes("conference") ||
    p.includes("meetup") ||
    p.includes("ticket") ||
    p.includes("schedule")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "event");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Event page launched! Features, schedule, pricing, and speaker sections are all set up. 🎪";
    }
  }

  if (
    p.includes("personal brand") ||
    p.includes("speaker") ||
    p.includes("coach") ||
    p.includes("influencer")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "personal-brand");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Personal brand page ready! Hero, testimonials, and contact — perfect for building your online presence. 🌟";
    }
  }

  if (
    p.includes("nonprofit") ||
    p.includes("charity") ||
    p.includes("ngo") ||
    p.includes("community") ||
    p.includes("cause")
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "nonprofit");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Nonprofit site created! Stats, mission, team, and contact sections are ready. Make an impact! 💚";
    }
  }

  if (
    p.includes("launch") ||
    p.includes("growth") ||
    (p.includes("startup") && !p.includes("saas"))
  ) {
    const template = SEARCH_TEMPLATES.find((t) => t.id === "startup");
    if (template) {
      onSetBlocks(template.blocks.map(createBlock));
      return "Startup landing page live! Stats, features, and pricing are all in place. Ready for launch! 🚀";
    }
  }

  // Guided flow: vague or generic request
  if (
    (p.length < 15 ||
      p.includes("website") ||
      p.includes("site") ||
      p.includes("build") ||
      p.includes("create") ||
      p.includes("make") ||
      p.includes("help")) &&
    !p.includes("add ") &&
    !p.includes("remove") &&
    !p.includes("change") &&
    !p.includes("generate")
  ) {
    return "I'd love to help you build a site! What kind of website are you making? For example: a business, portfolio, blog, restaurant, or online store? 🤔";
  }

  // What can you do
  if (
    p.includes("what can you do") ||
    p.includes("capabilities") ||
    p === "help" ||
    p.includes("how do you work")
  ) {
    return `Here's what I can do for you! 🤖

🏗️ **Build complete sites:**
• SaaS Landing, Portfolio, Agency, Blog
• E-Commerce Store, Restaurant, Startup
• Personal Brand, Nonprofit, Event

➕ **Add specific sections:**
• "Add a pricing section"
• "Add a contact form"
• "Add a gallery"
• "Add a FAQ section"

🎨 **Edit your content:**
• "Change heading to My Title"
• "Remove the footer"

🧹 **Manage your canvas:**
• "Clear the canvas"
• "Start over"

What would you like to build today?`;
  }

  // Add specific blocks
  if (
    p.includes("add hero") ||
    (p.includes("hero") && !currentBlocks.some((b) => b.type === "hero"))
  ) {
    onSetBlocks([createBlock("hero"), ...currentBlocks]);
    return "Added a Hero section at the top! Click it to customize the heading, subheading, and CTA button. 🎯";
  }

  if (
    p.includes("add contact") ||
    (p.includes("contact") && !currentBlocks.some((b) => b.type === "contact"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("contact")]);
    return "Added a Contact form section at the bottom of your page. Update your email and phone details in the Properties panel. 📬";
  }

  if (
    p.includes("add pricing") ||
    (p.includes("pricing") && !currentBlocks.some((b) => b.type === "pricing"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("pricing")]);
    return "Pricing section added! Head to Properties to update your tiers and pricing details. 💰";
  }

  if (
    p.includes("add gallery") ||
    (p.includes("gallery") && !currentBlocks.some((b) => b.type === "gallery"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("gallery")]);
    return "Gallery section added with 6 colorful placeholder cards. Update the captions in Properties. 🖼️";
  }

  if (
    p.includes("add faq") ||
    (p.includes("faq") && !currentBlocks.some((b) => b.type === "faq"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("faq")]);
    return "FAQ section added with 3 starter questions. Edit them in the Properties panel to match your product. ❓";
  }

  if (
    p.includes("add stats") ||
    (p.includes("stats") && !currentBlocks.some((b) => b.type === "stats"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("stats")]);
    return "Stats section added! Update the numbers to reflect your real metrics and milestones. 📊";
  }

  if (
    p.includes("add team") ||
    (p.includes("team") && !currentBlocks.some((b) => b.type === "team"))
  ) {
    onSetBlocks([...currentBlocks, createBlock("team")]);
    return "Team section added with placeholder members. Add your real team in the Properties panel. 👥";
  }

  if (
    p.includes("add navbar") ||
    p.includes("add nav") ||
    p.includes("navigation")
  ) {
    if (!currentBlocks.some((b) => b.type === "navbar")) {
      onSetBlocks([createBlock("navbar"), ...currentBlocks]);
      return "Navbar added to the top of your page! Customize the logo and nav links in Properties. 🧭";
    }
    return "You already have a navbar! Click it on the canvas to edit the links.";
  }

  if (p.includes("add footer") || p.includes("footer")) {
    if (!currentBlocks.some((b) => b.type === "footer")) {
      onSetBlocks([...currentBlocks, createBlock("footer")]);
      return "Footer added at the bottom. Update your company name and links in Properties. 📄";
    }
    return "You already have a footer! Click it on the canvas to edit.";
  }

  // Remove blocks
  const removeMatch = p.match(
    /remove (hero|features|pricing|testimonials|footer|navbar|gallery|contact|cta|faq|team|stats)/,
  );
  if (removeMatch) {
    const typeToRemove = removeMatch[1] as Block["type"];
    const updated = currentBlocks.filter((b) => b.type !== typeToRemove);
    if (updated.length !== currentBlocks.length) {
      onSetBlocks(updated);
      return `Removed the ${typeToRemove} section from your page.`;
    }
    return `I couldn't find a ${typeToRemove} section to remove.`;
  }

  // Change heading/title
  const headingMatch = p.match(
    /(?:change heading|update title|set title|set heading)\s+to\s+(.+)/i,
  );
  if (headingMatch && selectedBlock && "heading" in selectedBlock) {
    const newHeading = headingMatch[1].trim();
    onUpdateBlock({ ...selectedBlock, heading: newHeading } as Block);
    return `Updated the heading to "${newHeading}"! 📝`;
  }

  // Full site generation shortcut
  if (
    p.includes("generate") ||
    p.includes("create full site") ||
    p.includes("build site") ||
    p.includes("full site")
  ) {
    const saasTemplate = SEARCH_TEMPLATES.find((t) => t.id === "saas");
    onSetBlocks((saasTemplate ?? SEARCH_TEMPLATES[0]).blocks.map(createBlock));
    return "Generated a complete SaaS landing page for you! It includes a navbar, hero, features, pricing, testimonials, and footer. Customize each section in the Properties panel. 🎉";
  }

  // Clear canvas
  if (p.includes("clear") || p.includes("start over") || p.includes("empty")) {
    onSetBlocks([]);
    return "Canvas cleared! Start fresh by adding sections from the Blocks tab, or ask me to generate a site for you. 🧹";
  }

  // Fallback help
  return `I can help you build your site! Here are some things you can ask me:

• "Make me a portfolio site"
• "Generate a SaaS landing page"
• "Add a pricing section"
• "Add a contact form"
• "Remove the footer"
• "Change heading to Your New Title"

What would you like to build? 🤖`;
}

// ============================================================
// GEMINI AI INTEGRATION
// ============================================================

const GEMINI_API_KEY = "AIzaSyB-W4uWoW8kG_pspOlvg6AcdyDCAd1ntB4";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGeminiAI(
  userPrompt: string,
): Promise<{ blocks: Block[]; message: string } | null> {
  const systemPrompt = `You are an expert web designer AI for SiteForge website builder. When a user describes a website, respond with a JSON object containing:
1. "message": a short friendly description of what you built (1-2 sentences, include an emoji)
2. "blocks": an array of website block objects

Available block types and their exact required fields:
- hero: { "type":"hero", "heading":"...", "subheading":"...", "ctaText":"...", "ctaColor":"#6366f1" }
- features: { "type":"features", "heading":"...", "items":[{"icon":"emoji","title":"...","description":"..."}] }
- pricing: { "type":"pricing", "heading":"...", "tiers":[{"name":"...","price":"...","features":["..."]}] }
- testimonials: { "type":"testimonials", "heading":"...", "items":[{"author":"...","role":"...","quote":"..."}] }
- faq: { "type":"faq", "heading":"...", "items":[{"question":"...","answer":"..."}] }
- gallery: { "type":"gallery", "heading":"...", "items":[{"url":"https://picsum.photos/400/300","caption":"..."}] }
- team: { "type":"team", "heading":"...", "members":[{"name":"...","role":"...","bio":"..."}] }
- contact: { "type":"contact", "heading":"...", "subheading":"...", "email":"...", "phone":"...", "address":"..." }
- stats: { "type":"stats", "heading":"...", "items":[{"value":"...","label":"..."}] }
- navbar: { "type":"navbar", "logo":"...", "links":[{"label":"...","url":"#..."}] }
- footer: { "type":"footer", "companyName":"...", "tagline":"...", "links":[{"label":"...","url":"#..."}] }
- cta: { "type":"cta", "heading":"...", "subheading":"...", "ctaText":"...", "ctaColor":"#6366f1" }

Rules:
- Always start with a navbar block, then hero block
- Always end with a footer block
- Return 6-10 blocks for a complete website
- Make content specific and realistic (not generic placeholders)
- Use relevant emojis in icon fields
- Return ONLY a valid JSON object, absolutely no markdown code fences or extra text

User request: ${userPrompt}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    // Strip markdown fences if AI adds them despite instructions
    const cleaned = text.replaceAll("```json", "").replaceAll("```", "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) return null;
    // Map each raw block object through createBlock to ensure proper defaults
    const typedBlocks: Block[] = parsed.blocks.map(
      (raw: { type?: string } & Record<string, unknown>) => {
        const base = createBlock(raw.type as Block["type"]);
        return { ...base, ...raw } as Block;
      },
    );
    return {
      blocks: typedBlocks,
      message: parsed.message ?? "✨ Your website is ready!",
    };
  } catch {
    return null;
  }
}

// ============================================================
// AI CHAT PANEL
// ============================================================

type AiSubMode = "search" | "chat";

function AiChatPanel({
  blocks,
  onSetBlocks,
  selectedBlock,
  onUpdateBlock,
}: {
  blocks: Block[];
  onSetBlocks: (blocks: Block[]) => void;
  selectedBlock: Block | null;
  onUpdateBlock: (b: Block) => void;
}) {
  const [subMode, setSubMode] = useState<AiSubMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "Hi! I'm your Gemini AI web designer ✨ Describe any website you want and I'll build it for you instantly — try 'Build me a restaurant website' or 'Create a SaaS landing page for a task manager'.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed, timestamp: Date.now() },
      ]);
      setInput("");
      setIsTyping(true);

      try {
        const result = await callGeminiAI(trimmed);
        if (result?.blocks && result.blocks.length > 0) {
          onSetBlocks(result.blocks);
          setMessages((prev) => [
            ...prev,
            { role: "ai", content: result.message, timestamp: Date.now() },
          ]);
        } else {
          // Fallback to local AI response when Gemini is unavailable
          const response = getAiResponse(
            trimmed,
            blocks,
            onSetBlocks,
            selectedBlock,
            onUpdateBlock,
          );
          setMessages((prev) => [
            ...prev,
            { role: "ai", content: response, timestamp: Date.now() },
          ]);
        }
      } catch {
        // Fallback to local AI response on error
        const response = getAiResponse(
          trimmed,
          blocks,
          onSetBlocks,
          selectedBlock,
          onUpdateBlock,
        );
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: response, timestamp: Date.now() },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [blocks, onSetBlocks, selectedBlock, onUpdateBlock, isTyping],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const filteredTemplates = searchQuery.trim()
    ? SEARCH_TEMPLATES.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
        );
      })
    : SEARCH_TEMPLATES;

  const handleUseTemplate = (template: (typeof SEARCH_TEMPLATES)[0]) => {
    onSetBlocks(template.blocks.map(createBlock));
    toast.success(`Applied "${template.name}" template!`);
  };

  const QUICK_CHIPS_ROW1 = [
    "SaaS site",
    "Portfolio",
    "Restaurant",
    "E-commerce",
  ];
  const QUICK_CHIPS_ROW2 = ["Blog", "Agency", "Event", "Personal Brand"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/60 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
        >
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">AI Assistant</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="text-[9px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
              Gemini AI ✨
            </span>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400">Online</span>
        </div>
      </div>

      {/* Sub-mode pill switcher */}
      <div className="px-3 py-2 border-b border-border/40 flex gap-1">
        <button
          type="button"
          onClick={() => setSubMode("search")}
          data-ocid="builder.ai.search.tab"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
            subMode === "search"
              ? "bg-indigo-600 text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Search className="w-3 h-3" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setSubMode("chat")}
          data-ocid="builder.ai.chat.tab"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
            subMode === "chat"
              ? "bg-indigo-600 text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
      </div>

      {/* SEARCH MODE */}
      {subMode === "search" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Search input */}
          <div className="px-3 py-2 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, ideas, styles..."
                data-ocid="builder.ai.search_input"
                className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Template results */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {!searchQuery.trim() && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Popular Templates
              </p>
            )}
            {filteredTemplates.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="builder.ai.search.empty_state"
              >
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No templates found
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Try "blog", "store", or "event"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.04 }}
                    data-ocid={`builder.ai.template.item.${idx + 1}`}
                    className="group border border-border/60 rounded-lg overflow-hidden bg-card hover:border-indigo-500/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-24 flex items-center justify-center text-2xl font-bold text-white/80"
                        style={{
                          background: `linear-gradient(135deg, ${
                            [
                              "#6366f1,#a855f7",
                              "#0ea5e9,#06b6d4",
                              "#10b981,#14b8a6",
                              "#f59e0b,#f97316",
                              "#ef4444,#f43f5e",
                            ][idx % 5]
                          })`,
                        }}
                      >
                        {template.name.charAt(0)}
                      </div>
                    )}
                    {/* Info */}
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-foreground leading-tight">
                        {template.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                        {template.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleUseTemplate(template)}
                        data-ocid={`builder.ai.template.button.${idx + 1}`}
                        className="mt-1.5 w-full text-[10px] py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium"
                      >
                        Use Template
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT MODE */}
      {subMode === "chat" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Quick action chips */}
          <div className="px-3 py-2 border-b border-border/40 space-y-1.5">
            <div className="flex gap-1 flex-wrap">
              {QUICK_CHIPS_ROW1.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(`Generate a ${q}`)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {QUICK_CHIPS_ROW2.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(`Generate a ${q}`)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat history */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
          >
            {messages.map((msg, i) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern in block renderer
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    }}
                  >
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-center"
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2.5 flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: dot * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-border/60 p-3 space-y-2">
            <p className="text-[9px] text-center text-muted-foreground/50 tracking-wide">
              ✨ Powered by{" "}
              <span className="text-indigo-400 font-medium">Gemini AI</span> —
              describe any site and I'll build it
            </p>
            <button
              type="button"
              onClick={() => sendMessage("Generate a full SaaS landing site")}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-xs hover:bg-indigo-500/10 transition-colors"
              data-ocid="builder.ai.generate_site_button"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate Full Site
            </button>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI anything..."
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500 transition-colors"
                data-ocid="builder.ai.input"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors shrink-0"
                data-ocid="builder.ai.send.button"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN BUILDER EXPORT
// ============================================================

export default function BuilderPage() {
  return (
    <ProtectedRoute>
      <BuilderContent />
    </ProtectedRoute>
  );
}

function BuilderContent() {
  const params = useParams({ strict: false }) as { siteId?: string };
  const siteId = params.siteId;
  const isNew = !siteId || siteId === "new";

  const { data: existingSite, isLoading: siteLoading } = useGetSiteById(
    isNew ? undefined : siteId,
  );
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const publishSite = usePublishSite();
  const { ensureRegistered } = useUserRegistration();

  const [siteTitle, setSiteTitle] = useState("Untitled Site");
  const [siteDescription, setSiteDescription] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([createBlock("hero")]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [savedSiteId, setSavedSiteId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [theme, setTheme] = useState<ThemePreset>("dark");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [showMobileBlocks, setShowMobileBlocks] = useState(false);
  const [showMobileProps, setShowMobileProps] = useState(false);
  const [history, setHistory] = useState<Block[][]>([[createBlock("hero")]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load existing site
  if (existingSite && !initialized) {
    setSiteTitle(existingSite.title);
    setSiteDescription(existingSite.description);
    try {
      const parsed = JSON.parse(existingSite.content);
      if (Array.isArray(parsed)) {
        setBlocks(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);
      }
    } catch {}
    if (existingSite.status.__kind__ === "published") {
      setPublishedUrl(existingSite.status.published);
    }
    setInitialized(true);
  }

  const activeSiteId = savedSiteId || (!isNew ? siteId : null);

  // Push to history whenever blocks change
  const pushHistory = useCallback(
    (newBlocks: Block[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newBlocks];
      });
      setHistoryIndex((prev) => prev + 1);
      setBlocks(newBlocks);
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setBlocks(history[newIndex]);
    setSelectedIndex(null);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setBlocks(history[newIndex]);
    setSelectedIndex(null);
  }, [historyIndex, history]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo],
  );

  const addBlock = useCallback(
    (type: Block["type"]) => {
      setBlocks((prev) => {
        const updated = [...prev, createBlock(type)];
        setSelectedIndex(updated.length - 1);
        setHistory((h) => {
          const sliced = h.slice(0, historyIndex + 1);
          return [...sliced, updated];
        });
        setHistoryIndex((i) => i + 1);
        return updated;
      });
    },
    [historyIndex],
  );

  const removeBlock = useCallback(
    (index: number) => {
      setBlocks((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        setSelectedIndex(null);
        setHistory((h) => {
          const sliced = h.slice(0, historyIndex + 1);
          return [...sliced, updated];
        });
        setHistoryIndex((i) => i + 1);
        return updated;
      });
    },
    [historyIndex],
  );

  const duplicateBlock = useCallback(
    (index: number) => {
      setBlocks((prev) => {
        const clone = JSON.parse(JSON.stringify(prev[index])) as Block;
        const updated = [
          ...prev.slice(0, index + 1),
          clone,
          ...prev.slice(index + 1),
        ];
        setSelectedIndex(index + 1);
        setHistory((h) => {
          const sliced = h.slice(0, historyIndex + 1);
          return [...sliced, updated];
        });
        setHistoryIndex((i) => i + 1);
        return updated;
      });
    },
    [historyIndex],
  );

  const moveBlock = useCallback(
    (index: number, dir: -1 | 1) => {
      setBlocks((prev) => {
        const updated = [...prev];
        const target = index + dir;
        if (target < 0 || target >= updated.length) return prev;
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setSelectedIndex(target);
        setHistory((h) => {
          const sliced = h.slice(0, historyIndex + 1);
          return [...sliced, updated];
        });
        setHistoryIndex((i) => i + 1);
        return updated;
      });
    },
    [historyIndex],
  );

  const updateBlock = useCallback(
    (updated: Block) => {
      setBlocks((prev) =>
        prev.map((b, i) => (i === selectedIndex ? updated : b)),
      );
    },
    [selectedIndex],
  );

  const handleSave = async () => {
    const content = JSON.stringify(blocks);
    try {
      await ensureRegistered();
      if (activeSiteId) {
        await updateSite.mutateAsync({
          id: activeSiteId,
          title: siteTitle,
          description: siteDescription,
          content,
        });
        toast.success("Site saved!");
      } else {
        const newId = await createSite.mutateAsync({
          title: siteTitle,
          description: siteDescription,
          content,
        });
        setSavedSiteId(newId);
        toast.success("Site created!");
      }
    } catch {
      toast.error("Failed to save site.");
    }
  };

  const handlePublish = async () => {
    await ensureRegistered();
    if (!activeSiteId) {
      toast.error("Please save your site first.");
      return;
    }
    try {
      const url = await publishSite.mutateAsync(activeSiteId);
      setPublishedUrl(url);
      toast.success("Site published!", { description: url });
    } catch {
      toast.error("Failed to publish site.");
    }
  };

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    if (blocks.length > 0) {
      if (
        !window.confirm(
          `Replace current canvas with "${template.name}" template?`,
        )
      )
        return;
    }
    pushHistory(template.blocks.map(createBlock));
    setSelectedIndex(0);
    toast.success(`Template "${template.name}" applied!`);
  };

  const canvasMaxWidth =
    device === "desktop" ? "none" : device === "tablet" ? "768px" : "390px";

  const isSaving = createSite.isPending || updateSite.isPending;
  const isPublishing = publishSite.isPending;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  if (!isNew && siteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedBlock = selectedIndex !== null ? blocks[selectedIndex] : null;

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground h-8 px-2"
        >
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </Button>

        <div className="h-5 w-px bg-border" />

        <Input
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          className="w-28 sm:max-w-44 h-8 bg-input border-border text-sm font-semibold"
          placeholder="Site title"
          data-ocid="builder.title.input"
        />

        <div className="h-5 w-px bg-border" />

        {/* Undo / Redo */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
            data-ocid="builder.undo.button"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
            data-ocid="builder.redo.button"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Device toggle */}
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
          {[
            { mode: "desktop" as DeviceMode, Icon: Monitor, title: "Desktop" },
            { mode: "tablet" as DeviceMode, Icon: Tablet, title: "Tablet" },
            { mode: "mobile" as DeviceMode, Icon: Smartphone, title: "Mobile" },
          ].map(({ mode, Icon, title }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDevice(mode)}
              title={title}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                device === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`builder.device_${mode}.button`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Block count badge */}
        <Badge
          variant="outline"
          className="text-xs text-muted-foreground border-border hidden sm:flex"
        >
          {blocks.length} {blocks.length === 1 ? "section" : "sections"}
        </Badge>

        {publishedUrl && (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-xs hidden sm:flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> View Live
          </a>
        )}

        <Button
          size="sm"
          variant="outline"
          className="border-border h-8 text-xs"
          onClick={handleSave}
          disabled={isSaving}
          data-ocid="builder.save.button"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          <span className="hidden sm:inline">Save Draft</span>
          <span className="sm:hidden">Save</span>
        </Button>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 h-8 text-xs font-semibold"
          onClick={handlePublish}
          disabled={isPublishing}
          data-ocid="builder.publish.button"
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5 mr-1.5" />
          )}
          Publish
        </Button>
      </div>

      {/* ── 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        {/* Mobile blocks overlay */}
        {showMobileBlocks && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay dismiss
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setShowMobileBlocks(false)}
          />
        )}
        <div
          className={`${
            showMobileBlocks
              ? "fixed inset-y-0 left-0 z-50 md:relative"
              : "hidden md:flex"
          } w-64 md:w-56 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden`}
        >
          {/* Mobile close button for left panel */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-card/90">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Blocks
            </span>
            <button
              type="button"
              onClick={() => setShowMobileBlocks(false)}
              className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Tabs defaultValue="blocks" className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b border-border bg-card/80 shrink-0 h-9 p-0.5 gap-0.5">
              <TabsTrigger
                value="blocks"
                className="flex-1 text-xs h-7 rounded-sm"
                data-ocid="builder.blocks.tab"
              >
                Blocks
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="flex-1 text-xs h-7 rounded-sm"
                data-ocid="builder.templates.tab"
              >
                Templates
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex-1 text-xs h-7 rounded-sm"
                data-ocid="builder.ai.tab"
              >
                <Bot className="w-3 h-3 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>

            {/* Blocks Tab */}
            <TabsContent
              value="blocks"
              className="flex-1 overflow-y-auto m-0 data-[state=inactive]:hidden"
            >
              {/* Theme picker */}
              <div className="p-3 border-b border-border/60">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Theme
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      title={THEME_PRESETS[t].label}
                      onClick={() => setTheme(t)}
                      className="relative w-6 h-6 rounded-full border-2 transition-all"
                      style={{
                        background: THEME_PRESETS[t].colors.swatch,
                        borderColor:
                          theme === t
                            ? THEME_PRESETS[t].colors.accent
                            : "transparent",
                        boxShadow:
                          theme === t
                            ? `0 0 0 2px ${THEME_PRESETS[t].colors.accent}44`
                            : undefined,
                      }}
                      data-ocid={`builder.theme_${t}.button`}
                    >
                      {theme === t && (
                        <CheckCircle
                          className="w-3 h-3 absolute inset-0 m-auto"
                          style={{ color: THEME_PRESETS[t].colors.accent }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {THEME_PRESETS[theme].label} theme
                </p>
              </div>

              {/* Block list by category */}
              <div className="p-3">
                {[
                  "Layout",
                  "Content",
                  "Commerce",
                  "Marketing",
                  "Social",
                  "Media",
                  "Forms",
                ].map((cat) => {
                  const catBlocks = SECTION_TYPES.filter(
                    (s) => s.category === cat,
                  );
                  if (!catBlocks.length) return null;
                  return (
                    <div key={cat} className="mb-3">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {cat}
                      </p>
                      <div className="space-y-1">
                        {catBlocks.map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(type)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-xs text-left group"
                            data-ocid={`builder.add_${type}.button`}
                          >
                            <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            {label}
                            <Plus className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Site info */}
              <div className="border-t border-border/60 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Site Info
                </p>
                <Textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Site description..."
                  rows={3}
                  className="bg-input border-border text-xs resize-none"
                  data-ocid="builder.description.textarea"
                />
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent
              value="templates"
              className="flex-1 overflow-y-auto m-0 data-[state=inactive]:hidden"
            >
              <div className="p-3 space-y-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Starter Templates
                </p>
                {TEMPLATES.map((tpl) => (
                  <motion.div
                    key={tpl.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-3 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-md bg-indigo-500/20 flex items-center justify-center">
                        <tpl.icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {tpl.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2.5">
                      {tpl.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {tpl.blocks.map((bt) => (
                        <span
                          key={bt}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {bt}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="w-full py-1.5 text-xs rounded-md bg-indigo-600/90 text-white hover:bg-indigo-500 transition-colors font-medium"
                      data-ocid={`builder.template_${tpl.name.toLowerCase().replace(/ /g, "_")}.button`}
                    >
                      Use Template
                    </button>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent
              value="ai"
              className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden"
            >
              <AiChatPanel
                blocks={blocks}
                onSetBlocks={(newBlocks) => {
                  pushHistory(newBlocks);
                  setSelectedIndex(0);
                }}
                selectedBlock={selectedBlock}
                onUpdateBlock={updateBlock}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Center Canvas ── */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: pre-existing canvas click handler */}
        <div
          className="flex-1 overflow-y-auto bg-slate-950"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIndex(null);
          }}
        >
          <div
            className="p-6 mx-auto"
            style={{
              maxWidth: canvasMaxWidth,
              transition: "max-width 0.3s ease",
            }}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-80 text-center rounded-xl border-2 border-dashed border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                  <Layout className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-slate-300 font-semibold mb-1">
                  Your canvas is empty
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  Add sections from the left panel or ask the AI to generate a
                  site
                </p>
                <button
                  type="button"
                  onClick={() => addBlock("hero")}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                  data-ocid="builder.empty_state.button"
                >
                  Add Hero Section
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {blocks.map((block, index) => (
                    <motion.div
                      key={`${block.type}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                      className="relative group"
                      data-ocid={`builder.block.${index + 1}`}
                    >
                      <BlockPreview
                        block={block}
                        selected={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                        theme={theme}
                      />

                      {/* Block controls */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          className="w-6 h-6 bg-card/95 rounded flex items-center justify-center text-muted-foreground hover:text-foreground border border-border"
                          onClick={() => moveBlock(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="w-6 h-6 bg-card/95 rounded flex items-center justify-center text-muted-foreground hover:text-foreground border border-border"
                          onClick={() => moveBlock(index, 1)}
                          disabled={index === blocks.length - 1}
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="w-6 h-6 bg-card/95 rounded flex items-center justify-center text-muted-foreground hover:text-indigo-400 border border-border"
                          onClick={() => duplicateBlock(index)}
                          title="Duplicate"
                          data-ocid={`builder.block.${index + 1}.duplicate`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="w-6 h-6 bg-destructive/80 rounded flex items-center justify-center text-white hover:bg-destructive border border-destructive/30"
                          onClick={() => removeBlock(index)}
                          title="Remove section"
                          data-ocid={`builder.block.${index + 1}.delete_button`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {selectedIndex === index && (
                        <Badge className="absolute top-2 left-2 bg-indigo-600/90 text-[10px] z-10">
                          {block.type}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Properties ── */}
        {/* Mobile props overlay */}
        {showMobileProps && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay dismiss
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setShowMobileProps(false)}
          />
        )}
        <div
          className={`${
            showMobileProps
              ? "fixed inset-y-0 right-0 z-50 md:relative"
              : "hidden md:flex"
          } w-64 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden`}
        >
          <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              Properties
            </p>
            {selectedBlock && (
              <Badge
                variant="outline"
                className="text-[10px] border-indigo-500/40 text-indigo-400"
              >
                {selectedBlock.type}
              </Badge>
            )}
            <button
              type="button"
              onClick={() => setShowMobileProps(false)}
              className="md:hidden w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1">
            <PropertiesPanel block={selectedBlock} onChange={updateBlock} />
          </ScrollArea>
        </div>
      </div>

      {/* ── Mobile FABs ── */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 flex justify-between px-6 z-40 pointer-events-none">
        <button
          type="button"
          onClick={() => {
            setShowMobileBlocks((v) => !v);
            setShowMobileProps(false);
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-xl hover:bg-indigo-500 active:scale-95 transition-all"
          data-ocid="builder.mobile_blocks.button"
        >
          <Plus className="w-4 h-4" />
          Blocks
        </button>
        <button
          type="button"
          onClick={() => {
            setShowMobileProps((v) => !v);
            setShowMobileBlocks(false);
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold shadow-xl hover:bg-accent active:scale-95 transition-all"
          data-ocid="builder.mobile_props.button"
        >
          <Settings className="w-4 h-4" />
          Properties
        </button>
      </div>
    </div>
  );
}
