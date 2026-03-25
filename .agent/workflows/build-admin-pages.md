---
description: Build all admin pages with consistent UI/UX
---

# Admin Pages Implementation Workflow

This workflow guides the creation of all admin pages with consistent black/dark gray theme and functionality.

## Design Principles
- **Color Palette**: Pure black (#000000), #0a0a0a, #0f0f0f, #141414, #181818, #1f1f1f
- **Responsive Design**: Mobile-first approach
- **Consistent Layout**: Sidebar navigation + main content area
- **Database Integration**: All data fetched from backend APIs
- **Functional Buttons**: All actions connect to backend

## Pages to Build

### 1. Flats Page (`/flats`)
**API**: `GET /api/admin/flats`, `PUT /api/admin/flats/:id`, `DELETE /api/admin/flats/:id`

**Features**:
- Table displaying: Flat Number, Owner, Mobile, Maintenance Status, Active Complaints
- Click complaints count → navigate to filtered complaints page
- Edit button → modal to edit flat details
- Delete button with confirmation
- Search/filter by flat number, owner name
- Sort by columns
- Add new flat button

### 2. Maintenance Page (`/maintenance`)
**API**: `GET /api/admin/maintenance`, `PUT /api/admin/maintenance/:id`

**Features**:
- Table displaying: Flat Number, Owner, Month, Amount, Status, Paid Date
- Filter by status (Paid/Pending), month
- Edit status → triggers receipt generation if marking as paid
- Generate e-receipt button for paid entries
- Search by flat number/owner
- Export to PDF/Excel

### 3. Complaints Page (`/complaints`)
**API**: `GET /api/admin/complaints`, `PUT /api/admin/complaints/:id`

**Features**:
- Card/List view of all complaints
- Display: Description, Flat Number, Status, Created Date, Assigned To
- Edit modal: Change status, assign to someone
- Status change → sends notification to resident
- Filter by status (Open, In Progress, Resolved)
- Search by description/flat number
- View comments/history

### 4. Notices Page (`/notices`)
**API**: `GET /api/notices`, `POST /api/notices`, `PUT /api/notices/:id`, `DELETE /api/notices/:id`

**Features**:
- Create new notice form
- List all notices with status badges
- Edit/Delete buttons
- Creating notice → sends notification to all residents
- Fields: Title, Description, Date, Time, Location, Status
- Filter by status (Upcoming, Ongoing, Completed)

### 5. Visitors Page (`/visitors`)
**API**: `GET /api/admin/visitors`, `POST /api/admin/visitors`, `PUT /api/admin/visitors/:id/checkout`, `GET /api/admin/pre-approvals`

**Features**:
- Log new visitor form
- Table of all visitors: Name, Flat, Purpose, In Time, Out Time, Status
- Pre-approved visitors section (separate table)
- Check-out button for active visitors
- Search by name/flat
- Filter by status (In/Out), date range

### 6. Create Resident Page (`/admin/residents/create`)
**API**: `POST /api/admin/residents`

**Features**:
- Form with fields: Name, Email, Phone, Flat Number, Family Members
- Auto-generate credentials
- Submit → creates user + resident + flat association in DB
- Success message with login credentials
- Validation for all fields

### 7. Reports Page (`/reports`)
**API**: `POST /api/admin/reports/generate` (if exists, or mock data)

**Features**:
- Date range selector
- Generate report button
- Display analytics:
  - Total complaints resolved
  - Maintenance collection rate
  - Visitor statistics
  - Active residents
- Export to PDF
- Visualizations (charts)

### 8. Settings Page (`/settings`)
**API**: `GET /api/admin/settings`, `PUT /api/admin/settings`

**Features**:
- Society information section
- Admin profile settings
- Notification preferences
- Maintenance amount settings
- System preferences
- Password change

## Implementation Steps

// turbo-all
1. Create Flats page with table and CRUD operations
2. Create Maintenance page with status management
3. Create Complaints page with status/assignment editing
4. Create Notices page with create/edit functionality
5. Create Visitors page with logging system
6. Create Create Resident page with form
7. Create Reports page with analytics
8. Create Settings page with preferences
9. Update routing in App-v2.jsx
10. Test all pages for responsiveness and functionality
