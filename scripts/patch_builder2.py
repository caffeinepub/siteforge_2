#!/usr/bin/env python3
import re

# Restore backup first
import shutil
shutil.copy('src/frontend/src/pages/BuilderPage.tsx.bak', 'src/frontend/src/pages/BuilderPage.tsx')

with open('src/frontend/src/pages/BuilderPage.tsx', 'r') as f:
    content = f.read()

# ============================================================
# 1. Add new type definitions after StatsBlock
# ============================================================

new_types = '''
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
  links: { platform: "twitter" | "instagram" | "linkedin" | "youtube" | "facebook" | "tiktok" | "github"; url: string }[];
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
'''

# Insert before "type Block =" 
content = content.replace(
    'type Block =\n  | HeroBlock',
    new_types + 'type Block =\n  | HeroBlock'
)

# ============================================================
# 2. Add new blocks to Block union type
# ============================================================
content = content.replace(
    '  | TeamBlock\n  | StatsBlock;',
    '  | TeamBlock\n  | StatsBlock\n  | TextLabelBlock\n  | TextButtonBlock\n  | ImageBlock\n  | ImageButtonBlock\n  | VideoEmbedBlock\n  | SpacerBlock\n  | QuoteBlock\n  | SocialLinksBlock\n  | BannerBlock\n  | MapEmbedBlock\n  | CodeSnippetBlock\n  | CountdownBlock\n  | RichTextBlock\n  | IconTextBlock\n  | AccordionItemBlock;'
)

# ============================================================
# 3. Update GalleryBlock type to have optional src
# ============================================================
content = content.replace(
    'type GalleryBlock = {\n  type: "gallery";\n  heading: string;\n  items: { color: string; caption: string }[];\n};',
    'type GalleryBlock = {\n  type: "gallery";\n  heading: string;\n  items: { color: string; caption: string; src?: string }[];\n};'
)

# Update TeamBlock type to add optional avatarSrc
content = content.replace(
    'type TeamBlock = {\n  type: "team";\n  heading: string;\n  members: { name: string; role: string; initials: string }[];\n};',
    'type TeamBlock = {\n  type: "team";\n  heading: string;\n  members: { name: string; role: string; initials: string; avatarSrc?: string }[];\n};'
)

# ============================================================
# 4. Add new entries to SECTION_TYPES - replace the whole array
# ============================================================
old_section_types = '''const SECTION_TYPES: {
  type: Block["type"];
  icon: React.ElementType;
  label: string;
  category: string;
}[] = [
  { type: "navbar", icon: AlignJustify, label: "Navbar", category: "Layout" },
  { type: "hero", icon: Layout, label: "Hero", category: "Layout" },
  { type: "features", icon: Star, label: "Features", category: "Content" },
  { type: "pricing", icon: DollarSign, label: "Pricing", category: "Commerce" },
  {
    type: "testimonials",
    icon: MessageSquare,
    label: "Testimonials",
    category: "Social",
  },
  { type: "gallery", icon: Image, label: "Gallery", category: "Media" },
  { type: "contact", icon: Mail, label: "Contact", category: "Forms" },
  { type: "cta", icon: Zap, label: "CTA Banner", category: "Marketing" },
  { type: "faq", icon: MessageSquare, label: "FAQ", category: "Content" },
  { type: "team", icon: Users, label: "Team", category: "Content" },
  { type: "stats", icon: TrendingUp, label: "Stats", category: "Content" },
  { type: "footer", icon: AlignJustify, label: "Footer", category: "Layout" },
];'''

