# VES Canteen - Digital Queue Management System

A full-stack web application for digitizing canteen ordering and queue management at VES college.

## Features

### Student Side
- Browse menu with category filters (Hot, Special, Usual)
- Add items to cart
- Online payment (UPI deep link) or Offline payment options
- Real-time order tracking with queue position
- QR code receipt for order collection
- Order history

### Vendor Side
- Menu management (CRUD operations)
- Toggle item availability
- Kanban-style order management board
- QR scanner for payment confirmation and order serving
- Analytics dashboard with charts
- Revenue tracking (Online vs Offline)

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Chart.js / react-chartjs-2
- qrcode.react (QR generator)
- html5-qrcode (QR scanner)
- react-hot-toast

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs
- UUID

## Project Structure

```
QueueManager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Menu.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── analyticsRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── student/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Menu.jsx
    │   │   │   ├── Cart.jsx
    │   │   │   ├── Payment.jsx
    │   │   │   ├── Orders.jsx
    │   │   │   └── OrderDetail.jsx
    │   │   └── vendor/
    │   │       ├── Dashboard.jsx
    │   │       ├── MenuManagement.jsx
    │   │       ├── OrdersKanban.jsx
    │   │       ├── Scanner.jsx
    │   │       └── Analytics.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ves_canteen
JWT_SECRET=your_secret_key_here
VENDOR_UPI_ID=yourcanteen@upi
```

4. Start MongoDB (if local):
```bash
mongod
```

5. Start the server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Add item (Vendor)
- `PUT /api/menu/:id` - Update item (Vendor)
- `DELETE /api/menu/:id` - Delete item (Vendor)
- `PATCH /api/menu/:id/availability` - Toggle availability (Vendor)

### Orders
- `POST /api/orders` - Create order (Student)
- `GET /api/orders/my-orders` - Get student's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/all` - Get all orders (Vendor)
- `GET /api/orders/kanban` - Get orders by status (Vendor)
- `POST /api/orders/:id/confirm-payment` - Confirm payment (Student)
- `POST /api/orders/:id/verify-payment` - Verify payment (Vendor)
- `POST /api/orders/scan-payment/:qr_token` - Scan for payment (Vendor)
- `POST /api/orders/:id/mark-paid` - Mark as paid (Vendor)
- `PATCH /api/orders/:id/status` - Update order status (Vendor)
- `POST /api/orders/scan-serve/:qr_token` - Scan to serve (Vendor)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/hourly` - Hourly orders
- `GET /api/analytics/revenue-split` - Revenue by payment mode
- `GET /api/analytics/top-items` - Top selling items
- `GET /api/analytics/daily-summary` - Daily summary

## Order Flow

### Online Payment Flow
1. Student creates order with `payment_mode: ONLINE`
2. UPI deep link generated
3. Student pays via UPI app
4. Student clicks "I Have Paid"
5. Vendor verifies payment
6. Order status: QUEUED → PREPARING → READY → SERVED
7. Student collects from Counter B with QR

### Offline Payment Flow
1. Student creates order with `payment_mode: OFFLINE`
2. Order status: AWAITING_PAYMENT
3. Student goes to Counter A
4. Vendor scans QR and marks as paid
5. Order status: QUEUED → PREPARING → READY → SERVED
6. Student collects from Counter A with QR

## Test Flow

1. Register a vendor account:
   - Email: vendor@ves.ac.in
   - Role: VENDOR

2. Add menu items as vendor

3. Register a student account:
   - Email: student@ves.ac.in
   - Role: STUDENT

4. As student:
   - Browse menu
   - Add items to cart
   - Place order (online/offline)
   - Track order status

5. As vendor:
   - View orders in Kanban
   - Process payments (for offline)
   - Update order status
   - Scan QR to serve

## UI Theme

- Dark café theme with orange accents
- Responsive design
- Smooth animations
- Toast notifications
- Real-time updates (5-second polling)

## License

MIT
