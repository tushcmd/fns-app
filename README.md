# FNS — FNEWSTEER

![Expo SDK 56](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS-3DDC84?logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

**Fundamental Analysis (News) Steer** — a trading companion that tells you, at a glance, whether it's safe to trade a currency pair right now based on high-impact economic news.

FNS watches the economic calendar and marks each pair on your watchlist as **CLEAR** or **BLOCKED**, warns you before a news blackout window opens, and keeps steering you even when the app is closed via notifications and a home-screen widget.

> ⚠️ **Not financial advice.** FNS is a news-timing tool, not a trading strategy.

---

## What it does

- **Live pair status** — every pair on your watchlist shows **CLEAR** (safe to trade) or **BLOCKED** (inside a news blackout window), driven by the FNEWSTEER API.
- **Next-event countdown** — a dashboard hero card counts down to the next relevant event and flips to an active-blackout state when a window is live.
- **Blackout notifications** — advance warnings before a window opens, plus an alert when a pair goes BLOCKED.
- **New-week calendar alerts** — ForexFactory publishes a fresh calendar each weekend; FNS notifies you when the new week's data is live (data-driven detection + a guaranteed weekly reminder).
- **Week calendar** — the full week of events with impact levels and day navigation.
- **Blackout heatmap** — a currency × day grid coloured by how much of each day is blacked out.
- **Multiple named watchlists** — e.g. "London Session", "NY Session", switchable from the dashboard.
- **Activity log** — a local history of CLEAR ↔ BLOCKED transitions for post-trade review.
- **Offline mode** — the last API response is cached; a stale-data banner shows when you're offline.
- **Light / dark / system theme.**
- **Android home-screen widget** — top pair status at a glance.

---

## Screenshots

> Drop images into `docs/screenshots/` with the filenames below and they'll render here.

| Dashboard | Calendar | Heatmap |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Calendar](docs/screenshots/calendar.png) | ![Heatmap](docs/screenshots/heatmap.png) |

| Settings | Onboarding | Android widget |
| --- | --- | --- |
| ![Settings](docs/screenshots/settings.png) | ![Onboarding](docs/screenshots/onboarding.png) | ![Widget](docs/screenshots/widget.png) |

---

## Data source

FNS is built around the **FNEWSTEER API**, which wraps ForexFactory's **weekly** economic-calendar JSON.

| Endpoint | Purpose | Cadence |
| --- | --- | --- |
| `GET /v1/news/check` | Is a symbol safe to trade right now + blocking events | Real-time |
| `GET /v1/news/upcoming` | This week's events | Weekly (ForexFactory) |
| `GET /v1/news/blackout-zones` | Flat list of blackout time windows | Weekly |
| `GET /health` | API status + cache age | Real-time |

Because the underlying data is a **weekly** feed, FNS cannot provide historical price reactions, multi-week look-ahead, or per-event analytics — only the current week's calendar and derived blackout windows.

Default API base URL: `https://fnewsteer-api.onrender.com` (configurable in Settings). An API key is bundled by default and can be overridden via secure storage.

---

## Tech stack

- **Expo SDK 56** / React Native 0.85 / React 19
- **Expo Router** (file-based routing, typed routes)
- **TypeScript** (strict)
- **TanStack Query** for data fetching/caching
- **NativeWind** for layout (colours/fonts use the design-system constants in `constants/theme.ts`, not NativeWind tokens)
- **expo-notifications** + **expo-background-fetch** + **expo-task-manager** for alerts
- **react-native-android-widget** for the Android home-screen widget
- **AsyncStorage** (watchlists, settings, cache, logs) + **expo-secure-store** (API key)
- **JetBrains Mono** as the app typeface

---

## Getting started

### Prerequisites

- Node.js 18+
- A configured React Native dev environment (Android Studio / Xcode)
- **A development build is required** — notifications, background fetch, and the Android widget do **not** work in Expo Go.

### Install

```sh
npm install
```