new_section_types = '''const SECTION_TYPES: {
  type: Block["type"];
  icon: React.ElementType;
  label: string;
  category: string;
}[] = [
  { type: "navbar", icon: AlignJustify, label: "Navbar", category: "Layout" },
  { type: "hero", icon: Layout, label: "Hero", category: "Layout" },
  { type: "footer", icon: AlignJustify, label: "Footer", category: "Layout" },
  { type: "spacer", icon: AlignJustify, label: "Spacer / Divider", category: "Layout" },
  { type: "text-label", icon: Layout, label: "Text Label", category: "Text" },
  { type: "text-button", icon: Zap, label: "Text Button", category: "Text" },
  { type: "rich-text", icon: AlignJustify, label: "Rich Text", category: "Text" },
  { type: "code-snippet", icon: TrendingUp, label: "Code Snippet", category: "Text" },
  { type: "banner", icon: Star, label: "Banner / Alert", category: "Text" },
  { type: "image-block", icon: Image, label: "Image", category: "Media" },
  { type: "image-button", icon: Image, label: "Image Button", category: "Media" },
  { type: "video-embed", icon: Globe, label: "Video Embed", category: "Media" },
  { type: "gallery", icon: Image, label: "Gallery", category: "Media" },
  { type: "map-embed", icon: Globe, label: "Map Embed", category: "Media" },
  { type: "accordion-item", icon: ChevronDown, label: "Accordion", category: "Interactive" },
  { type: "countdown", icon: TrendingUp, label: "Countdown", category: "Interactive" },
  { type: "quote", icon: MessageSquare, label: "Pull Quote", category: "Interactive" },
  { type: "features", icon: Star, label: "Features", category: "Content" },
  { type: "cta", icon: Zap, label: "CTA Banner", category: "Content" },
  { type: "faq", icon: MessageSquare, label: "FAQ", category: "Content" },
  { type: "icon-text", icon: Star, label: "Icon + Text", category: "Content" },
  { type: "team", icon: Users, label: "Team", category: "People & Social" },
  { type: "testimonials", icon: MessageSquare, label: "Testimonials", category: "People & Social" },
  { type: "social-links", icon: Globe, label: "Social Links", category: "People & Social" },
  { type: "pricing", icon: DollarSign, label: "Pricing", category: "Commerce" },
  { type: "stats", icon: TrendingUp, label: "Stats", category: "Commerce" },
  { type: "contact", icon: Mail, label: "Contact", category: "Commerce" },
];'''

content = content.replace(old_section_types, new_section_types)

# ============================================================
# 5. Add image upload helpers before BlockPreview
# ============================================================
image_helpers = '''
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
        \U0001f4f7 {label}
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
          <img src={currentSrc} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onUpload(\'\')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
          >
            \u00d7
          </button>
        </div>
      )}
    </div>
  );
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return \'\';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\\.\\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "\u{1d54f}",
  instagram: "\u{1f4f7}",
  linkedin: "in",
  youtube: "\u{1f3a5}",
  facebook: "f",
  tiktok: "\u266b",
  github: "\u2665",
};

'''

content = content.replace(
    '// ============================================================\n// CANVAS BLOCK PREVIEWS',
    image_helpers + '// ============================================================\n// CANVAS BLOCK PREVIEWS'
)

# ============================================================
# 6. Add new createBlock cases before stats
# ============================================================
new_cases = '''    case "text-label":
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
        message: "\U0001f389 Special offer: Get 20% off today only!",
        icon: "\U0001f4e2",
        bgColor: "#6366f1",
        textColor: "#ffffff",
        dismissible: true,
      };
    case "map-embed":
      return {
        type: "map-embed",
        address: "New York, NY",
        embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583091352!2d-74.11976397304606!3d40.69766374859258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890",
        height: 300,
      };
    case "code-snippet":
      return {
        type: "code-snippet",
        code: `function hello() {\n  console.log("Hello, World!");\n}`,
        language: "javascript",
        showLineNumbers: true,
      };
    case "countdown":
      return {
        type: "countdown",
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        label: "Launching in",
        bgColor: "#0f172a",
        textColor: "#6366f1",
      };
    case "rich-text":
      return {
        type: "rich-text",
        html: "<p>Start writing your content here. Use the toolbar above to <strong>format</strong> your text.</p>",
      };
    case "icon-text":
      return {
        type: "icon-text",
        icon: "\u2728",
        heading: "Our Mission",
        description: "We build tools that help people create beautiful things on the web.",
        align: "center",
      };
    case "accordion-item":
      return {
        type: "accordion-item",
        question: "What is your question?",
        answer: "Your detailed answer goes here.",
        defaultOpen: false,
      };
'''

content = content.replace(
    '    case "stats":\n      return {\n        type: "stats",',
    new_cases + '    case "stats":\n      return {\n        type: "stats",'
)

# ============================================================
# 7. Update gallery preview to support src
# ============================================================
# Find the gallery item div in BlockPreview and update it
old_gallery_item = '''              style={{
                borderRadius: 8,
                height: 64,
                background: item.color,
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
                }}
              >
                {item.caption}
              </span>'''

new_gallery_item = '''              style={{
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
              </span>'''

content = content.replace(old_gallery_item, new_gallery_item)

