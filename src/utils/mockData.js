export const mockFlats = [
    { id: 1, flatNumber: 'A-101', owner: 'Rajesh Kumar', maintenance: 5000, status: 'paid', month: 'January 2026' },
    { id: 2, flatNumber: 'A-102', owner: 'Priya Sharma', maintenance: 5000, status: 'unpaid', month: 'January 2026' },
    { id: 3, flatNumber: 'A-103', owner: 'Amit Patel', maintenance: 6000, status: 'paid', month: 'January 2026' },
    { id: 4, flatNumber: 'B-201', owner: 'Sneha Gupta', maintenance: 4500, status: 'paid', month: 'January 2026' },
    { id: 5, flatNumber: 'B-202', owner: 'Vikram Singh', maintenance: 4500, status: 'unpaid', month: 'January 2026' },
    { id: 6, flatNumber: 'B-203', owner: 'Meena Kumari', maintenance: 6000, status: 'paid', month: 'January 2026' },
    { id: 7, flatNumber: 'C-301', owner: 'Arun Vijay', maintenance: 5500, status: 'paid', month: 'January 2026' },
    { id: 8, flatNumber: 'C-302', owner: 'Kavita Reddy', maintenance: 5500, status: 'unpaid', month: 'January 2026' },
    { id: 9, flatNumber: 'C-303', owner: 'Suresh Menon', maintenance: 5500, status: 'paid', month: 'January 2026' },
    { id: 10, flatNumber: 'D-401', owner: 'Anjali Rao', maintenance: 7000, status: 'paid', month: 'January 2026' },
    { id: 11, flatNumber: 'D-402', owner: 'Rohan Mehta', maintenance: 7000, status: 'unpaid', month: 'January 2026' },
    { id: 12, flatNumber: 'E-501', owner: 'Deepak Chopra', maintenance: 5000, status: 'paid', month: 'January 2026' },
    { id: 13, flatNumber: 'E-502', owner: 'Sunita Williams', maintenance: 5000, status: 'paid', month: 'January 2026' },
    { id: 14, flatNumber: 'F-601', owner: 'John Doe', maintenance: 4800, status: 'unpaid', month: 'January 2026' },
    { id: 15, flatNumber: 'F-602', owner: 'Jane Smith', maintenance: 4800, status: 'paid', month: 'January 2026' },
    { id: 16, flatNumber: 'G-701', owner: 'Robert Brown', maintenance: 5200, status: 'paid', month: 'January 2026' },
    { id: 17, flatNumber: 'G-702', owner: 'Emily Davis', maintenance: 5200, status: 'unpaid', month: 'January 2026' },
    { id: 18, flatNumber: 'H-801', owner: 'Michael Wilson', maintenance: 5500, status: 'paid', month: 'January 2026' },
    { id: 19, flatNumber: 'H-802', owner: 'Sarah Johnson', maintenance: 5500, status: 'paid', month: 'January 2026' },
    { id: 20, flatNumber: 'I-901', owner: 'David Lee', maintenance: 6000, status: 'unpaid', month: 'January 2026' },
    { id: 21, flatNumber: 'I-902', owner: 'Chris Evans', maintenance: 6000, status: 'paid', month: 'January 2026' },
    { id: 22, flatNumber: 'J-1001', owner: 'Tom Holland', maintenance: 6500, status: 'paid', month: 'January 2026' },
    { id: 23, flatNumber: 'J-1002', owner: 'Zendaya Coleman', maintenance: 6500, status: 'unpaid', month: 'January 2026' },
    { id: 24, flatNumber: 'K-1101', owner: 'Scarlett Johansson', maintenance: 7000, status: 'paid', month: 'January 2026' },
    { id: 25, flatNumber: 'K-1102', owner: 'Mark Ruffalo', maintenance: 7000, status: 'paid', month: 'January 2026' },
    { id: 26, flatNumber: 'L-1201', owner: 'Chris Hemsworth', maintenance: 7500, status: 'unpaid', month: 'January 2026' },
    { id: 27, flatNumber: 'L-1202', owner: 'Jeremy Renner', maintenance: 7500, status: 'paid', month: 'January 2026' },
    { id: 28, flatNumber: 'M-1301', owner: 'Paul Rudd', maintenance: 5000, status: 'paid', month: 'January 2026' },
    { id: 29, flatNumber: 'M-1302', owner: 'Evangeline Lilly', maintenance: 5000, status: 'unpaid', month: 'January 2026' },
    { id: 30, flatNumber: 'N-1401', owner: 'Benedict Cumberbatch', maintenance: 8000, status: 'paid', month: 'January 2026' },
    { id: 31, flatNumber: 'N-1402', owner: 'Elizabeth Olsen', maintenance: 8000, status: 'paid', month: 'January 2026' }
];

export const mockComplaints = [
    {
        id: 'C001',
        flatNumber: 'A-102',
        description: 'Water leakage in bathroom',
        status: 'open',
        assignedTo: 'Plumber',
        createdAt: '2026-01-08'
    },
    {
        id: 'C002',
        flatNumber: 'B-203',
        description: 'Lift not working properly',
        status: 'resolved',
        assignedTo: 'Technician',
        createdAt: '2026-01-05'
    },
    {
        id: 'C003',
        flatNumber: 'C-302',
        description: 'Garbage not collected',
        status: 'open',
        assignedTo: 'Housekeeping',
        createdAt: '2026-01-09'
    }
];

export const mockNotices = [
    {
        id: 1,
        title: 'Annual General Meeting',
        date: '2026-01-15',
        type: 'meeting',
        content: 'The AGM will be held at the community hall at 10 AM.',
        status: 'upcoming',
        postedOn: '2026-01-01',
        postedBy: 'Secretary',
        urgent: true
    },
    {
        id: 2,
        title: 'Water Tank Cleaning',
        date: '2026-01-12',
        type: 'maintenance',
        content: 'Water supply will be disrupted from 9 AM to 2 PM.',
        status: 'completed',
        postedOn: '2026-01-05',
        postedBy: 'Admin',
        urgent: false
    }
];

export const mockVisitors = [
    {
        id: 1,
        name: 'Swiggy Delivery',
        flatNumber: 'A-101',
        inTime: '10:30 AM',
        outTime: '10:45 AM',
        status: 'out',
        date: '2026-01-10'
    },
    {
        id: 2,
        name: 'Guest: Ramesh',
        flatNumber: 'B-202',
        inTime: '11:00 AM',
        outTime: '-',
        status: 'in',
        date: '2026-01-10'
    }
];

export const mockApartments = [
    { number: 'A-101', floor: 1, block: 'A' },
    { number: 'A-102', floor: 1, block: 'A' },
    { number: 'B-201', floor: 2, block: 'B' },
    { number: 'B-202', floor: 2, block: 'B' },
    { number: 'C-301', floor: 3, block: 'C' }
];

export const mockAdmins = [
    { id: 1, name: 'Admin User', email: 'admin@nammaveedu.com', role: 'Super Admin', status: 'active' },
    { id: 2, name: 'Manager 1', email: 'manager@nammaveedu.com', role: 'Manager', status: 'active' },
];
