# Design Guidelines: Offline-First POS Web Application

## Design Approach

**Selected Approach:** Design System - Material Design 3 / Fluent Design Hybrid
**Justification:** POS systems require information density, rapid interaction patterns, and consistent component behavior. Drawing inspiration from Square POS and Toast POS for commercial-grade reliability while maintaining modern web standards.

**Key Design Principles:**
1. Speed-First Interaction: Every action completes in ≤2 taps/clicks
2. Information Clarity: Critical data always visible without scrolling
3. Touch-Optimized: All interactive elements ≥44px minimum for mobile
4. Spatial Consistency: Predictable layouts reduce cognitive load during high-pressure transactions

---

## Typography System

**Font Family:** 
- Primary: `Inter` (Google Fonts) - excellent readability for UI text and numbers
- Monospace: `JetBrains Mono` - for invoice numbers, prices, calculations

**Type Scale:**
- Hero Numbers (Dashboard totals): `text-4xl font-bold` (36px)
- Section Headers: `text-2xl font-semibold` (24px)
- Card Titles/Product Names: `text-base font-medium` (16px)
- Body Text: `text-sm` (14px)
- Helper Text/Timestamps: `text-xs` (12px)
- Price Display: `text-lg font-semibold tabular-nums` (18px)

**Number Formatting:** All monetary values use tabular-nums class for aligned columns

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: `p-4` (16px) standard, `p-6` (24px) for cards
- Section spacing: `gap-4` between items, `gap-6` between sections
- Page margins: `p-6` on mobile, `p-8` on desktop
- Grid gaps: `gap-4` for product grids, `gap-2` for compact lists

**Grid Systems:**
- Product Grid (Desktop): `grid grid-cols-4 xl:grid-cols-5 gap-4`
- Product Grid (Tablet): `grid-cols-3`
- Product Grid (Mobile): `grid-cols-2`
- Dashboard Stats: `grid-cols-2 lg:grid-cols-4 gap-4`

**Layout Breakpoints:**
- Mobile: base (< 768px)
- Tablet: md (768px+)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

---

## Core Component Library

### 1. Unlock Screen (Initial Entry Point)
**Structure:**
- Centered modal pattern: `max-w-md mx-auto` vertically centered in viewport
- Logo/app icon at top (80x80px)
- App title: `text-3xl font-bold mb-2`
- Subtitle: `text-sm mb-8`
- Password input: `w-full h-12 px-4 text-base border-2 rounded-lg`
- Unlock button: `w-full h-12 text-base font-semibold rounded-lg mt-4`
- Minimalist, focused design with no distractions

### 2. Navigation Structure

**Desktop Header (Fixed Top):**
- Height: `h-16` (64px)
- Layout: `flex items-center justify-between px-8`
- Left: App logo + shop name (`text-xl font-semibold`)
- Center: Navigation tabs (Dashboard, Billing, Products, Categories, Settings)
- Right: Current date/time display
- Navigation tabs: `px-6 py-2 rounded-t-lg` with underline indicator for active state

**Mobile Navigation:**
- Fixed bottom tab bar: `h-16 grid grid-cols-5`
- Icons with labels below: Icon (24x24px), label (`text-xs`)
- Tabs: Dashboard, Billing, Products, Categories, Settings

### 3. Product Card (Critical Component)
**Dimensions:**
- Fixed size: `h-44` (176px) maintains grid consistency
- Aspect ratio: ~1:1.1 (slightly taller than wide)

**Structure:**
```
┌─────────────────┐
│  Product Name   │  ← p-3, text-base font-medium, truncate after 2 lines
│  (2 lines max)  │
│                 │
│  ₹999           │  ← text-lg font-semibold, absolute bottom-left
│            [+]  │  ← Add button, absolute bottom-right, h-8 w-8
└─────────────────┘
     [Badge: 3]      ← Absolute position top-right -mt-2 -mr-2, does NOT affect card height
```

**Add Count Badge:**
- Position: `absolute -top-2 -right-2`
- Size: `h-6 w-6 rounded-full flex items-center justify-center`
- Typography: `text-xs font-bold`
- Badge floats OUTSIDE card boundaries (negative margins prevent card resize)

**States:**
- Default: Subtle border, rounded corners `rounded-xl`
- Tap/Click: Brief scale animation `active:scale-95`

### 4. Billing Interface

**Desktop Layout (Split Screen):**
- Left panel (60%): Product grid with search bar at top
- Right panel (40%): Fixed cart sidebar
- Divider: 1px vertical line
- Search bar: `h-12 w-full px-4 rounded-lg mb-6`

**Mobile Layout:**
- Bottom tabs: "Products" and "Cart" (2 tabs only)
- Products tab: Full-screen grid with search bar
- Cart tab: Full-screen cart view
- Floating checkout button when on Products tab: `fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg`

**Cart Panel Structure:**
- Header: "Cart" + item count badge
- Scrollable item list: `space-y-3`
- Each cart item: Horizontal layout with name, quantity controls (-, number, +), subtotal, remove icon
- Footer (fixed bottom): Subtotal, discount input, GST line, total (prominent), checkout button

### 5. Dashboard

**Layout:**
- Top: Date filter tabs (Today, Yesterday, This Month, This Year, Custom)
- Stats cards: `grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8`
- Each stat card: Icon, label, large number, trend indicator
- Bills table: Sortable columns (Token, Date/Time, Total, Actions)
- Table row click: Opens invoice modal