# ============================================================
# 8. Update team preview to support avatarSrc
# ============================================================
old_team_member = '''            <div key={i} style={{ textAlign: "center", padding: 12 }}>
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
              </div>'''

new_team_member = '''            <div key={i} style={{ textAlign: "center", padding: 12 }}>
              {member.avatarSrc ? (
                <img src={member.avatarSrc} alt={member.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px", display: "block" }} />
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
              )}'''

content = content.replace(old_team_member, new_team_member)

# ============================================================
# 9. Update gallery PropertiesPanel to include image upload
# ============================================================
old_gallery_prop = '''          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
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
          </div>'''

new_gallery_prop = '''          <div key={i} className="border border-border rounded-lg p-2 space-y-2">
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
          </div>'''

content = content.replace(old_gallery_prop, new_gallery_prop)

# ============================================================
# 10. Update team PropertiesPanel to include avatar upload
# ============================================================
old_team_prop = '''            <Input
              value={member.initials}
              onChange={(e) => {
                const members = [...block.members];
                members[i] = { ...members[i], initials: e.target.value };
                onChange({ ...block, members });
              }}
              placeholder="Initials (e.g. AJ)"
              className="bg-input border-border text-sm h-7"
            />'''

new_team_prop = '''            <Input
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
            />'''

content = content.replace(old_team_prop, new_team_prop)

# ============================================================
# 11. Add new BlockPreview cases and new PropertiesPanel cases
# ============================================================

new_block_previews = '''
  if (block.type === "text-label") {
    const TagName = block.tag;
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
        {TagName === "h1" && <h1 style={{ color: block.color, fontSize: block.fontSize, fontWeight: 800, margin: 0 }}>{block.content}</h1>}
        {TagName === "h2" && <h2 style={{ color: block.color, fontSize: block.fontSize, fontWeight: 700, margin: 0 }}>{block.content}</h2>}
        {TagName === "h3" && <h3 style={{ color: block.color, fontSize: block.fontSize, fontWeight: 600, margin: 0 }}>{block.content}</h3>}
        {TagName === "p" && <p style={{ color: block.color, fontSize: block.fontSize, margin: 0 }}>{block.content}</p>}
      </div>
    );
  }

  if (block.type === "text-button") {
    const padMap = { sm: "6px 16px", md: "10px 24px", lg: "14px 32px" };
    const btnStyle: React.CSSProperties =
      block.variant === "solid"
        ? { background: block.bgColor, color: block.textColor, border: "none" }
        : block.variant === "outline"
          ? { background: "transparent", color: block.bgColor, border: `2px solid ${block.bgColor}` }
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
          style={{ ...btnStyle, padding: padMap[block.size], borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          {block.label}
        </button>
      </div>
    );
  }

  if (block.type === "image-block") {
    const widthMap = { full: "100%", large: "80%", medium: "55%", small: "30%" };
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
        <div style={{ display: "inline-block", width: widthMap[block.width], maxWidth: "100%" }}>
          {block.src ? (
            <img
              src={block.src}
              alt={block.alt}
              style={{ width: "100%", borderRadius: block.borderRadius, display: "block" }}
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
              <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>\U0001f5bc\ufe0f Upload an image</span>
            </div>
          )}
          {block.caption && (
            <p style={{ color: t.text, opacity: 0.6, fontSize: 12, marginTop: 6, textAlign: "center" }}>
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
              alt="Image button"
              style={{ width: "100%", borderRadius: block.borderRadius, display: "block" }}
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
              <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>\U0001f5bc\ufe0f Upload a clickable image</span>
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
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
            <iframe
              src={embedUrl}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
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
            <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>\U0001f3ac Paste YouTube or Vimeo URL in properties</span>
          </div>
        )}
        {block.caption && (
          <p style={{ color: t.text, opacity: 0.6, fontSize: 12, marginTop: 8, textAlign: "center" }}>{block.caption}</p>
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
        <div style={{ height: block.height, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {block.showLine ? (
            <hr style={{ width: "100%", border: "none", borderTop: `1px ${block.lineStyle} ${block.lineColor}` }} />
          ) : (
            selected && <span style={{ color: t.text, opacity: 0.3, fontSize: 11 }}>Spacer ({block.height}px)</span>
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
        <div style={{ fontSize: 32, color: t.accent, marginBottom: 12, lineHeight: 1 }}>\u201c</div>
        <p style={{ color: "#ffffff", fontSize: 16, fontStyle: "italic", marginBottom: 20, lineHeight: 1.6 }}>
          {block.quoteText}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {block.avatarSrc ? (
            <img
              src={block.avatarSrc}
              alt={block.author}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
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
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13 }}>{block.author}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{block.authorRole}</div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "social-links") {
    const sizeMap = { sm: 32, md: 40, lg: 52 };
    const sz = sizeMap[block.size];
    const justifyMap = { left: "flex-start", center: "center", right: "flex-end" };
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
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: justifyMap[block.align] }}>
          {block.links.map((link, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern
            <div
              key={i}
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
              {(SOCIAL_ICONS[link.platform] ?? link.platform.charAt(0)).slice(0, 2)}
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
        <span style={{ color: block.textColor, fontWeight: 500, fontSize: 14 }}>{block.message}</span>
        {block.dismissible && (
          <span style={{ color: block.textColor, opacity: 0.6, fontSize: 18, cursor: "pointer", marginLeft: 8 }}>\u00d7</span>
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
            <span style={{ color: t.text, opacity: 0.4, fontSize: 13 }}>\U0001f4cd Enter Google Maps embed URL in properties</span>
          </div>
        )}
      </div>
    );
  }

  if (block.type === "code-snippet") {
    const lines = block.code.split("\\n");
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace" }}>{block.language}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
            ))}
          </div>
        </div>
        <pre style={{ margin: 0, overflowX: "auto" }}>
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern
            <div key={i} style={{ display: "flex", gap: 12 }}>
              {block.showLineNumbers && (
                <span style={{ color: "#8b949e", fontFamily: "monospace", fontSize: 12, userSelect: "none", minWidth: 20, textAlign: "right" }}>
                  {i + 1}
                </span>
              )}
              <code style={{ color: "#c9d1d9", fontFamily: "monospace", fontSize: 12, whiteSpace: "pre" }}>{line || " "}</code>
            </div>
          ))}
        </pre>
      </div>
    );
  }

  if (block.type === "countdown") {
    return <CountdownPreview block={block} selected={selected} onClick={onClick} theme={theme} />;
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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: user-controlled rich text content */}
        <div dangerouslySetInnerHTML={{ __html: block.html }} style={{ fontSize: 14, lineHeight: 1.7 }} />
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
        <h3 style={{ color: t.text, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{block.heading}</h3>
        <p style={{ color: t.text, opacity: 0.7, fontSize: 14 }}>{block.description}</p>
      </div>
    );
  }

  if (block.type === "accordion-item") {
    return <AccordionPreview block={block} selected={selected} onClick={onClick} theme={theme} />;
  }

'''

