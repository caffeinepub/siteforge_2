# SiteForge - Builder Expansion & Bank Transaction Enhancements

## Current State
- Builder supports 27 block types across 7 categories (Layout, Text, Media, Interactive, Content, People & Social, Commerce)
- TransactionDetailModal shows basic fields: Transaction ID, Date, Price, Site ID, Status, Bill of Sale
- Dashboard Transactions tab shows a simple table: Site, Role, Price, Status, Date, Action (view details)
- ChatTab has PhonePe-style payment flow with PIN verification and UPI deep links

## Requested Changes (Diff)

### Add
**Builder - New Block Types:**
1. `newsletter-signup` - Email signup form with heading, subtext, and submit button (Commerce category)
2. `progress-bar` - Skill/progress bar component with multiple items and percentages (Content category)
3. `timeline` - Vertical timeline/history section with date, title, and description items (Content category)
4. `before-after` - Side-by-side comparison block (before/after image or text) (Interactive category)
5. `rating-review` - Star rating display with review summary and score (People & Social)
6. `product-card` - Product card grid with image, name, price, and add-to-cart button (Commerce)
7. `announcement-bar` - Top-of-page sticky marquee/announcement strip (Layout)
8. `columns-text` - Multi-column text layout (2 or 3 columns) (Layout)
9. `table-block` - Simple HTML table with header row and data rows (Content)
10. `embed-html` - Custom HTML/iFrame embed for third-party widgets (Interactive)
11. `audio-player` - Audio embed with a SoundCloud/direct URL player (Media)
12. `portfolio-grid` - Masonry/grid portfolio with category filter chips (Media)

**Bank Transaction Enhancements:**
1. **Transaction Detail Modal** - Upgrade with:
   - INR amount display alongside USD
   - Payment method badge (PhonePe, Stripe, ICP, PayPal, FamPay)
   - Transaction timeline/steps (Initiated → Payment Received → Transfer → Completed)
   - Copy Transaction ID button
   - "Download Receipt" button (generates printable HTML receipt)
   - QR code placeholder for transaction reference
   - Animated status indicators
2. **Dashboard Transactions Tab** - Enhance with:
   - Stats row: Total spent, Total earned, Total transactions count
   - Filter bar: All / Purchases / Sales / Pending / Completed tabs
   - Search bar to filter by site name or transaction ID
   - INR column alongside USD
   - Payment method icon in each row
   - Export to CSV button
   - Empty state with illustration and CTA to browse marketplace
3. **Transaction Receipt Component** - New printable receipt dialog:
   - SiteForge branded header
   - All transaction fields
   - Digital Bill of Sale text
   - Print/Download PDF button

### Modify
- `BuilderPage.tsx` - Add 12 new block types to SECTION_TYPES, createBlock factory, BlockPreview renderers, and Properties panels
- `TransactionDetailModal.tsx` - Full redesign with timeline, INR, copy button, receipt download
- `DashboardPage.tsx` - Enhanced transactions tab with stats, filters, search, export

### Remove
- Nothing removed

## Implementation Plan
1. Add 12 new block type TypeScript interfaces in BuilderPage.tsx
2. Register all 12 in SECTION_TYPES constant with proper categories
3. Add createBlock() factory cases for all 12
4. Add BlockPreview canvas renderers for all 12
5. Add Properties panel editors for all 12
6. Redesign TransactionDetailModal with timeline, INR, copy button, receipt download
7. Enhance DashboardPage Transactions tab with stats row, filter tabs, search, export CSV
8. Validate build
