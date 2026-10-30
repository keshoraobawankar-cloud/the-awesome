# The Daily Bugle — Front-End Web Application

> **"New York's Hardest-Hitting News Portal"**  
> An authentic, responsive broadsheet news web application where New Yorkers can read breaking stories about Spider-Man, filter by investigative departments, save articles for offline reading, and toggle light/dark modes.

---

## 🗞️ Project Overview

Built to fulfill the **Front-End Task for 1st-Year Students**, this web app delivers an authentic Daily Bugle digital newspaper experience featuring:
- **Lead Hero Story & Card Grid**: Prominently displays the lead front-page story alongside a responsive 3-column grid of story cards with custom press photography, titles, categories, publication dates, and reading times.
- **Full Article View**: Clicking any story card opens an in-depth broadsheet reading experience featuring editorial typography, drop caps, eyewitness pull quotes, photo credits, text size controls, article sharing, and printing.
- **Search & Category Filtering**: Real-time keyword search across headlines, text, and tags, coupled with segmented category filters (*All, Exclusives, Opinion, Crime & Justice, City Beat, Investigation, Tech & Science*).
- **Persistent "Save for Later" Reading List**: Every story features a bookmark action. Bookmarked stories are stored in browser `localStorage` and persist across page refreshes and browser restarts, accessible via a dedicated Saved Stories archive.
- **Bonus — Dark Mode**: Full dual-theme system toggling between a vintage newsprint paper theme and a high-contrast darkroom night edition, persisting user preference.
- **Mobile & Desktop Responsive Design**: Tailored layout supporting single-column mobile viewports to expansive 1440px+ broadsheets with consistent typography (`Playfair Display`, `Oswald`, `Newsreader`, `Plus Jakarta Sans`).

---

## 🚀 Key Features

| Requirement | Implementation Detail |
|---|---|
| **Featured Story** | Front-page hero marquee with primary press photo, deck, pull-quote preview, and direct CTAs. |
| **Grid of Story Cards** | Multi-column responsive grid displaying image, headline, category, date, author, and reading time. |
| **Full Article Page** | Dedicated article view with drop-caps, pull quotes, byline credentials, font size adjuster (A / A+ / A++), share link copy, and print simulator. |
| **Search & Filters** | Real-time text search with clear button + single-line category filter buttons with article counters. |
| **Save for Later** | LocalStorage persistence via `daily_bugle_saved_v1`. Interactive bookmarks on cards, featured stories, and article headers. |
| **Saved Stories Page** | Archive page showing all saved stories, item count badge, single-click removal, reading links, and clear-all functionality. |
| **Dataset** | 10 deeply detailed Spider-Man and NYC news stories written in authentic Bugle newsroom lore. |
| **Responsive Layout** | Mobile-first CSS with Tailwind CSS v4, custom breakpoints, single-line control discipline, and fluid text. |
| **Bonus: Dark Mode** | Instant toggle between vintage cream newsprint (`#fcfaf7`) and deep night slate (`#111113`) with full contrast pairing. |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + custom broadsheet typography
- **Icons**: Lucide React
- **Typography**: Google Fonts (*Playfair Display*, *Oswald*, *Newsreader*, *Plus Jakarta Sans*)
- **State & Persistence**: React Context API + Browser `localStorage`
- **Build Tool**: Vite 6+

---

## 📂 Project Structure

```
├── public/
├── src/
│   ├── assets/images/          # Authentic press photographs & generated assets
│   ├── components/
│   │   ├── AboutView.tsx       # Masthead, history & $10,000 photo bounty
│   │   ├── ArticleView.tsx     # Full article reader with font scaling & actions
│   │   ├── FeaturedStory.tsx   # Lead story marquee section
│   │   ├── FilterBar.tsx       # Search bar and category segmented controls
│   │   ├── Footer.tsx          # Broadsheet footer with department links
│   │   ├── Header.tsx          # Top bar contract, masthead & breaking ticker
│   │   ├── HomeView.tsx        # Front-page composition with hero & card grid
│   │   ├── SavedStoriesView.tsx# Dedicated Saved Stories archive page
│   │   ├── StoryCard.tsx       # Reusable story card with unboxed metadata
│   │   ├── StoryImage.tsx      # Resilient zero-broken-image component
│   │   └── Toast.tsx           # Action feedback notification
│   ├── context/
│   │   └── BugleContext.tsx    # State management, localStorage sync, theme provider
│   ├── data/
│   │   └── stories.ts          # 10 comprehensive Daily Bugle stories & categories
│   ├── App.tsx                 # Root application with view switching
│   ├── index.css               # Tailwind CSS v4 config & custom typography
│   └── main.tsx                # App entry point
├── index.html                  # HTML template with fonts and meta tags
├── metadata.json               # Application metadata
├── package.json
└── README.md
```

---

## 💻 Setup & Run Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd daily-bugle-news
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal output) in your browser.

### 4. Build for production
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

---

## 🌐 Deployment Instructions (Bonus)

### Deploy to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

### Deploy to Netlify
1. Sign in to [Netlify](https://www.netlify.com).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub repository.
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Click **Deploy Site**.

---

## 📰 License & Attribution

Created for the Web Development Task (Frontend). Character lore, names, and references to Spider-Man and The Daily Bugle are property of Marvel Entertainment.
