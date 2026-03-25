# 🔐 Test Login Credentials - NammaVeedu

## Quick Test Accounts

Your database seed file has created test accounts you can use to login!

---

## 👨‍💼 **Admin Accounts**

### Admin User
- **Email:** `admin@nammaveedu.in`
- **Password:** `admin@123`
- **Role:** ADMIN
- **Access:** Full admin dashboard and management tools

### Super Admin
- **Email:** `chairmadurai0804@gmail.com`
- **Password:** `Rasukutty0804`
- **Role:** SUPER_ADMIN
- **Access:** Complete system access

---

## 🏠 **Resident Accounts**

### Resident 1 - Rajesh Kumar
- **Email:** `rajesh.kumar@example.com`
- **Mobile:** `9876543210` (normalized from +91 98765 43210)
- **Password:** `resident@123`
- **Flat:** A-101
- **Role:** RESIDENT

### Resident 2 - Meena Iyer
- **Email:** `meena.iyer@example.com`
- **Mobile:** `9884222229` (normalized from +91 98842 22229)
- **Password:** `resident2@123`
- **Flat:** A-202
- **Role:** RESIDENT

### Additional Residents (All have password: `resident@123`)
1. **Durai** - `durai@example.com` - Mobile: `9894100001` - Flat: A-301
2. **Hemesh** - `hemesh@example.com` - Mobile: `9894100002` - Flat: A-302
3. **Karthi** - `karthi@example.com` - Mobile: `9894100003` - Flat: A-303
4. **Nixon** - `nixon@example.com` - Mobile: `9894100004` - Flat: A-304
5. **Prince** - `prince@example.com` - Mobile: `9894100005` - Flat: A-305
6. **Sam** - `sam@example.com` - Mobile: `9894100006` - Flat: A-306

---

## 🧪 How to Test Login

### **Step 1: Ensure Database is Seeded**

If you haven't seeded the database yet:

```bash
cd server
npx prisma db push
npx prisma db seed
```

### **Step 2: Test Admin Login**

1. Go to: `http://localhost:5173/login`
2. Click **"Admin Login"**
3. Enter:
   - Email: `admin@nammaveedu.in`
   - Password: `admin@123`
4. Click **"Sign In as Admin"**
5. ✅ Should redirect to `/admin/dashboard`

### **Step 3: Test Resident Login (Email)**

1. Go to: `http://localhost:5173/login`
2. Click **"Resident Login"**
3. Enter:
   - Email: `rajesh.kumar@example.com`
   - Password: `resident@123`
4. Click **"Sign In as Resident"**
5. ✅ Should redirect to `/resident/dashboard`

### **Step 4: Test Resident Login (Mobile)**

1. Go to: `http://localhost:5173/login`
2. Click **"Resident Login"**
3. Enter:
   - Mobile: `9876543210`
   - Password: `resident@123`
4. Click **"Sign In as Resident"**
5. ✅ Should redirect to `/resident/dashboard`

---

## 📊 What Data is Available

After seeding, your database will have:

### **Users:** 9 total
- 1 Admin
- 1 Super Admin
- 7 Residents

### **Flats:** 9 total
- A-101, A-102, A-202
- A-301, A-302, A-303, A-304, A-305, A-306

### **Notices:** 3
- Annual General Meeting (Upcoming)
- Pongal Celebration (Ongoing)
- Water Tank Cleaning (Completed)

### **Complaints:** 9
- Various complaints from residents
- Some with comments from admin

### **Maintenance Records:** Multiple entries
- Paid and pending status
- Different amounts per flat

### **Visitors:** Multiple entries
- Deliveries, services, guests
- In and out status

### **Pre-approvals:** 3
- Guest and delivery approvals

---

## 🔍 Verify Database

### **Check if seed was successful:**

```bash
cd server
npx prisma studio
```

This opens a GUI where you can:
- View all users
- Check passwords are hashed
- See all data relationships

---

## 🐛 Troubleshooting

### **"Invalid credentials" error**

**Possible causes:**
1. Database not seeded
2. Wrong password
3. Email/mobile typo

**Fix:**
```bash
cd server
npx prisma db seed
```

### **"Unable to connect to server"**

**Cause:** Backend not running

**Fix:**
```bash
cd server
npm run dev
```

### **Mobile number not working**

**Note:** Backend normalizes phone numbers to last 10 digits

**These all work for Rajesh:**
- `9876543210` ✅
- `+919876543210` ✅ (normalized)
- `+91 98765 43210` ✅ (spaces removed)

---

## 🎯 Testing Checklist

- [ ] Backend server running (port 4000)
- [ ] Frontend server running (port 5173)
- [ ] Database seeded with test data
- [ ] Admin login works
- [ ] Resident login with email works
- [ ] Resident login with mobile works
- [ ] Redirects to correct dashboard
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage

---

## 📝 Quick Commands

### **Seed Database**
```bash
cd server
npx prisma db seed
```

### **Reset Database (if needed)**
```bash
cd server
npx prisma migrate reset
```

### **View Database**
```bash
cd server
npx prisma studio
```

### **Check Backend**
```bash
curl http://localhost:4000/health
```

---

## ✅ Expected Behavior

### **After Successful Login:**

**localStorage will contain:**
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userRole": "ADMIN" or "RESIDENT",
  "userId": "clx...",
  "userName": "Community Admin" or "Rajesh Kumar",
  "userEmail": "admin@nammaveedu.in" or "rajesh.kumar@example.com"
}
```

**Console will show:**
```
Login successful!
Navigating to /admin/dashboard or /resident/dashboard
```

**Browser will redirect to:**
- Admin: `http://localhost:5173/admin/dashboard`
- Resident: `http://localhost:5173/resident/dashboard`

---

## 🎉 Ready to Test!

**Everything is set up and ready to go!**

1. ✅ Backend API running
2. ✅ Frontend UI v2 running
3. ✅ Database schema ready
4. ✅ Test data seeded
5. ✅ Login integration complete

**Just seed the database and start testing!** 🚀

---

**Created:** January 14, 2026  
**Last Updated:** January 14, 2026  
**Status:** ✅ READY FOR TESTING
