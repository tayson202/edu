---
name: Modern Knowledge Hub
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9fa'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3ff'
  surface-container: '#ebedff'
  surface-container-high: '#e3e7ff'
  surface-container-highest: '#dbe1ff'
  on-surface: '#131a33'
  on-surface-variant: '#464555'
  inverse-surface: '#282f49'
  inverse-on-surface: '#eff0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131a33'
  surface-variant: '#dbe1ff'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an authoritative yet energetic presence tailored for high-achieving learners, course creators, and enterprise upskillers. Combining the structured rigor of executive software with the dynamic momentum of modern digital marketplaces, it projects mastery, credibility, and frictionless cognitive flow.

### Design Movement
The aesthetic synthesizes **Corporate Modern** with subtle **Tactile Precision**:
- Razor-sharp typographic hierarchy ensuring high-density comprehension without visual fatigue.
- Restrained, layered slate surfaces paired with focused, luminous chromatic signals to guide actions.
- High-intent visual accents reserved strictly for micro-interactions, state progression, and verified accomplishments.
- Crisp boundary definitions that separate high-volume analytical data from interactive course media.

## Colors

The palette is anchored by deep navy tonal structures and clean neutral slate surfaces, accented by high-clarity functional pigments.

### Roles & Semantic Distribution
- **Primary (`#4F46E5` Electric Indigo)**: Primary calls-to-action, active module highlights, focused links, and critical interaction paths. In dark interfaces or intense contrast contexts, the lighter tint (`#6366F1`) steps in as a radiant interactive hover state.
- **Secondary (`#10B981` Emerald Success)**: Micro-credentials, milestone completions, certificate validations, revenue/earnings data, and positive delta indicators.
- **Tertiary (`#F59E0B` Amber Accent)**: Star ratings, top-tier instructor tags, urgency alerts, streak milestones, and curated spotlight items.
- **Neutral (`#0B132B` Deep Navy)**: Structural foundation across typography, dark-mode surfaces, and prominent navigation headers. High-contrast slate variants (`#1C2541`, `#334155`, `#64748B`, `#F8FAFC`) form supporting borders, neutral cards, and subtle background surfaces.

## Typography

The type system blends the energetic curves of **Plus Jakarta Sans** for headings, brand milestones, and badges with the utilitarian precision of **Inter** for data density, syllabi, body paragraphs, and administrative dashboards.

- **Display & Headings**: Rendered in tight tracking with strict vertical metrics to ensure zero structural drift during long-tail localized translations.
- **Body & Data**: Rendered in Inter with generous line-heights for optimal sustained screen reading during multi-hour lecture modules and technical coursework.
- **Labels & Micro-copy**: Employs uppercase or elevated tracking on Plus Jakarta Sans for quick visual scanning across catalog search facets, course tags, and analytics cards.

## Layout & Spacing

The structural layout operates on a standard 8pt grid with an adaptable column matrix to balance content discovery against intensive dashboard workflows.

### Grid & Breakpoints
- **Mobile (< 768px)**: 4 columns, `margin-mobile` of `1rem`, `gutter-mobile` of `1rem`. Fluid bottom action bars with anchored sticky controls. Single-column stacked cards.
- **Tablet (768px - 1024px)**: 8 columns, `margin` of `1.5rem`, `gutter` of `1.5rem`. Dual-column course discovery cards; side navigation collapses into an off-canvas drawer.
- **Desktop (> 1024px)**: 12 columns, max container width of `1280px` centered with variable outer margins. Fixed left navigation rail (`260px`), dynamic catalog grid (3 or 4 columns), and dedicated right contextual panels for active video lectures and lesson transcripts.

### Spacing Philosophy
- Component padding relies strictly on `space-xs` through `space-md` for high data fidelity inside dashboard metrics and table line-items.
- Generous intervals (`space-lg` to `space-xl`) delineate course sections, marketing heroes, and cohort discussion topics to keep learning sessions calm and organized.

## Elevation & Depth

Visual hierarchy uses delicate tonal layering and deep-tinted, ultra-soft shadows rather than opaque heavy drops.

