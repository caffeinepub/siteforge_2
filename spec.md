# SiteForge - Enhanced Site Builder

## Current State
The site builder (BuilderPage.tsx) is a block-based drag-and-drop editor with:
- Left panel: section library (Hero, Features, Pricing, Testimonials, Footer blocks)
- Center: canvas preview of blocks
- Right panel: properties editor for selected block
- Toolbar: site title, save draft, publish
- 5 block types with editable properties

## Requested Changes (Diff)

### Add
- **AI Assistant Panel**: A chat-style AI sidebar where users can describe what they want (e.g. "make me a portfolio site for a designer") and the AI generates/modifies blocks accordingly. Uses a simulated AI response (since no external API is available) with smart template suggestions based on keywords in the prompt.
- **More Block Types**:
  - `navbar` - Navigation bar with logo + links
  - `gallery` - Image grid section (placeholder images)
  - `contact` - Contact form with name/email/message fields
  - `cta` - Call-to-action banner with headline and button
  - `faq` - Accordion-style FAQ section
  - `team` - Team member cards with name, role, avatar
  - `stats` - Statistics row (number + label cards)
- **Theme / Color Palette Picker**: Global color theme selector in the left panel (presets: Dark, Light, Ocean, Forest, Sunset). Applies a color scheme to the entire canvas.
- **Undo/Redo**: History stack so users can undo/redo block additions, removals, reorders, and property changes.
- **Canvas Zoom / Device Preview**: Toolbar toggle to preview the site in Desktop, Tablet, and Mobile widths.
- **Duplicate Block**: A duplicate icon in the block controls (alongside move up/down and delete).
- **Section Templates**: Pre-built full page templates users can insert with one click (e.g. "SaaS Landing", "Portfolio", "Agency").
- **AI Generate Site button**: A prominent button that opens the AI assistant with a prompt to generate a full site from scratch.

### Modify
- Left panel: reorganize into tabs -- "Blocks", "Templates", "AI" -- instead of one flat list.
- Toolbar: add device preview toggle buttons (Desktop/Tablet/Mobile) and undo/redo buttons.
- Canvas: respect the selected device width for the preview area.

### Remove
- Nothing removed, all existing functionality preserved.

## Implementation Plan
1. Expand Block type union with 7 new block types and their createBlock defaults.
2. Expand BlockPreview to render all 7 new block types.
3. Expand PropertiesPanel to edit all 7 new block types.
4. Add global theme state (5 presets) applied to canvas background/text colors.
5. Add undo/redo history using a history stack (useReducer or useState stack).
6. Add device preview state (desktop/tablet/mobile) controlling canvas max-width.
7. Add duplicate block function.
8. Reorganize left panel into 3 tabs: Blocks (section library), Templates (full-page presets), AI (chat assistant).
9. Build AI assistant tab: text input, send button, chat history display, smart keyword matching to auto-generate blocks.
10. Add Section Templates: 3 presets (SaaS Landing, Portfolio, Agency) that populate the canvas.
11. Wire everything together in BuilderContent.
