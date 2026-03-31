# 🚀 Quick Start Guide

## Prerequisites
- **Node.js** version 18+ installed
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install all required packages:
- React 19.2
- Vite 8.0
- Tailwind CSS
- Chart.js
- Lucide React icons
- React Router DOM

### 2. Start Development Server
```bash
npm run dev
```

The app will start at **http://localhost:5173**

You should see output like:
```
  VITE v8.0.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. Open in Browser
Navigate to **http://localhost:5173** in your browser.

---

## 🎯 First-Time User Flow

### Step 1: Landing Page
You'll see the hero landing page with:
- Large headline: "Your Focus. Enforced."
- Feature highlights
- Animated stat counter
- CTA buttons

**Action**: Click "Start Focusing" button

### Step 2: Dashboard (Auto-loads demo data)
On first visit, the app seeds demo data:
- 3 sample sessions
- 7-day streak
- 3 unlocked achievements

Explore the dashboard:
- **Metric cards**: Focus time, streak, avg score, sessions
- **Bar chart**: Today's focus activity
- **Quick start panel**: Begin a new session
- **Achievement badges**: View unlocked achievements

### Step 3: Start Your First Real Session
Click **"Start New Session"** button

#### Pre-Session Modal (3 Steps)

**Step 1: Readiness Check**
- Rate how rested you are (1-5)
- Rate your motivation (1-5)
- Hours since last break (0-8)
- View calculated readiness score
- Get session length recommendation

**Step 2: Study Contract (Optional)**
- Toggle contract activation
- Set session goal
- Add accountability partner email
- Set minimum focus score threshold (50-95)

**Step 3: Session Configuration**
- Enter subject/topic
- Choose Pomodoro length (15/25/35/45 min)
- Choose break length (5/10/15 min)
- Click **"Begin Session"**

### Step 4: Active Session
Once session starts, you'll see:
- **Circular timer**: Large countdown in center
- **Focus score**: Top-right corner (starts at 100)
- **Activity log**: Bottom-left (live event feed)
- **Ambient sound panel**: Bottom-right
  - Try: Silent / Brown Noise / Binaural / Lo-fi
  - Adjust volume slider

#### Test Interventions
To experience the intervention system:
1. Switch to another browser tab → **Level 1 Warning** (yellow banner)
2. Return quickly (within 30s) → Get **+2 bonus**
3. Switch again → **Level 2 Intervention** (screen blur + countdown)
4. Stay away longer → **Level 3 Lock** (full screen lock + 60s wait)

Watch your **focus score** decrease with each distraction!

### Step 5: Session Summary
When timer ends (or you click "End Session"):
- View final focus score
- See contract result (PASSED/FAILED)
- Check distraction statistics
- Review time breakdown
- Start another session or view analytics

---

## 📊 Exploring Analytics

Navigate to **Analytics** (sidebar or bottom nav on mobile)

### Features to explore:
1. **Date range selector**: Today / This Week / This Month / All Time
2. **Summary metrics**: Total focus time, average score, sessions, best streak
3. **Focus trend line**: 7-day history chart
4. **Stacked bar chart**: Focus vs distraction minutes by day
5. **Subject donut chart**: Time breakdown by study topic
6. **Distraction heatmap**: 24-hour × 7-day grid
   - Shows your highest risk window
7. **Session history table**: 
   - Click any session to expand
   - View minute-by-minute heatmap
8. **Focus debt meter**:
   - If debt ≥ 30 min → "Clear Debt" button appears
   - Triggers strict 10-min session

---

## ⚙️ Settings

Navigate to **Settings** page

### Available Options:

#### Focus Preferences
- Default Pomodoro length (15-60 min)
- Default break length (5-20 min)
- Inactivity threshold (30s / 60s / 90s)
- Intervention strictness:
  - **Gentle**: More lenient warnings
  - **Standard**: Balanced approach (default)
  - **Strict**: Immediate locks on first distraction

#### Notifications
- Browser notifications toggle
- Sound alerts toggle
- Intervention sound style (chime / buzz / none)

#### Data Management
- **Export data**: Download all sessions/achievements as JSON
- **Clear all data**: Reset app to fresh state (requires confirmation)

**Important**: Click **"Save Settings"** button at bottom!

---

## 🏆 Unlock Achievements

Try to unlock all 9 achievements:

1. **First Session** — Complete any session ✅ (Auto-unlocked)
2. **Perfect Score** — Finish with 100 focus score
   - No distractions, no tab switches
3. **3-Day Streak** — Complete sessions 3 days in a row
4. **7-Day Streak** — Complete sessions 7 days in a row
5. **Speed Returner** — Return to focus within 5s, 3 times in one session
6. **Night Owl** — Complete a session after 10 PM
7. **Early Bird** — Complete a session before 7 AM
8. **Debt Cleared** — Complete a strict debt-clearing session
9. **Accountable** — Send an accountability email (when contract fails)

---

## 🎵 Ambient Sounds Guide

### Brown Noise
- Best for: Initial focus phase, blocking background noise
- Technical: White noise filtered at 400Hz
- When: First 10 minutes of session (auto-mode)

### Binaural Beats (40Hz)
- Best for: Deep focus, concentration
- Technical: 200Hz (left) + 240Hz (right) = 40Hz gamma wave
- When: Middle phase of session (auto-mode)
- **Note**: Use headphones for best effect

### Lo-fi
- Best for: Final minutes, winding down
- Technical: Sawtooth wave with LFO modulation
- When: Last 5 minutes (auto-mode)

### Auto Mode
- Automatically switches between sounds based on session progress
- Recommended for first-time users

---

## 🐛 Troubleshooting

### Audio not playing?
- Click anywhere on the page first (browser security)
- Check volume slider in sound panel
- Ensure browser isn't muted

### Charts not rendering?
- Check browser console for errors (F12)
- Clear localStorage and refresh: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Session not starting?
- Complete all 3 pre-session steps
- Enter at least a subject name
- Check browser console for errors

### Data not saving?
- Check localStorage is enabled (browser settings)
- Try incognito/private mode to test
- Export data as backup before clearing

---

## 📱 Mobile Usage

### Bottom Navigation
On mobile (< 640px), the sidebar collapses to bottom navigation bar:
- Dashboard icon
- Session icon
- Analytics icon
- Settings icon

### Responsive Features
- Metric cards stack vertically
- Charts adapt to screen width
- Session timer scales appropriately
- All interactions remain touch-friendly

---

## 💡 Pro Tips

1. **Start with 15-minute sessions** if you're new to focused work
2. **Use study contracts** for high-stakes sessions (exams, deadlines)
3. **Enable browser notifications** for session end alerts
4. **Check analytics weekly** to identify distraction patterns
5. **Clear focus debt regularly** to maintain good habits
6. **Try different sound modes** to find what works for you
7. **Set realistic readiness scores** — honesty helps recommendations
8. **Use strict mode** when you need maximum discipline
9. **Export data regularly** as backup
10. **Share your streak** with friends for accountability

---

## 🎓 Best Practices

### Before Session
- [ ] Close unnecessary tabs
- [ ] Silence phone notifications
- [ ] Have study materials ready
- [ ] Set clear session goal
- [ ] Check readiness score

### During Session
- [ ] Stay on study materials
- [ ] Return quickly if distracted
- [ ] Adjust sound as needed
- [ ] Monitor focus score
- [ ] Complete full timer

### After Session
- [ ] Review session summary
- [ ] Note improvement areas
- [ ] Take proper break
- [ ] Update streak
- [ ] Plan next session

---

## 🚀 Next Steps

1. **Complete 7 consecutive days** to unlock 7-Day Streak badge
2. **Try all 3 intervention levels** to understand the system
3. **Experiment with different Pomodoro lengths** (find your sweet spot)
4. **Use study contracts** for important sessions
5. **Review analytics** to find your peak focus hours
6. **Challenge friends** to beat your streak

---

## 📖 Additional Resources

- Full documentation: See `README.md`
- Code architecture: Check `frontend/src/` structure
- Customization: Edit `tailwind.config.js` for theme changes
- API docs: See service files in `frontend/src/services/`

---

**Ready to enforce your focus?** 🛡️

Open your browser, start the dev server, and begin your first session!

```bash
cd frontend && npm run dev
```

Then visit: **http://localhost:5173**