**Stats Card:**
```
┌──────────────────────┐
│ 📊 Total Sales       │  ← Icon + label, text-sm
│ ₹45,230              │  ← Number, text-3xl font-bold tabular-nums
│ +12% from yesterday  │  ← Trend, text-xs
└──────────────────────┘
```

### 6. Product/Category Management

**List View:**
- Table layout with alternating row backgrounds
- Columns: Name, Category (products only), Price, Actions
- Action buttons: Edit (icon), Delete (icon)
- Add button: `fixed bottom-6 right-6 h-14 w-14 rounded-full` on mobile, top-right on desktop

**Add/Edit Modal:**
- Centered overlay: `max-w-lg`
- Form fields: Full-width inputs with labels above
- Input height: `h-12`
- Spacing: `space-y-4` between fields
- Footer: Cancel (left), Save (right, prominent)

### 7. Settings Panel

**Structure:**
- Vertical form layout: `max-w-2xl mx-auto space-y-8`
- Section groupings with headers (`text-lg font-semibold mb-4`)
- Groups: Shop Info, GST Configuration, Display Options, Print Settings, Data Management

**Form Elements:**
- Text inputs: `h-12 w-full px-4 rounded-lg border-2`
- Toggle switches: Modern iOS-style, `h-6 w-11 rounded-full`
- Select dropdowns: `h-12 w-full px-4 rounded-lg border-2`
- Buttons (Export/Import/Wipe): Full-width on mobile, inline on desktop

**Data Management Section:**
- Export Backup: Primary button with download icon
- Import Backup: Secondary button with upload icon
- Wipe Data: Danger zone (separated), destructive button with confirmation

### 8. Invoice Print Layout

**A4 Layout:**
- Max-width: `max-w-3xl mx-auto`
- Header: Shop name (text-2xl), address, GST number
- Divider line after header
- Token + Date/Time row
- Items table: Clean borders, aligned columns
- Footer: Calculations right-aligned, totals emphasized

**58mm/80mm Receipt:**
- Single column: `max-w-xs` or `max-w-sm`
- All text left-aligned except totals (right-aligned)
- Dashed divider lines
- Condensed spacing: `text-xs` for most elements

### 9. Modal/Overlay Patterns

**Invoice Preview Modal:**
- Backdrop: Semi-transparent overlay
- Modal: `max-w-4xl` centered, `max-h-screen overflow-y-auto`
- Header: Title + close button (X icon top-right)
- Content: Invoice preview with accurate print representation
- Footer: Print button + Download PDF button

**Confirmation Dialogs:**
- Small centered modal: `max-w-sm`
- Icon at top (warning/question)
- Message: `text-center mb-6`
- Actions: Cancel (secondary) + Confirm (primary/destructive)

---

## Interaction Patterns

**Touch Targets:** All interactive elements minimum `h-11` (44px) on mobile
**Button Hierarchy:**
- Primary: Solid fill, medium font-weight, `h-12 px-6 rounded-lg`
- Secondary: Outline only, `h-12 px-6 rounded-lg border-2`
- Danger: Destructive actions, clearly differentiated
- Icon buttons: `h-10 w-10 rounded-lg` with icon centered

**Loading States:**
- Spinner: 24x24px centered
- Skeleton screens for table rows and product cards
- Disabled state: Reduced opacity `opacity-50 cursor-not-allowed`

**Feedback:**
- Success toast: Top-right, auto-dismiss 3s
- Error toast: Top-right, manual dismiss
- Toast container: `max-w-sm rounded-lg shadow-lg p-4`

---

## Form Design

**Input Fields:**
- Height: `h-12` consistent
- Padding: `px-4`
- Border: `border-2` (thicker for better visibility)
- Border radius: `rounded-lg`
- Focus state: Thicker border outline
- Error state: Distinct border treatment + error message below (`text-xs mt-1`)

**Labels:**
- Position: Above input with `mb-2`
- Typography: `text-sm font-medium`
- Required indicator: Asterisk after label

**Number Inputs (Prices, Quantities):**
- Right-aligned text for better scanning
- Stepper buttons for quantity: `h-10 w-10` with +/- symbols

---

## Data Display

**Tables:**
- Header row: Distinct background, `text-sm font-semibold uppercase tracking-wide`
- Body rows: `text-base`, alternating row backgrounds
- Cell padding: `px-4 py-3`
- Borders: Horizontal borders between rows only
- Responsive: Stack to cards on mobile

**Empty States:**
- Centered content with icon (80x80px)
- Message: `text-lg mb-2`
- Helper text: `text-sm`
- Primary action button below

---

## Accessibility

- All interactive elements have clear focus indicators (2px outline offset)
- Form inputs have associated labels (no placeholders as sole labels)
- Icon-only buttons include aria-labels
- Modal traps focus and returns to trigger on close
- Keyboard navigation: Tab order follows visual flow, Escape closes modals
- Color is never the only indicator of state/status

---

## Performance Considerations

- Product grid: Virtual scrolling for 100+ products
- Cart: Maximum 50 items visible, scroll for more
- Dashboard: Pagination for bills (25 per page)
- Lazy load invoice previews only when modal opens
- Debounce search input (300ms)

This design creates a professional, efficient POS system optimized for high-volume transaction environments while maintaining clarity and ease of use across all device sizes.