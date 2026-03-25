# UI v2 - New Design Layer

## Overview
This directory contains the new UI/UX design layer for NammaVeedu. The backend APIs remain **locked and unchanged** to ensure stability while the new interface is being developed.

## Directory Structure

```
src/
├── pages/              # Original UI (v1) - DO NOT MODIFY
├── pages-v2/           # New UI (v2) - ACTIVE DEVELOPMENT
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── Flats.jsx
│   │   ├── Maintenance.jsx
│   │   ├── Complaints.jsx
│   │   ├── Notices.jsx
│   │   ├── Visitors.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   ├── SuperAdmin.jsx
│   │   └── CreateResident.jsx
│   └── resident/
│       ├── Dashboard.jsx
│       ├── RaiseComplaint.jsx
│       ├── MyComplaints.jsx
│       ├── ComplaintDetail.jsx
│       ├── Visitors.jsx
│       ├── Notices.jsx
│       └── Settings.jsx
├── App.jsx             # Original routing (v1)
└── App-v2.jsx          # New routing (v2)
```

## Pages Inventory

### Public Pages (2)
1. **Landing** - Main landing page
2. **Login** - User authentication page

### Admin Pages (10)
1. **Dashboard** - Admin overview and analytics
2. **Flats** - Flat/apartment management
3. **Maintenance** - Maintenance fee tracking
4. **Complaints** - Complaint management system
5. **Notices** - Notice board management
6. **Visitors** - Visitor tracking system
7. **Reports** - Generate and view reports
8. **Settings** - Admin settings and configuration
9. **SuperAdmin** - Super admin controls
10. **CreateResident** - Add new residents

### Resident Pages (7)
1. **Dashboard** - Resident personal dashboard
2. **RaiseComplaint** - Submit new complaints
3. **MyComplaints** - View personal complaints
4. **ComplaintDetail** - Detailed complaint view
5. **Visitors** - Manage visitor approvals
6. **Notices** - View community notices
7. **Settings** - Personal settings

## How to Switch to UI v2

### Option 1: Temporary Switch (Recommended for Testing)
```bash
# Backup current App.jsx
cp src/App.jsx src/App-v1-backup.jsx

# Use the new UI
cp src/App-v2.jsx src/App.jsx

# To revert back
cp src/App-v1-backup.jsx src/App.jsx
```

### Option 2: Direct Edit
Manually update `src/main.jsx` to import from `App-v2` instead of `App`:
```javascript
// Change this:
import App from './App'

// To this:
import App from './App-v2'
```

## Development Guidelines

### 🔒 Backend API Rules
- **DO NOT** modify any files in the `server/` directory
- **DO NOT** change API endpoints or request/response formats
- **DO NOT** alter database schemas or models
- All backend logic is **LOCKED**

### ✅ What You Can Do
- Design new UI components in `pages-v2/`
- Create new styling and layouts
- Add new UI components in `components/`
- Modify CSS/Tailwind classes
- Improve user experience and interactions
- Add animations and transitions

### 🎨 Design Approach
Each page in `pages-v2/` is currently a blank template with:
- Modern gradient background
- Glassmorphism card design
- Responsive layout structure
- Ready for your custom design

### 📝 Best Practices
1. **Keep API calls unchanged** - Use the same API structure as v1
2. **Maintain route structure** - URLs should remain the same
3. **Preserve functionality** - All features should work as before
4. **Enhance UX** - Focus on improving the user experience
5. **Document changes** - Comment your design decisions

## Current Status
✅ Directory structure created  
✅ All 19 blank page templates created  
✅ Routing configuration (App-v2.jsx) ready  
⏳ UI/UX design - **READY FOR DEVELOPMENT**  
🔒 Backend APIs - **LOCKED**  

## Next Steps
1. Choose a design system (Material UI, Chakra UI, or custom)
2. Create reusable UI components
3. Design each page starting with the most critical ones:
   - Landing page
   - Login page
   - Admin Dashboard
   - Resident Dashboard
4. Test thoroughly with existing backend APIs
5. Gather user feedback
6. Iterate and improve

## Notes
- Original UI (v1) remains intact in `src/pages/`
- You can reference v1 code for API integration patterns
- Backend APIs in `server/` directory are production-ready
- Focus on creating a beautiful, intuitive interface

---
**Created:** January 14, 2026  
**Version:** 2.0.0  
**Status:** Development Ready
