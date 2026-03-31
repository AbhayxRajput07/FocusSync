# Focus Shield 🛡️

> **Your Focus. Enforced.**

A hackathon-grade, intelligent student productivity platform that actively monitors study sessions, detects distractions, and corrects behavior through escalating interventions — like a strict digital mentor sitting beside you.

![Focus Shield](https://img.shields.io/badge/Focus-Shield-6C63FF?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-success?style=flat-square)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)

---

## ✨ Key Features

### 🎯 **Real-Time Behavior Monitoring**
- Tab visibility tracking
- Inactivity detection (mouse, keyboard, scroll)
- Focus score algorithm (0-100) with penalties & bonuses
- Event logging for complete session analytics

### 🚨 **3-Level Intervention System**
1. **Level 1**: Yellow banner warning (dismissible)
2. **Level 2**: 40% screen blur with 10s countdown
3. **Level 3**: Full screen lock with 60s mandatory wait

### 📊 **Deep Analytics Dashboard**
- Focus trend line chart (7-day history)
- Stacked bar charts (focus vs distraction time)
- Subject breakdown donut chart
- Distraction pattern heatmap (hourly × daily)
- Session history with expandable minute-by-minute heatmaps
- Focus debt meter with clearing mechanism

### 🎵 **Ambient Sound Engine** (Web Audio API)
- **Brown Noise**: White noise + lowpass filter (400Hz)
- **Binaural Beats**: 200Hz (left) + 240Hz (right) = 40Hz gamma focus
- **Lo-fi**: Sawtooth wave + LFO wobble + lowpass filter
- **Auto Mode**: Switches sounds based on session phase

### 🏆 **Gamification System**
- **Streaks**: Daily streak counter with recovery tracking
- **Achievements**: 9 unlockable badges
  - First Session, Perfect Score, 3/7-Day Streak
  - Speed Returner, Night Owl, Early Bird
  - Debt Cleared, Accountable, Streak Saver
- **Focus Debt**: Accumulated distraction time with strict clearing sessions
- **Discipline Fingerprint**: Average response time, peak distraction hour, compliance rate

### 📝 **Study Contract System**
- Set session goals with accountability partner email
- Define minimum focus score threshold
- Auto-generate accountability emails for failed sessions
- Readiness check with score calculation

---

## 🎨 Design System

### Color Palette (Dark-First)
```css
Background:   #0A0A0F (near-black)
Surface:      #111118
Card:         #16161F
Border:       #2A2A3A
Accent:       #6C63FF (electric violet)
Accent-2:     #00D4AA (mint green)
Danger:       #FF4757
Warning:      #FFB347
Success:      #2ED573
Text Primary: #F0F0FF
Text Muted:   #8888AA
```

### Typography
- **Font**: Inter (Google Fonts) — weights 300, 400, 500, 600
- **Headings**: 600 weight, tight letter-spacing
- **Body**: 400 weight, line-height 1.65

### Components
- **Cards**: `rounded-2xl`, 1px border, `#16161F` background
- **Buttons**: `rounded-xl`, accent fill, hover `brightness-110`, active `scale-95`
- **Transitions**: 200ms ease on all interactions
- **Glow Effects**: `box-shadow: 0 0 20px rgba(108,99,255,0.25)`

---

## 🚀 Tech Stack

- **Frontend**: React 19.2 + Vite 8.0
- **Styling**: Tailwind CSS (dark mode enabled)
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Audio**: Web Audio API (no external files)
- **Storage**: localStorage (sessions, streaks, achievements, settings)
- **Routing**: React Router DOM

**No backend required** — fully client-side application.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/focus-shield.git
cd focus-shield

# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

---

## 📖 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero page with features showcase |
| `/dashboard` | Dashboard | Main hub with metrics, charts, quick start |
| `/session` | Session | Active study session with timer & interventions |
| `/analytics` | Analytics | Deep insights, charts, heatmaps |
| `/settings` | Settings | User preferences & data management |

---

## 🧠 Core Algorithms

### Focus Score Calculation
```
Starting Score: 100
Penalties:
  - Tab switch: -5 points
  - Level 1 intervention: -5 points
  - Level 2 intervention: -10 points
  - Level 3 intervention: -15 points
  
Bonuses:
  - Return within 30s: +2 points
  - Complete with 0 distractions: +10 points
  - Maintain streak: +5 points

Score range: 0-100 (clamped)
```

### Readiness Score Formula
```
score = (rested × 10) + (motivated × 10) + 30 - (max(0, hoursSinceBreak - 2) × 5)
Range: 0-100

Recommendations:
  < 50: Start with 15-min session
  50-80: Standard 25-min session
  > 80: Extended 35-min session
```

### Intervention Triggers
```
Level 1: First tab switch OR 30s+ inactivity
Level 2: Second infraction within 5 min OR 5+ min inactivity
Level 3: Third infraction OR 15+ min inactivity OR 2+ min away from tab
```

---

## 🎮 Keyboard Shortcuts

- **Space**: Pause/Resume timer (in session)
- **Escape**: Dismiss overlays (Level 1 interventions)

---

## 💾 localStorage Schema

```javascript
fs_sessions         // Array of session objects (full history)
fs_fingerprint      // { avgResponseTime, peakDistractionHour, complianceRate }
fs_streak           // { current, longest, lastSessionDate }
fs_recovery_streak  // { current, longest }
fs_focus_debt       // Number (total distraction minutes)
fs_achievements     // Array of unlocked achievement IDs
fs_settings         // User preferences object
fs_sound_pref       // Last used sound mode string
```

### Session Object Schema
```javascript
{
  id: string,
  startTime: timestamp,
  endTime: timestamp,
  subject: string,
  pomodoroLength: number,
  finalScore: number (0-100),
  focusMinutes: number,
  distractionMinutes: number,
  distractionCount: number,
  events: Array<{ timestamp, type, minuteIndex, score }>,
  contractGoal: string,
  contractThreshold: number,
  contractPassed: boolean,
  readinessScore: number
}
```

---

## 📱 Responsive Design

- **Mobile**: 375px+ (collapsed sidebar, bottom nav)
- **Tablet**: 768px+ (expanded sidebar)
- **Desktop**: 1440px+ (full layout with all panels)

All charts and tables adapt to screen size.

---

## 🔊 Web Audio API Implementation

### Brown Noise Generator
```javascript
// White noise → Lowpass filter (400Hz, Q=0.7)
const noiseBuffer = createWhiteNoise(2 seconds);
const filter = createBiquadFilter('lowpass', 400Hz);
noiseSource → filter → gain → output
```

### Binaural Beats (40Hz Gamma)
```javascript
// Left: 200Hz, Right: 240Hz
// Brain perceives 40Hz difference (focus frequency)
leftOsc(200Hz) → leftChannel
rightOsc(240Hz) → rightChannel
merger → output
```

### Lo-fi Sound
```javascript
// Sawtooth wave + LFO modulation + lowpass filter
baseOsc(110Hz, sawtooth) → filter(800Hz) → gain
lfo(0.5Hz) → frequency modulation
```

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Hero landing page
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Session.jsx       # Active session screen
│   │   ├── Analytics.jsx     # Analytics & insights
│   │   └── Settings.jsx      # User settings
│   ├── components/
│   │   ├── layout/           # AppLayout, Sidebar, TopBar
│   │   ├── session/          # Session-specific components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── analytics/        # Chart components
│   │   └── ui/               # Reusable UI components
│   ├── services/
│   │   ├── monitoringEngine.js    # Behavior tracking
│   │   ├── focusScore.js          # Score calculator
│   │   ├── soundEngine.js         # Web Audio API
│   │   ├── achievements.js        # Gamification
│   │   ├── fingerprint.js         # Discipline fingerprint
│   │   └── storage.js             # localStorage helpers
│   ├── constants/
│   │   ├── defaults.js       # Default settings
│   │   ├── achievements.js   # Achievement definitions
│   │   └── theme.js          # Design tokens
│   ├── App.jsx               # Main app with routing
│   └── main.jsx              # Entry point
├── index.html                # HTML template
├── tailwind.config.js        # Tailwind customization
└── package.json              # Dependencies
```

---

## 🎯 Implementation Highlights

### ✅ Production-Quality Features
- **Null-safe localStorage reads** with fallbacks
- **Animated number counters** on metric cards (600ms duration)
- **Circular SVG progress ring** with smooth animations
- **Page transitions** with fade-in effects
- **Intervention slide-ins** with proper z-indexing
- **Session heatmaps** with staggered block animations
- **Achievement toast notifications** (auto-dismiss after 3s)
- **Empty states** with custom messages for first-time users

### ✅ Edge Cases Handled
- Browser notification permissions
- Audio context resume on user interaction
- Streak calculation across midnight boundaries
- Session continuation after tab hidden for extended periods
- Contract validation before session start
- Data export with timestamp
- Confirmation dialogs for destructive actions

---

## 🚧 Future Enhancements

- [ ] Multi-device sync (Firebase/Supabase)
- [ ] Pomodoro break timer with notifications
- [ ] Custom achievement creation
- [ ] Session templates & presets
- [ ] Export analytics as PDF report
- [ ] Dark/Light theme toggle
- [ ] Distraction prediction ML model
- [ ] Focus session sharing links
- [ ] Leaderboard (friends comparison)

---

## 🤝 Contributing

This is a hackathon project built for demonstration purposes. Feel free to fork and extend!

---

## 📄 License

MIT License - feel free to use in your own projects.

---

## 👨‍💻 Built With

Focus Shield was built with **attention to detail**, **clean code practices**, and **user-centric design** to deliver a hackathon-winning experience. Every feature is fully functional, every chart renders real data, and every interaction feels premium.

**No placeholders. No broken layouts. Production-ready.**

---

## 🌟 Demo

### Screenshots
_(Add screenshots of Landing, Dashboard, Session, Analytics pages)_

### Video Walkthrough
_(Add demo video link)_

---

## 📞 Contact

Built by **[Your Name]** for **[Hackathon Name]**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your@email.com
- Portfolio: [yourportfolio.com](https://yourportfolio.com)

---

**Focus Shield** — Because discipline is a skill, and we're here to build it. 🛡️
