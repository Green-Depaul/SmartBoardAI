
  # SmartBoardAI Frontend

  React + Vite frontend for SmartBoardAI.

  ## Getting started (for teammates)

  Prerequisites
  - Node.js 18+ (Node 20/22/24 are fine)
  - npm

  Clone and run
  ```zsh
  # 1) Clone the repo
  git clone https://github.com/Green-Depaul/SmartBoardAI.git

  # 2) Go to the frontend folder
  cd SmartBoardAI/smartboardai-frontend

  # 3) Install dependencies
  npm install

  # 4) Start the dev server (opens your browser)
  npm run dev -- --open
  ```

  Notes
  - Vite serves on http://localhost:5173 by default. If the port is in use, it will auto-pick the next one (e.g., 5174).
  - If the page doesn’t update, try a hard refresh.

  ## Color Palette

  Use these across components via CSS variables and utilities (e.g., `bg-primary`, `text-primary`, `bg-accent`, `bg-background`, `text-muted-foreground`).

  - Primary: `#2563eb` (Blue 600) — main buttons, CTAs, icons
  - Primary Foreground: `#ffffff` — text on primary

  - Secondary: `#e0f2fe` (Sky 100) — light blue backgrounds
  - Secondary Foreground: `#0f172a` — text on secondary

  - Accent: `#dbeafe` (Blue 100) — feature card backgrounds, highlights
  - Accent Foreground: `#1e40af` (Blue 800) — text on accent

  - Background: `#f8fafc` — base app background
  - Foreground: `oklch(0.145 0 0)` — main text

  - Muted: `#f1f5f9` (Slate 100) — light gray backgrounds
  - Muted Foreground: `#64748b` (Slate 500) — subtle text

  - Border: `rgba(0, 0, 0, 0.1)` — subtle borders

  Usage conventions
  - Sign Up buttons: Primary (`#2563eb`)
  - Log In buttons: Outline style with primary border
  - Feature cards: Accent (`#dbeafe`)
  - Feature icons: Primary blue inside light circles
  - Nav links: Primary with hover effects
  - Form inputs: Light gray bg (`#f3f3f5`)
  