# New PropertiesPanel cases
new_props_cases = '''
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.tag === tagOpt ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Font Size: {block.fontSize}px</Label>
          <input
            type="range"
            min={12}
            max={96}
            value={block.fontSize}
            onChange={(e) => onChange({ ...block, fontSize: Number(e.target.value) })}
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
            <span className="text-muted-foreground text-xs font-mono">{block.color}</span>
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.size === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.variant === v ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.bgColor}
              onChange={(e) => onChange({ ...block, bgColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">{block.bgColor}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.textColor}
              onChange={(e) => onChange({ ...block, textColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-muted-foreground text-xs font-mono">{block.textColor}</span>
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.width === w ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Radius: {block.borderRadius}px</Label>
          <input
            type="range"
            min={0}
            max={48}
            value={block.borderRadius}
            onChange={(e) => onChange({ ...block, borderRadius: Number(e.target.value) })}
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
            onChange={(e) => onChange({ ...block, overlayText: e.target.value })}
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
                className={`px-2 py-1 text-xs rounded border ${
                  block.width === w ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Radius: {block.borderRadius}px</Label>
          <input
            type="range"
            min={0}
            max={48}
            value={block.borderRadius}
            onChange={(e) => onChange({ ...block, borderRadius: Number(e.target.value) })}
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
          <Label className="text-xs text-muted-foreground">YouTube / Vimeo URL</Label>
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
        <h3 className="font-semibold text-foreground text-sm">Spacer / Divider</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Height: {block.height}px</Label>
          <input
            type="range"
            min={8}
            max={200}
            value={block.height}
            onChange={(e) => onChange({ ...block, height: Number(e.target.value) })}
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
          <Label htmlFor="spacer-line" className="text-xs text-muted-foreground">Show divider line</Label>
        </div>
        {block.showLine && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Line Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={block.lineColor}
                  onChange={(e) => onChange({ ...block, lineColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                />
                <span className="text-muted-foreground text-xs font-mono">{block.lineColor}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Line Style</Label>
              <div className="flex gap-1">
                {(["solid", "dashed", "dotted"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...block, lineStyle: s })}
                    className={`px-2 py-1 text-xs rounded border ${
                      block.lineStyle === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"
                    }`}
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
          <Input value={block.author} onChange={(e) => onChange({ ...block, author: e.target.value })} className="bg-input border-border text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Author Role</Label>
          <Input value={block.authorRole} onChange={(e) => onChange({ ...block, authorRole: e.target.value })} className="bg-input border-border text-sm h-8" />
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
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={block.bgColor} onChange={(e) => onChange({ ...block, bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
            <span className="text-muted-foreground text-xs font-mono">{block.bgColor}</span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "social-links") {
    const PLATFORMS = ["twitter", "instagram", "linkedin", "youtube", "facebook", "tiktok", "github"] as const;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Social Links</h3>
        {block.links.map((link, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: pre-existing pattern
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground capitalize">{link.platform}</p>
              <button
                type="button"
                onClick={() => onChange({ ...block, links: block.links.filter((_, idx) => idx !== i) })}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <select
              value={link.platform}
              onChange={(e) => {
                const links = [...block.links];
                links[i] = { ...links[i], platform: e.target.value as typeof link.platform };
                onChange({ ...block, links });
              }}
              className="w-full bg-input border border-border rounded text-sm p-1 text-foreground"
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
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
          onClick={() => onChange({ ...block, links: [...block.links, { platform: "twitter", url: "" }] })}
          className="w-full py-1.5 text-xs rounded border border-dashed border-border text-muted-foreground hover:border-indigo-500 hover:text-indigo-400"
        >
          + Add Link
        </button>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button key={a} type="button" onClick={() => onChange({ ...block, align: a })} className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Icon Size</Label>
          <div className="flex gap-1">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button key={s} type="button" onClick={() => onChange({ ...block, size: s })} className={`px-2 py-1 text-xs rounded border ${block.size === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}>{s.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "banner") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Banner / Alert</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Message</Label>
          <Textarea value={block.message} onChange={(e) => onChange({ ...block, message: e.target.value })} className="bg-input border-border text-sm resize-none" rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Icon (emoji)</Label>
          <Input value={block.icon} onChange={(e) => onChange({ ...block, icon: e.target.value })} placeholder="e.g. \U0001f389" className="bg-input border-border text-sm h-8 w-20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={block.bgColor} onChange={(e) => onChange({ ...block, bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
            <span className="text-muted-foreground text-xs font-mono">{block.bgColor}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={block.textColor} onChange={(e) => onChange({ ...block, textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
            <span className="text-muted-foreground text-xs font-mono">{block.textColor}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={block.dismissible} onChange={(e) => onChange({ ...block, dismissible: e.target.checked })} id="banner-dismiss" />
          <Label htmlFor="banner-dismiss" className="text-xs text-muted-foreground">Show dismiss button</Label>
        </div>
      </div>
    );
  }

  if (block.type === "map-embed") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Map Embed</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Google Maps Embed URL</Label>
          <Textarea
            value={block.embedUrl}
            onChange={(e) => onChange({ ...block, embedUrl: e.target.value })}
            placeholder="Paste Google Maps embed URL here"
            className="bg-input border-border text-sm resize-none"
            rows={3}
          />
          <p className="text-[10px] text-muted-foreground">Google Maps &rarr; Share &rarr; Embed a map &rarr; copy src URL</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Height: {block.height}px</Label>
          <input type="range" min={150} max={600} value={block.height} onChange={(e) => onChange({ ...block, height: Number(e.target.value) })} className="w-full" />
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
            {["javascript", "typescript", "python", "css", "html", "bash", "json", "sql", "rust", "go"].map((l) => (
              <option key={l} value={l}>{l}</option>
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
          <input type="checkbox" checked={block.showLineNumbers} onChange={(e) => onChange({ ...block, showLineNumbers: e.target.checked })} id="code-lines" />
          <Label htmlFor="code-lines" className="text-xs text-muted-foreground">Show line numbers</Label>
        </div>
      </div>
    );
  }

  if (block.type === "countdown") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Countdown Timer</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} className="bg-input border-border text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Target Date &amp; Time</Label>
          <Input type="datetime-local" value={block.targetDate} onChange={(e) => onChange({ ...block, targetDate: e.target.value })} className="bg-input border-border text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={block.bgColor} onChange={(e) => onChange({ ...block, bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
            <span className="text-muted-foreground text-xs font-mono">{block.bgColor}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Accent / Number Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={block.textColor} onChange={(e) => onChange({ ...block, textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
            <span className="text-muted-foreground text-xs font-mono">{block.textColor}</span>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "rich-text") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Rich Text / HTML</h3>
        <div className="flex gap-1 flex-wrap">
          {[
            { label: "B", insert: "<strong>bold text</strong>" },
            { label: "I", insert: "<em>italic text</em>" },
            { label: "U", insert: "<u>underlined text</u>" },
            { label: "Link", insert: `<a href="#">link text</a>` },
            { label: "UL", insert: "<ul>\\n  <li>Item 1</li>\\n  <li>Item 2</li>\\n</ul>" },
          ].map(({ label, insert }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ ...block, html: block.html + " " + insert })}
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
          <p className="text-[10px] text-muted-foreground">Supports HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;h1&gt;-&lt;h6&gt;, etc.</p>
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
          <Input value={block.icon} onChange={(e) => onChange({ ...block, icon: e.target.value })} placeholder="e.g. \u2728" className="bg-input border-border text-sm h-8 w-20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Heading</Label>
          <Input value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="bg-input border-border text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} className="bg-input border-border text-sm resize-none" rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <div className="flex gap-1">
            {(["left", "center"] as const).map((a) => (
              <button key={a} type="button" onClick={() => onChange({ ...block, align: a })} className={`px-2 py-1 text-xs rounded border ${block.align === a ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground"}`}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "accordion-item") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Accordion Item</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Input value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} className="bg-input border-border text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Textarea value={block.answer} onChange={(e) => onChange({ ...block, answer: e.target.value })} className="bg-input border-border text-sm resize-none" rows={3} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={block.defaultOpen} onChange={(e) => onChange({ ...block, defaultOpen: e.target.checked })} id="acc-open" />
          <Label htmlFor="acc-open" className="text-xs text-muted-foreground">Open by default</Label>
        </div>
      </div>
    );
  }

'''

