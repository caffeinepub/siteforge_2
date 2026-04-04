// NEW TYPE DEFINITIONS - INSERT BEFORE type Block =
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
