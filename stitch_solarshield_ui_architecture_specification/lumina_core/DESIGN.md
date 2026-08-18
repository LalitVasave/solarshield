---
name: Lumina Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3f4850'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#894d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ac6200'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb875'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is built on a foundation of clarity, utility, and professional reliability. It avoids the heavy, dark "mission control" aesthetics often found in tech, opting instead for an airy, optimistic, and high-utility interface. 

The style is **Modern Corporate** with a lean towards **Minimalism**. It utilizes expansive white space, a disciplined color application, and a "light-touch" approach to depth. The goal is to make complex data feel approachable and professional, ensuring the user feels in control rather than overwhelmed.

## Colors

The palette is anchored by a crisp, clinical white surface to maintain a sense of cleanliness and focus. 

- **Primary Blue (#0284C7):** Used exclusively for primary actions, active states, and critical paths. It provides a vibrant "tech-savvy" energy without losing professional gravity.
- **Deep Charcoal (#1E293B):** Reserved for primary headings and body text to ensure maximum legibility and a grounded feel.
- **Subtle Gray (#F8FAFC):** Used for large container backgrounds and secondary sections to create soft structural grouping.
- **Border Gray (#E2E8F0):** A faint, low-contrast stroke used to define boundaries without adding visual noise.

## Typography

This design system relies entirely on **Inter** to project a systematic and utilitarian image. 

The typographic scale emphasizes hierarchy through weight and subtle negative letter-spacing on larger headings. For mobile, headline sizes are aggressively scaled down to maintain readability within the viewport. "Label-sm" is the only level utilizing uppercase treatment, reserved for category tags or small metadata to distinguish it from interactive text.

## Layout & Spacing

The layout follows a **Fluid Grid** logic with fixed maximum widths for content readability. 

- **Desktop:** A 12-column grid with 24px gutters and 32px outer margins.
- **Tablet:** An 8-column grid with 24px gutters.
- **Mobile:** A 4-column grid with 16px gutters and 16px outer margins.

Spacing follows an 8px base unit rhythm. Internal component padding should prioritize generous horizontal breathing room (sm/md) to maintain the "approachable" feel of the system.

## Elevation & Depth

This design system uses a combination of **Tonal Layers** and **Ambient Shadows** to establish hierarchy:

1.  **Level 0 (Floor):** The `#F8FAFC` background.
2.  **Level 1 (Card/Surface):** The `#FFFFFF` surface with a 1px `#E2E8F0` border. This is the default state for most content containers.
3.  **Level 2 (Interactive/Floating):** Surfaces that require emphasis use a very soft, diffused shadow: `0px 4px 12px rgba(30, 41, 59, 0.05)`. 

Shadows are never harsh or black; they are tinted with the Deep Charcoal (`#1E293B`) at very low opacities to keep the UI looking clean and integrated.

## Shapes

The shape language is consistently **Rounded** (8px / 0.5rem) across all standard components. This specific radius strikes the balance between the precision of a sharp corner and the friendliness of a full circle. 

- **Buttons & Inputs:** Use the standard 8px radius.
- **Small Chips:** May use a full pill-radius for distinct visual separation.
- **Large Containers:** Use `rounded-xl` (24px) to create a soft frame for the application.

## Components

### Buttons
- **Primary:** Background `#0284C7`, text `#FFFFFF`, no border.
- **Secondary:** Background `#FFFFFF`, text `#1E293B`, border 1px `#E2E8F0`.
- **Tertiary:** No background or border, text `#0284C7`, bold weight.

### Input Fields
- Use a 1px `#E2E8F0` border with a `#FFFFFF` fill.
- Focus state: Border changes to `#0284C7` with a subtle 2px outer glow (light blue tint).
- Labels are positioned above the input in `label-md`.

### Cards
- White background, 1px subtle border, and 8px corner radius.
- For data-heavy cards, use the subtle gray container background (`#F8FAFC`) for the card header to create clear sectioning.

### Chips & Badges
- Used for status and tags. High-utility badges should use a light tint of the primary color with a darker text version for contrast (e.g., Light Blue background with `#0284C7` text).

### Progress Indicators
- Use the Primary Blue for active progress. Track backgrounds should be the `#F8FAFC` gray to remain unobtrusive.