# Insert new BlockPreview cases before the final "return null;" in BlockPreview
blockpreview_end = '  return null;\n}\n\n// ============================================================\n// PROPERTIES PANEL'
content = content.replace(blockpreview_end, new_block_previews + blockpreview_end)

# Add countdown and accordion sub-components between BlockPreview and PropertiesPanel
props_marker = '// ============================================================\n// PROPERTIES PANEL'
countdown_accordion = '''// ============================================================
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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
      <p style={{ color: t.text, opacity: 0.7, fontSize: 14, marginBottom: 20 }}>{block.label}</p>
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
      style={{ background: t.card, border: selected ? "2px solid #6366f1" : "2px solid transparent" }}
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
        <span style={{ color: t.text, fontWeight: 600, fontSize: 14, textAlign: "left" }}>{block.question}</span>
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
          \u25be
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", color: t.text, fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>
          {block.answer}
        </div>
      )}
    </div>
  );
}

'''

content = content.replace(props_marker, countdown_accordion + props_marker, 1)

# Insert new PropertiesPanel cases before the final "return null;" in PropertiesPanel
props_end = '  return null;\n}\n\n// ============================================================\n// AI ASSISTANT ENGINE'
content = content.replace(props_end, new_props_cases + props_end)

with open('src/frontend/src/pages/BuilderPage.tsx', 'w') as f:
    f.write(content)

# Verify key replacements happened
with open('src/frontend/src/pages/BuilderPage.tsx', 'r') as f:
    c = f.read()

print('text-label type:', 'text-label' in c)
print('CountdownPreview:', 'CountdownPreview' in c)
print('AccordionPreview:', 'AccordionPreview' in c)
print('ImageUploadButton:', 'ImageUploadButton' in c)
print('readFileAsBase64:', 'readFileAsBase64' in c)
print('social-links case:', 'case "social-links"' in c)
print('image-block in Block union:', '| ImageBlock' in c)
print('Line count:', c.count('\\n'))