### Run (development build)

```sh
# Android (device or emulator)
npm run android

# iOS (device or simulator)
npm run ios
```

If native config (`app.json` plugins, permissions) changes, regenerate native projects first:

```sh
npm run prebuild
```

### Other scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the Metro dev server |
| `npm run typecheck` | `tsc --noEmit` — real type checking |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | ESLint `--fix` + Prettier write |

---

## Project structure

```
app/                     # Expo Router routes
  _layout.tsx            # Root layout: fonts, providers, splash, background task
  onboarding/            # First-run onboarding flow
  (tabs)/                # Main app (redirect-gated on onboarding)
    _layout.tsx          # Tab bar + onboarding redirect gate
    index.tsx            # Dashboard (pair status + next event)
    calendar.tsx         # Weekly event calendar
    heatmap.tsx          # Blackout heatmap
    settings/            # Settings, watchlists, theme, activity log
components/              # UI components grouped by feature
hooks/                  # useWatchlist, useSettings, useNotifications, ...
lib/
  api.ts                # FNEWSTEER API client + response caching
  storage.ts            # AsyncStorage/SecureStore persistence
  notifications.ts      # Scheduling, channel setup, new-week detection
  background.ts         # Background-fetch task registration
  widget.tsx            # Pushes data to the Android widget
providers/ThemeProvider.tsx  # Theme context (useColors / useTheme)
widgets/                # Android widget UI + task handler
constants/              # theme.ts (design system), pairs.ts (defaults + API)
```

---

## Notifications & background behaviour

FNS schedules notifications from two places:

1. **Foreground** (`hooks/useNotifications.ts`) — on every launch/resume it ensures the Android channel + OS permission, reschedules blackout warnings, syncs the weekly reminder, and runs the new-week check.
2. **Background** (`lib/background.ts`) — a background-fetch task (~15 min) does the same when the app is closed.

**Platform notes**

- **Android** — the background task is configured with `stopOnTerminate: false` / `startOnBoot: true`, so it keeps running when the app is closed. Notifications post to a dedicated **`fns-alerts`** channel at MAX importance. OEM battery optimisation / Doze can still delay background delivery — whitelisting FNS improves reliability.
- **iOS** — background fetch is unreliable; pre-scheduled advance warnings fire even when the app is closed, but newly-appearing events are only scheduled the next time the app is opened. Practically: open the app periodically to keep alerts fresh.

**New-week notification** comes in two layers:

- **Data-driven** — detects when the API's upcoming events advance to a new ISO week and notifies once. Accurate, but only runs when the app/background task runs.
- **Weekly reminder** — an OS-scheduled local notification (Sunday ~12:00 local) that fires even when the app is fully closed. Guaranteed, but time-based.

Both are governed by the **New Week Calendar Alert** toggle in Settings.

---

## Android widget

The **FNS Status** widget shows the top watchlist pair, its CLEAR/BLOCKED status, and the next event / countdown. It adapts between a compact and expanded layout based on size and follows the app theme. Data is pushed after background fetches and pull-to-refresh; `updatePeriodMillis` provides a 30-minute fallback refresh.

Add it after installing a dev build: long-press the home screen → **Widgets** → **FNS Status**.

---

## Configuration

Most behaviour is user-configurable in **Settings**:

- Watchlists (create / delete / switch / reorder pairs)
- Include medium-impact events
- Minutes-before-window warning (5 / 10 / 15 / 30)
- New-week calendar alert toggle
- Theme (dark / light / system)
- API URL

---

## Limitations

- Data is limited to the **current week** (ForexFactory weekly feed) — no history or multi-week look-ahead.
- The home-screen widget is **Android-only**; an iOS widget (via `expo-widgets`) is a future addition.
- Guaranteed push delivery when the app is fully closed on iOS would require a server-side push backend (not currently implemented).

---

## License

Released under the [MIT License](LICENSE).

---

_FNS v1.0.0 · Not financial advice._
