# NammaVeedu - UI v2 Architecture

## 🏗️ Complete Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NammaVeedu Project                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│   Frontend   │                        │   Backend    │
│   (React)    │◄──────── API ─────────►│  (Node.js)   │
└──────────────┘      Calls             └──────────────┘
        │                                       │
        │                                  🔒 LOCKED
        │                                  DO NOT MODIFY
        │
        ├─── UI v1 (Original) ───────────────────┐
        │    src/pages/                           │
        │    ├── Landing.jsx                      │
        │    ├── Login.jsx                        │
        │    ├── admin/ (10 pages)                │
        │    └── resident/ (7 pages)              │
        │                                         │
        └─── UI v2 (New Design) ─────────────────┤
             src/pages-v2/                        │
             ├── Landing.jsx          ✨ NEW      │
             ├── Login.jsx            ✨ NEW      │
             ├── admin/ (10 pages)    ✨ NEW      │
             └── resident/ (7 pages)  ✨ NEW      │
                                                  │
┌─────────────────────────────────────────────────┘
│
│  Routing Configuration
│  ├── App.jsx (Current - v1)
│  ├── App-v1.jsx (Backup)
│  └── App-v2.jsx (New UI v2) ✨
│
└─────────────────────────────────────────────────┐
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   Browser    │
                                          │   Display    │
                                          └──────────────┘
```

## 🔄 Routing Flow

### Current Setup (v1)
```
User Request → App.jsx → pages/ → Backend API → Response
```

### New Setup (v2) - After Activation
```
User Request → App-v2.jsx → pages-v2/ → Backend API → Response
                                              ▲
                                              │
                                         Same APIs
                                         (Unchanged)
```

## 📦 Page Mapping

### Public Routes
```
Route: /              → Landing.jsx
Route: /login         → Login.jsx
```

### Admin Routes
```
Route: /admin/dashboard           → admin/Dashboard.jsx
Route: /flats                     → admin/Flats.jsx
Route: /maintenance               → admin/Maintenance.jsx
Route: /complaints                → admin/Complaints.jsx
Route: /notices                   → admin/Notices.jsx
Route: /visitors                  → admin/Visitors.jsx
Route: /reports                   → admin/Reports.jsx
Route: /settings                  → admin/Settings.jsx
Route: /super-admin               → admin/SuperAdmin.jsx
Route: /admin/residents/create    → admin/CreateResident.jsx
```

### Resident Routes
```
Route: /resident/dashboard        → resident/Dashboard.jsx
Route: /resident/complaints/new   → resident/RaiseComplaint.jsx
Route: /resident/complaints       → resident/MyComplaints.jsx
Route: /resident/complaints/:id   → resident/ComplaintDetail.jsx
Route: /resident/visitors         → resident/Visitors.jsx
Route: /resident/notices          → resident/Notices.jsx
Route: /resident/settings         → resident/Settings.jsx
```

## 🎨 Design System Structure

```
┌─────────────────────────────────────────┐
│         Design System (To Build)        │
├─────────────────────────────────────────┤
│                                         │
│  Colors                                 │
│  ├── Primary (Purple gradient)          │
│  ├── Secondary                          │
│  ├── Success / Warning / Error          │
│  └── Neutral (Grays)                    │
│                                         │
│  Typography                             │
│  ├── Headings (h1-h6)                   │
│  ├── Body text                          │
│  └── Captions                           │
│                                         │
│  Components                             │
│  ├── Layout                             │
│  │   ├── Header                         │
│  │   ├── Sidebar                        │
│  │   ├── Footer                         │
│  │   └── Container                      │
│  │                                      │
│  ├── UI Elements                        │
│  │   ├── Buttons                        │
│  │   ├── Cards                          │
│  │   ├── Forms                          │
│  │   ├── Tables                         │
│  │   └── Modals                         │
│  │                                      │
│  └── Feature Components                 │
│      ├── Dashboard Widgets              │
│      ├── Charts                         │
│      ├── Data Tables                    │
│      └── Status Badges                  │
│                                         │
└─────────────────────────────────────────┘
```

## 🔐 Security & Data Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │─────►│  UI v2   │─────►│   API    │─────►│ Database │
│  Action  │      │  Pages   │      │ Endpoint │      │          │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                       │                  ▲                  │
                       │                  │                  │
                       │            🔒 LOCKED           🔒 LOCKED
                       │            DO NOT MODIFY       DO NOT MODIFY
                       │
                  ✨ MODIFY HERE
                  Design & UX Only
```

## 📂 File Organization

```
NammaVeedu/
│
├── 📄 Documentation
│   ├── QUICK-REFERENCE.md      ← Quick commands & info
│   ├── MIGRATION-GUIDE.md      ← How to switch versions
│   ├── UI-V2-SUMMARY.md        ← Complete implementation
│   └── ARCHITECTURE.md         ← This file
│
├── 🔧 Configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
├── 🎨 Frontend (src/)
│   ├── pages/                  ← Original UI (v1)
│   ├── pages-v2/               ← New UI (v2) ✨
│   ├── components/             ← Shared components
│   ├── context/                ← React context
│   ├── utils/                  ← Utility functions
│   ├── App.jsx                 ← Current routing
│   ├── App-v1.jsx              ← Backup routing
│   ├── App-v2.jsx              ← New routing ✨
│   └── main.jsx                ← Entry point
│
└── 🔒 Backend (server/)
    ├── routes/                 ← API routes
    ├── models/                 ← Database models
    ├── controllers/            ← Business logic
    └── middleware/             ← Auth, validation, etc.
    
    ⚠️ DO NOT MODIFY ANYTHING IN server/
```

## 🚀 Development Workflow

```
1. Design Phase
   │
   ├─► Choose page to design
   ├─► Open in pages-v2/
   ├─► Design UI components
   └─► Style with Tailwind CSS
   
2. Integration Phase
   │
   ├─► Reference pages/ for API calls
   ├─► Keep same API structure
   ├─► Test with backend
   └─► Verify functionality
   
3. Testing Phase
   │
   ├─► Test responsive design
   ├─► Verify all user flows
   ├─► Check API integrations
   └─► Fix any issues
   
4. Deployment Phase
   │
   ├─► Activate UI v2
   ├─► Monitor for issues
   ├─► Gather feedback
   └─► Iterate improvements
```

## 🎯 Current Status

```
┌─────────────────────────────────────────┐
│         Implementation Status           │
├─────────────────────────────────────────┤
│ ✅ Backend APIs         LOCKED          │
│ ✅ Directory Structure  COMPLETE        │
│ ✅ 19 Blank Pages       CREATED         │
│ ✅ Routing Config       READY           │
│ ✅ Documentation        COMPLETE        │
│ ⏳ UI Design            PENDING         │
│ ⏳ Component Library    PENDING         │
│ ⏳ Testing              PENDING         │
│ ⏳ Deployment           PENDING         │
└─────────────────────────────────────────┘
```

## 💡 Key Principles

1. **Separation of Concerns**
   - UI v1 and v2 are completely separate
   - Backend remains unchanged
   - Easy to switch between versions

2. **Progressive Enhancement**
   - Start with basic functionality
   - Add advanced features gradually
   - Maintain backward compatibility

3. **API Consistency**
   - Same endpoints as v1
   - Same request/response formats
   - No breaking changes

4. **User Experience**
   - Modern, beautiful design
   - Smooth animations
   - Responsive on all devices
   - Accessible to all users

---

**Architecture is complete and ready for development! 🎉**

*Last Updated: January 14, 2026*
