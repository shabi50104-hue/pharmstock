# Pharmacy Drug Stock Management — Design System

## Visual Direction

**Tone:** Clinical clarity meets controlled warmth. Reduces cognitive load for pharmacy staff through scannable layouts, instant visual warnings, and generous spacing. Medical-grade precision without sterility.

**Differentiation:** Alert badges with expiry countdown + inventory cards with visual stock density indicators (green/yellow/red).

## Color Palette

| Role | Light Mode OKLCH | Dark Mode OKLCH | Usage |
|------|-----------------|-----------------|-------|
| Primary | `0.58 0.12 219` | `0.68 0.14 218` | Trust, healthcare, primary CTAs, active states |
| Accent | `0.72 0.16 72` | `0.78 0.18 74` | Alerts, expiry warnings, attention (warm amber) |
| Destructive | `0.55 0.24 20` | `0.62 0.22 18` | Expired drugs, critical states |
| Background | `0.98 0.02 221` | `0.15 0.02 221` | Main surface, light/dark base |
| Card | `0.99 0.01 221` | `0.19 0.02 221` | Inventory cards, modular content |
| Foreground | `0.18 0.02 221` | `0.92 0.02 221` | Primary text, maximum readability |
| Border | `0.89 0.02 221` | `0.30 0.02 221` | Subtle dividers, content boundaries |
| Muted | `0.93 0.03 221` | `0.24 0.02 221` | Secondary text, disabled states |

**Chart tokens:** Teal (primary), amber (accent), purple, red (critical), indigo for data visualization.

## Typography

| Layer | Font | Usage | Scale |
|-------|------|-------|-------|
| Display | Figtree | Headers, badges, emphasis | 32px, 24px, 20px |
| Body | Inter | Lists, descriptions, form labels | 16px, 14px, 12px |
| Mono | GeistMono | Batch numbers, dates, SKUs | 14px, 12px |

**Hierarchy:** Display for section headers + badge text. Body for inventory descriptions. Mono for technical data (batch codes, expiry dates).

## Structural Zones

| Zone | Treatment | Details |
|------|-----------|---------|
| Header | `bg-card border-b border-border` | Sticky, minimal shadow, app title + user profile |
| Bottom Nav | `bg-card border-t border-border` | 5 tabs (Dashboard, Inventory, Add Drug, Alerts, Settings), teal active indicator |
| Content | `bg-background` | Generous padding (1rem), max-width container |
| Alert Sections | `bg-muted/20 rounded-lg p-4` | Visual separation for "Expiring Soon" / "Expired" cards |
| Inventory Cards | `bg-card border border-border rounded-lg p-4` | Hover shadow elevation, stock indicator dot |
| Modals | `bg-popover rounded-lg shadow-elevated` | Center-aligned, cancel + confirm buttons |

## Component Patterns

**Alert Badge:** Inline-flex, pill-shaped (`rounded-full`), 12px font (display), icon + text. Yellow variant for 15-30 days. Red variant for expired.

**Inventory Card:** Flex row, batch/drug name (left), stock indicator (right), expiry date + quantity stacked below. Stock indicator: 2px green/yellow/red dot.

**Tab Navigation:** Bottom fixed, 5 tabs, teal underline for active, scaled icons + labels.

**Bill Upload:** Camera + file picker buttons, preview thumbnail, manual data review form.

**Drug Detail Page:** Header with drug name + photo, tabs for batch history / pricing / stock movements.

## Spacing & Rhythm

- **Density:** 1rem between major sections (desktop: 1.5rem), 0.75rem between card items
- **Mobile:** 1rem padding on sides, 1.5rem vertical rhythm
- **Tablet/Desktop:** 1.5rem padding on sides, 2rem vertical rhythm for breathing room

## Elevation & Depth

- **Default card:** No shadow (border only)
- **Hover/Elevated:** `shadow-elevated` (4px, 8% alpha)
- **Alert/Modal:** `shadow-alert` (2px, 12% alpha)
- **Interaction feedback:** Smooth 0.3s transition, no bounce

## Motion & Animation

| Animation | Keyframes | Purpose |
|-----------|-----------|---------|
| `pulse-alert` | 0.7–1.0 opacity | Pulse effect on urgent expiry badges |
| `slide-up` | Y-translate 16px → 0, fade in | Entry animation for new alerts |
| `transition-smooth` | 0.3s cubic-bezier | Hover states, state transitions |

**Principle:** Purposeful motion for feedback; no decorative animations.

## Constraints

1. **No gradients** — solid colors only, drawn from OKLCH palette
2. **Icon scale:** 20px (tabs), 24px (buttons), 16px (inline)
3. **Max card width:** 100% on mobile; responsive grid on tablet+
4. **Border radius:** 0.625rem (`--radius`) standard, 0.375rem (`--radius - 4px`) compact, 0 for raw edges
5. **No drop shadows on text** — rely on contrast
6. **Minimum tap target:** 44px (mobile accessibility)

## Signature Detail

**Stock Indicator Dot:** Tiny colored circle (2px) on every inventory card + expiry badge. Instantly communicates status: green (healthy), yellow (warning), red (critical). Creates visual scannability across large lists without adding visual weight.

## Dark Mode

Enabled by default class-based toggle. Backgrounds shift to cool greys (L: 0.15–0.24), text inverts to cool light (L: 0.92), but teal and amber remain warm + saturated for alert visibility across modes.

## Responsive Breakpoints

- **Mobile:** 320px–640px (primary target, full-width tabs)
- **Tablet:** 641px–1024px (2-column card grid, sidebar optional)
- **Desktop:** 1025px+ (3-column grid, sidebar + main)

## Accessibility

- **Contrast:** AA+ (light/dark OKLCH values maintain 7+ LCH diff for readability)
- **Focus states:** `ring-2 ring-primary ring-offset-2`
- **Alert text + color:** Never color-only; use text labels ("15 days", "Expired") + badges
- **Touch targets:** All interactive elements ≥44px
- **Semantic HTML:** Form labels, buttons, list landmarks