### Elevation Architecture
1. **Canvas Surface (Level 0)**: Light slate neutral (`#F8FAFC`) serving as the backdrop for all views.
2. **Resting Cards & Containers (Level 1)**: Pure white (`#FFFFFF`) with a 1px boundary stroke (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(11, 19, 43, 0.04), 0 1px 2px -1px rgba(11, 19, 43, 0.02)`.
3. **Interactive & Hover Cards (Level 2)**: Transitioned translate-y with elevated ambient depth: `0 10px 15px -3px rgba(11, 19, 43, 0.08), 0 4px 6px -4px rgba(11, 19, 43, 0.03)`, accompanied by a subtle primary color boundary accent (`#C7D2FE`).
4. **Flyout Menus, Course Previews & Popovers (Level 3)**: High-floating context panels elevated by `0 20px 25px -5px rgba(11, 19, 43, 0.1), 0 8px 10px -6px rgba(11, 19, 43, 0.04)`.
5. **Modal Overlays & Video Theaters (Level 4)**: Backdrop filtered blur with `backdrop-filter: blur(8px); background-color: rgba(11, 19, 43, 0.6)`. Floating modals inherit zero base shadow bleed, resting purely on ambient border lights.

## Shapes

The design uses a balanced rounded radius (`0.5rem` / `8px` default) to project contemporary software precision without appearing overly playful or strictly mechanical.

### Corner Token Applications
- **Base (0.5rem / 8px)**: Standard UI inputs, contextual menus, data tables, code snippets, video player corners, and lesson checklist items.
- **Large (1rem / 16px)**: Course catalog cards, earnings breakdown panels, video container wrappers, and modal windows.
- **Pill (Fully Rounded / 9999px)**: Status badges, category pills, rating counters, completion progress indicators, and interactive micro-chips.

## Components

### Buttons
- **Primary Action**: Electric indigo (`#4F46E5`) fill, pure white text, 8px radius, medium Plus Jakarta Sans font. Hover state applies `#4338CA` with a subtle elevation shift. Focus state features a 2px offset ring of `#818CF8`.
- **Secondary / Ghost**: Pure white background with 1px border (`#E2E8F0`), dark navy text (`#0B132B`). Hover state applies `#F1F5F9`.
- **Destructive**: Deep crimson background tint with clear red action text; avoids overwhelming standard navigation.

### Chips & Pill Tags
- **Level & Category Pills**: Fully rounded pill shapes, lightweight solid slate or tinted backgrounds (e.g., `#EEF2FF` text `#4338CA` for "Web Development").
- **Rating Badges**: Amber background tint (`#FEF3C7`) paired with `#B45309` typography and inline SVG star icons.
- **Status Tags**: Emerald background tint (`#D1FAE5`) with `#065F46` label for "Completed" or "Verified".

### Cards (Course & Analytics)
- High-contrast pure white container wrapped in `#E2E8F0` border.
- Media ratio locked to 16:9 for course thumbnails with an inset duration chip.
- Lower card section holds metadata: author avatar, course title, star rating pill, and price/enrollment progress bar.
- Instructor dashboard variant swaps media for a sparkline chart with emerald growth deltas.

### Input Fields & Search Bars
- Marketplace search input features an inset magnifying icon, clear button, and category dropdown segment.
- Height structured at `44px` on mobile for finger accessibility and `40px` on desktop.
- Resting border `#CBD5E1`, shifting on active focus to a 1.5px `#4F46E5` border with an indigo ambient glow.

### Checkboxes, Radios & Module Selectors
- Custom 20px inputs with 4px border-radius for checkboxes, fully circular for radio choices.
- Inactive state uses `#CBD5E1` outline; active selected state transitions instantly into `#4F46E5` with a crisp white tick mark.
- Course syllabus chapter headers feature interactive checkmarks that transition to solid `#10B981` (Emerald) when lesson criteria are satisfied.

### Progress Bars & Learning Steppers
- Linear 6px progress track (`#E2E8F0`) with dynamic `#10B981` progress fills.
- Segmented steppers for multi-part assignment uploads and interactive coding challenges.