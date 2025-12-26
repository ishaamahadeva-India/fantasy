# Image Ads - Multiple Views Feature Guide

**Feature:** ✅ **IMPLEMENTED** - Ads can now show multiple times for the same campaign/tournament

---

## 🎯 **OVERVIEW**

Previously, image ads would only show **once per user per campaign/tournament**. Now, you can configure ads to show **multiple times** with flexible repeat intervals.

---

## ⚙️ **CONFIGURATION OPTIONS**

### **1. Allow Multiple Views** (`allowMultipleViews`)
- **Type:** Boolean (Switch)
- **Default:** `false`
- **Description:** Enable/disable multiple views for the same campaign/tournament
- **Location:** Admin Panel → Image Ads → Create/Edit Ad

### **2. Repeat Interval** (`repeatInterval`)
- **Type:** Dropdown Selection
- **Options:**
  - **`never`** (Default) - Show once, never repeat
  - **`always`** - Show every time user visits
  - **`daily`** - Show once per day (24 hours)
  - **`weekly`** - Show once per week (7 days)
  - **`session`** - Show once per browser session
- **Description:** Controls when the ad can be shown again after user has viewed it

### **3. Min Time Between Views** (`minTimeBetweenViews`)
- **Type:** Number (seconds)
- **Default:** Empty (not set)
- **Description:** Minimum seconds between views (overrides repeat interval if set)
- **Example:** `3600` = 1 hour, `86400` = 24 hours

---

## 📊 **HOW IT WORKS**

### **Repeat Interval Logic:**

#### **`never` (Default)**
```
User views Campaign A → ✅ Ad shows (first time)
User refreshes page → ❌ No ad (already viewed)
User visits Campaign A next day → ❌ No ad (never repeat)
```

#### **`always`**
```
User views Campaign A → ✅ Ad shows
User refreshes page → ✅ Ad shows again
User visits Campaign A next day → ✅ Ad shows again
User visits Campaign A anytime → ✅ Ad shows (every visit)
```

#### **`daily`**
```
User views Campaign A at 10 AM → ✅ Ad shows
User refreshes at 11 AM → ❌ No ad (same day)
User visits next day at 9 AM → ✅ Ad shows (24+ hours passed)
```

#### **`weekly`**
```
User views Campaign A on Monday → ✅ Ad shows
User visits on Tuesday → ❌ No ad (same week)
User visits next Monday → ✅ Ad shows (7+ days passed)
```

#### **`session`**
```
User views Campaign A → ✅ Ad shows
User refreshes page → ❌ No ad (same session)
User closes browser, opens again → ✅ Ad shows (new session)
```

#### **`minTimeBetweenViews` (e.g., 3600 seconds = 1 hour)**
```
User views Campaign A at 10:00 AM → ✅ Ad shows
User visits at 10:30 AM → ❌ No ad (only 30 min passed)
User visits at 11:00 AM → ✅ Ad shows (1+ hour passed)
```

---

## 🎛️ **ADMIN PANEL CONFIGURATION**

### **Step-by-Step:**

1. **Go to Admin Panel** → `/admin/image-ads`
2. **Create New Ad** or **Edit Existing Ad**
3. **Scroll to "Repeat Behavior" Section**
4. **Configure:**
   - ✅ **Allow Multiple Views** - Toggle ON/OFF
   - **Repeat Interval** - Select from dropdown
   - **Min Time Between Views** - Enter seconds (optional)
5. **Save Ad**

### **Example Configurations:**

**Configuration 1: Show ad once per day**
```
Allow Multiple Views: ✅ ON
Repeat Interval: daily
Min Time Between Views: (empty)
```

**Configuration 2: Show ad every hour**
```
Allow Multiple Views: ✅ ON
Repeat Interval: always
Min Time Between Views: 3600
```

**Configuration 3: Show ad once per session**
```
Allow Multiple Views: ✅ ON
Repeat Interval: session
Min Time Between Views: (empty)
```

**Configuration 4: Show ad every visit (no limits)**
```
Allow Multiple Views: ✅ ON
Repeat Interval: always
Min Time Between Views: (empty)
```

---

## 🔍 **TECHNICAL DETAILS**

### **Priority Logic:**

When multiple ads are available:
1. **Ads with `allowMultipleViews=true` or `repeatInterval!='never'`** are prioritized
2. Then sorted by `priority` (higher = shown first)
3. Then checked for view limits (`maxViewsPerUser`, `maxViews`)

### **View Tracking:**

- **Firestore:** `image-ad-views` collection tracks all views with timestamps
- **localStorage:** Session-based tracking for `session` interval
- **Time Calculation:** Based on `viewedAt` timestamp from Firestore

### **Check Flow:**

1. Select ad (highest priority that allows repeats)
2. Check `allowMultipleViews` flag
3. Check `repeatInterval` setting
4. Check `minTimeBetweenViews` (if set)
5. Query Firestore for user's last view
6. Calculate time since last view
7. Compare against interval/time threshold
8. Show ad if conditions met

---

## 📝 **USE CASES**

### **Use Case 1: Daily Ad Campaign**
**Goal:** Show sponsor ad once per day to maximize exposure
```
Repeat Interval: daily
Result: User sees ad once every 24 hours
```

### **Use Case 2: Session-Based Ads**
**Goal:** Show ad once per browser session (good for retargeting)
```
Repeat Interval: session
Result: User sees ad once per browser session
```

### **Use Case 3: Frequent Exposure**
**Goal:** Show ad every time user visits (maximum exposure)
```
Repeat Interval: always
Result: User sees ad on every visit
```

### **Use Case 4: Time-Limited Exposure**
**Goal:** Show ad every 2 hours (controlled frequency)
```
Repeat Interval: always
Min Time Between Views: 7200 (2 hours)
Result: User sees ad maximum once every 2 hours
```

---

## ⚠️ **IMPORTANT NOTES**

1. **Backward Compatibility:**
   - Existing ads default to `repeatInterval: 'never'` (original behavior)
   - No breaking changes for existing ads

2. **View Limits Still Apply:**
   - `maxViewsPerUser` - Still limits total views per user
   - `maxViews` - Still limits total views across all users
   - Repeat intervals work within these limits

3. **Priority:**
   - `minTimeBetweenViews` overrides `repeatInterval` if both are set
   - `maxViewsPerUser` still applies regardless of repeat settings

4. **Session Tracking:**
   - `session` interval uses localStorage (cleared when browser closes)
   - Other intervals use Firestore timestamps

---

## ✅ **SUMMARY**

| Feature | Status |
|---------|--------|
| **Multiple Views Support** | ✅ Implemented |
| **Repeat Intervals** | ✅ 5 options (never, always, daily, weekly, session) |
| **Time-Based Limits** | ✅ Min time between views |
| **Admin UI** | ✅ Full configuration in admin panel |
| **Backward Compatible** | ✅ Existing ads work as before |

---

## 🚀 **HOW TO USE**

1. **For One-Time Ads:** Leave `repeatInterval` as `never` (default)
2. **For Daily Ads:** Set `repeatInterval` to `daily`
3. **For Frequent Ads:** Set `repeatInterval` to `always`
4. **For Custom Timing:** Set `minTimeBetweenViews` in seconds

**You can now configure ads to show multiple times per campaign!** 🎉

