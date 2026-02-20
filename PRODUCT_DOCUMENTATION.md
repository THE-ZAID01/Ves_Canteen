# VES CANTEEN - DIGITAL QUEUE MANAGEMENT SYSTEM
## Complete Product Documentation & Presentation Script

---

# PART 1: PRODUCT OVERVIEW

## 1.1 Product Name
**VES Canteen – Digital Queue Management System**

## 1.2 Tagline
*"Skip the Queue, Not Your Meal!"*

## 1.3 One-Line Description
A full-stack web application that digitizes canteen ordering, eliminates physical queues, and provides real-time order tracking with seamless UPI payments.

## 1.4 Problem Statement
The VES college canteen serves 2000+ students daily but faces critical challenges:
- **Long queues**: 15-20 minutes average waiting time during peak hours
- **Order confusion**: 10% orders have mix-ups due to manual processing
- **Cash delays**: 30% slower service due to cash handling
- **No analytics**: Zero insights into popular items or peak demand
- **Accessibility issues**: Elderly staff and parents with children struggle with queues

## 1.5 Solution
A digital ordering platform with:
- **Mobile-first web app** accessible from any device
- **Role-based access** for Students and Vendors
- **Real-time order tracking** with token numbers
- **UPI payment integration** for cashless transactions
- **QR code verification** for pickup
- **Analytics dashboard** for business insights

---

# PART 2: TECHNICAL ARCHITECTURE

## 2.1 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS 3 | Styling |
| React Router v6 | Navigation |
| Axios | HTTP Client |
| Chart.js | Analytics Charts |
| qrcode.react | QR Code Generation |
| html5-qrcode | QR Code Scanner |
| react-hot-toast | Notifications |
| react-icons | Icon Library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime Environment |
| Express.js 4 | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| uuid | Order ID Generation |
| cors | Cross-Origin Requests |
| dotenv | Environment Config |

## 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Student    │  │   Vendor    │  │    Auth     │              │
│  │  Dashboard  │  │  Dashboard  │  │   Pages     │              │
│  │  - Menu     │  │  - Kanban   │  │  - Login    │              │
│  │  - Cart     │  │  - Menu Mgmt│  │  - Register │              │
│  │  - Orders   │  │  - Scanner  │  │             │              │
│  │  - Payment  │  │  - Analytics│  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │    Menu     │  │   Orders    │              │
│  │  Controller │  │  Controller │  │  Controller │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │  Analytics  │  │ Middleware  │                               │
│  │  Controller │  │  (JWT Auth) │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                          │
│        ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│        │  Users   │  │   Menu   │  │  Orders  │                 │
│        │Collection│  │Collection│  │Collection│                 │
│        └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2.3 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (required, unique, @ves.ac.in),
  password: String (hashed with bcrypt),
  name: String,
  role: Enum ['STUDENT', 'VENDOR'],
  phone: String,
  createdAt: Date
}
```

### Menu Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required),
  category: Enum ['HOT', 'COLD', 'SNACKS', 'MEALS', 'BEVERAGES', 'USUAL', 'SPECIAL'],
  description: String,
  image: String (URL),
  isAvailable: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  order_id: String (UUID, unique),
  student: ObjectId (ref: User),
  student_email: String,
  items: [{
    menuItem: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total_amount: Number,
  payment_mode: Enum ['ONLINE', 'OFFLINE'],
  payment_status: Enum ['PENDING', 'WAITING_FOR_PAYMENT', 'PAID', 'FAILED'],
  order_status: Enum ['CREATED', 'AWAITING_PAYMENT', 'QUEUED', 'PREPARING', 'READY', 'SERVED'],
  counter: String ('A' for offline, 'B' for online),
  qr_token: String (for pickup verification),
  timestamp: Date,
  paid_at: Date,
  prepared_at: Date,
  ready_at: Date,
  served_at: Date
}
```

---

# PART 3: FEATURE BREAKDOWN

## 3.1 Authentication System

### Features
- **VES Email Validation**: Only @ves.ac.in emails allowed
- **Role Selection**: Student or Vendor at registration/login
- **JWT Tokens**: 30-day expiry for session persistence
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Role-based access control

### API Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/profile | Get profile | Private |
| PUT | /api/auth/profile | Update profile | Private |

## 3.2 Menu Management

### Features
- **CRUD Operations**: Add, edit, delete menu items
- **Category System**: HOT, COLD, SNACKS, MEALS, BEVERAGES, SPECIAL
- **Availability Toggle**: Real-time availability updates
- **Image Support**: URL-based menu item images

### API Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/menu | Get all items | Public |
| GET | /api/menu/:id | Get single item | Public |
| POST | /api/menu | Add item | Vendor |
| PUT | /api/menu/:id | Update item | Vendor |
| DELETE | /api/menu/:id | Delete item | Vendor |
| PATCH | /api/menu/:id/availability | Toggle availability | Vendor |

## 3.3 Order System

### Order Flow - Online Payment (Counter B)
```
1. Student browses menu
2. Adds items to cart
3. Proceeds to checkout
4. Selects "Online Payment"
5. Gets UPI deep link/QR
6. Completes payment via UPI app
7. Order status: CREATED → QUEUED
8. Vendor prepares order
9. Status: QUEUED → PREPARING → READY
10. Student shows QR at counter
11. Order marked SERVED
```

### Order Flow - Offline Payment (Counter A)
```
1. Student browses menu
2. Adds items to cart
3. Proceeds to checkout
4. Selects "Pay at Counter"
5. Gets order QR code
6. Goes to counter, shows QR
7. Vendor scans QR
8. Student pays cash/UPI
9. Vendor marks payment received
10. Order enters queue
11. Status: PREPARING → READY → SERVED
```

### Order Statuses
| Status | Description |
|--------|-------------|
| CREATED | Order placed, payment pending (online) |
| AWAITING_PAYMENT | Waiting for offline payment |
| QUEUED | Payment received, in queue |
| PREPARING | Being prepared |
| READY | Ready for pickup |
| SERVED | Delivered to student |

### API Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/orders | Create order | Student |
| GET | /api/orders/my-orders | Get my orders | Student |
| GET | /api/orders/:id | Get single order | Both |
| GET | /api/orders | Get all orders | Vendor |
| GET | /api/orders/kanban | Get Kanban view | Vendor |
| POST | /api/orders/:id/confirm-payment | Student confirms | Student |
| POST | /api/orders/:id/verify-payment | Vendor verifies | Vendor |
| POST | /api/orders/:id/mark-paid | Mark offline paid | Vendor |
| PATCH | /api/orders/:id/status | Update status | Vendor |
| POST | /api/orders/scan-payment/:qr | Scan for payment | Vendor |
| POST | /api/orders/scan-serve/:qr | Scan for pickup | Vendor |
| GET | /api/orders/:id/queue-status | Get queue position | Both |

## 3.4 Payment Integration

### UPI Deep Link
```javascript
upi://pay?pa=${VENDOR_UPI_ID}&pn=VESCanteen&am=${amount}&cu=INR&tn=Order${orderRef}
```

### Payment Modes
1. **Online (Counter B)**
   - UPI deep link opens payment app
   - Student confirms, vendor verifies
   - Order enters queue automatically

2. **Offline (Counter A)**
   - Student gets QR at checkout
   - Shows QR at counter
   - Pays via cash or UPI
   - Vendor confirms receipt

## 3.5 Queue Management

### Features
- **Real-time Queue Position**: Updates every 5 seconds
- **Estimated Wait Time**: 3 minutes per order ahead
- **Counter Assignment**: A (offline) or B (online)
- **Kanban Board**: Visual order management for vendors

### Queue Position Calculation
```javascript
// Orders ahead in queue + preparing
const queuePosition = await Order.countDocuments({
  order_status: { $in: ['QUEUED', 'PREPARING'] },
  paid_at: { $lt: thisOrder.paid_at }
}) + 1;
```

## 3.6 QR Code System

### QR Codes Used
1. **Order QR**: Generated at checkout for identification
2. **Pickup QR**: Same QR used for pickup verification

### Scanner Implementation
- Uses html5-qrcode library
- Camera access for scanning
- Instant verification
- One-time use per order

## 3.7 Analytics Dashboard

### Metrics Provided
- Total orders (today/custom range)
- Online vs Offline split
- Total revenue
- Revenue by payment mode
- Pending orders count
- Ready orders count

### Charts
1. **Hourly Orders**: Line chart of orders per hour
2. **Revenue Split**: Pie chart (Online vs Offline)
3. **Popular Items**: Bar chart of top sellers

### API Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/analytics/dashboard | Dashboard stats | Vendor |
| GET | /api/analytics/hourly | Hourly data | Vendor |
| GET | /api/analytics/revenue-split | Payment split | Vendor |
| GET | /api/analytics/popular-items | Top items | Vendor |
| GET | /api/analytics/category-wise | By category | Vendor |
| GET | /api/analytics/weekly | 7-day trend | Vendor |

---

# PART 4: USER INTERFACE

## 4.1 Student Pages

### Login/Register
- Role selector (Student/Vendor)
- VES email validation
- Password visibility toggle
- Loading states
- Error toasts

### Dashboard
- Welcome message with user name
- Quick stats (active orders, total spent)
- Recent orders preview
- Quick links to menu and orders

### Menu
- Category tabs/filter
- Search functionality
- Grid layout with cards
- Add to cart button
- Quantity selector
- Real-time availability badges

### Cart
- Item list with quantities
- Edit/remove items
- Price breakdown
- Checkout button
- Empty cart state

### Payment
- Order summary
- Payment mode selection
- UPI QR code display (online)
- Order QR code (offline)
- Instructions

### Orders
- Order list with status badges
- Filter by status
- Order cards with items
- View detail link

### Order Detail
- Full order information
- Item breakdown
- Status timeline
- QR code for pickup
- Queue position (if applicable)
- Estimated time

## 4.2 Vendor Pages

### Dashboard
- Today's metrics
- Revenue summary
- Orders overview
- Quick actions

### Menu Management
- Item list table
- Add new item form
- Edit item modal
- Delete confirmation
- Availability toggle
- Category filter

### Orders Kanban
- 5 columns: Awaiting Payment, Queued, Preparing, Ready, Served
- Drag and drop (optional)
- Click to advance status
- Real-time updates (polling)
- Order cards with details

### Scanner
- Camera feed
- Scan mode toggle (Payment/Pickup)
- Scan result display
- Action buttons (Mark Paid/Served)

### Analytics
- Date range selector
- Stat cards
- Hourly chart
- Revenue pie chart
- Popular items chart
- Category breakdown

---

# PART 5: PRESENTATION SCRIPT

## Slide 1: Title
> "Good morning/afternoon everyone. I'm here to present **VES Canteen – Digital Queue Management System**, a full-stack web application designed to revolutionize how our college canteen operates."

## Slide 2: The Problem
> "Let's talk about what happens at our canteen every day:
> - During peak hours, students wait 15-20 minutes in queue
> - About 50% skip the canteen entirely because of these queues
> - 10% of orders have mix-ups due to verbal ordering
> - Cash handling slows things down by 30%
> - Elderly staff and parents with children struggle the most
> 
> These aren't just inconveniences – they affect student productivity, canteen revenue, and overall campus experience."

## Slide 3: Our Solution
> "We built a complete digital ordering system with three main components:
> 1. **Student App**: Browse menu, order, pay, track
> 2. **Vendor Dashboard**: Manage orders, menu, analytics
> 3. **Smart Queue System**: Real-time tracking with QR verification
> 
> The tagline says it all: *Skip the Queue, Not Your Meal!*"

## Slide 4: Demo - Student Flow
> "Let me walk you through the student experience:
> 
> *[Show Login Page]*
> First, students log in with their VES email. The system validates @ves.ac.in emails only.
> 
> *[Show Menu Page]*
> Here's the menu page. Items are organized by category – Hot, Cold, Snacks, Meals. Students can search, filter, and see real-time availability.
> 
> *[Show Cart]*
> Items go into the cart with quantity selection. The system shows a running total.
> 
> *[Show Payment Page]*
> At checkout, students choose: Pay Online via UPI, or Pay at Counter. For online payment, we generate a UPI deep link that opens their payment app directly.
> 
> *[Show Order Tracking]*
> After payment, students see their order status, queue position, and estimated time. The QR code here is used for pickup verification."

## Slide 5: Demo - Vendor Flow
> "Now the vendor side:
> 
> *[Show Kanban Board]*
> This is the heart of operations – a Kanban board showing all orders by status. Vendors click to move orders from Queued to Preparing to Ready.
> 
> *[Show Scanner]*
> When a student comes to pick up, the vendor scans their QR code. The system verifies the order and marks it served. One-time use prevents fraud.
> 
> *[Show Analytics]*
> The analytics dashboard shows orders, revenue, peak hours, and popular items. This helps with inventory planning and menu optimization."

## Slide 6: Technical Architecture
> "Under the hood, we're using:
> - **React.js** with Vite for a fast, responsive frontend
> - **Node.js with Express** for a RESTful API backend
> - **MongoDB** for flexible data storage
> - **JWT** for secure authentication
> - **UPI deep links** for payment integration
> 
> The architecture follows MVC pattern with clear separation between controllers, routes, and models."

## Slide 7: Key Features Summary
> "To summarize our key features:
> 
> **For Students:**
> - Digital menu with real-time availability
> - Cart and checkout system
> - UPI payment integration
> - Real-time order tracking
> - QR code for pickup
> 
> **For Vendors:**
> - Menu management (CRUD)
> - Kanban order management
> - QR scanner for verification
> - Analytics dashboard
> - Revenue tracking"

## Slide 8: Impact & SDG Contribution
> "The expected impact:
> - **60% reduction** in waiting time
> - **99% order accuracy** vs current 90%
> - **Eliminated queues** for elderly and parents
> - **Data-driven** menu optimization
> - **Reduced food waste** through demand prediction
> 
> This aligns with **SDG Goal 9** – Industry, Innovation and Infrastructure – by building smart campus infrastructure and promoting inclusive access."

## Slide 9: Future Roadmap
> "Looking ahead, we plan to add:
> - Native mobile apps (iOS/Android)
> - Push notifications for order status
> - Voice assistance for accessibility
> - Integration with college ERP
> - Expansion to other campus outlets"

## Slide 10: Conclusion & Q&A
> "In conclusion, the VES Canteen Digital Queue Management System transforms a traditional canteen into a modern, efficient, data-driven operation.
> 
> It's built with industry-standard technologies, designed with user experience in mind, and ready for deployment.
> 
> Thank you for your attention. I'm happy to take any questions or provide a live demonstration."

---

# PART 6: DEMO SCRIPT

## 6.1 Live Demo Checklist
Before the demo:
- [ ] Backend server running on port 5001
- [ ] Frontend running on port 3000/3001
- [ ] MongoDB connected
- [ ] Test accounts created (student + vendor)
- [ ] Sample menu items added
- [ ] Browser dev tools closed

## 6.2 Demo Flow (10 minutes)

### Step 1: Introduction (1 min)
- Open browser to landing/login page
- Explain the two user roles

### Step 2: Student Registration/Login (1 min)
- Register a new student (or login)
- Show VES email validation
- Show dashboard after login

### Step 3: Placing an Order (2 min)
- Browse menu by category
- Search for an item
- Add items to cart
- Show cart with quantity adjustment
- Proceed to checkout

### Step 4: Payment (1 min)
- Select Online Payment
- Show UPI deep link (mention it opens payment app)
- Show order confirmation with QR code

### Step 5: Order Tracking (1 min)
- Go to Orders page
- Show order status
- Show queue position and estimated time

### Step 6: Vendor Login (1 min)
- Logout and login as vendor
- Show vendor dashboard

### Step 7: Order Management (2 min)
- Open Kanban board
- Show order in QUEUED column
- Move to PREPARING
- Move to READY
- Show real-time status update

### Step 8: QR Scanning (1 min)
- Open Scanner page
- Demonstrate scan flow
- Mark order as SERVED

### Step 9: Analytics (1 min)
- Show analytics dashboard
- Point out key metrics
- Show hourly chart and revenue split

## 6.3 Backup Plan
If live demo fails:
- Have screenshots/video recording ready
- Use Postman to demonstrate API
- Show code for key features

---

# PART 7: FREQUENTLY ASKED QUESTIONS

## Technical Questions

**Q: Why did you choose React over other frameworks?**
> A: React offers component-based architecture for reusability, a large ecosystem with libraries like Chart.js and QR scanners, excellent developer tools, and strong industry adoption making it a valuable skill.

**Q: How do you handle concurrent orders?**
> A: MongoDB handles concurrent writes natively. Our order IDs use UUID which prevents collision. Queue positions are calculated dynamically at query time, ensuring accuracy.

**Q: What happens if the internet goes down?**
> A: The system requires internet connectivity. However, vendors can fall back to traditional order-taking for offline orders. We recommend the college implement WiFi infrastructure for reliability.

**Q: How is security handled?**
> A: We use JWT tokens for authentication, bcrypt for password hashing, and middleware to protect routes. Sensitive data like passwords are never sent to the client. UPI payments are handled by payment apps, not our system.

**Q: Can this scale to multiple canteens?**
> A: Yes! The architecture supports multi-vendor setup. We would add a `vendor_id` field to menu and orders, and implement vendor-specific dashboards.

## Business Questions

**Q: How does this generate revenue?**
> A: This is a campus utility, not a revenue-generating product. It improves efficiency, reduces waste, and enhances student experience, which indirectly benefits the institution.

**Q: What's the deployment cost?**
> A: Minimal. Frontend can be deployed on Vercel (free), backend on Render or Railway (free tier), and MongoDB Atlas has a free tier. Even at scale, costs would be under ₹1000/month.

**Q: How do you onboard vendors?**
> A: We provide documentation and offer a training session. The UI is intuitive enough for non-technical users. The Kanban board mirrors physical order management.

## Implementation Questions

**Q: How long did this take to build?**
> A: The MVP was built in approximately 2-3 weeks with a team of 4. Production-ready version with testing would take another 2-3 weeks.

**Q: What were the biggest challenges?**
> A: The order state machine (managing transitions), real-time updates without WebSocket (we use polling), and UPI integration (working within deep link limitations).

**Q: What would you do differently?**
> A: We would add WebSocket for true real-time updates, implement offline support with service workers, and build native mobile apps from the start.

---

# APPENDIX A: API REFERENCE

## Authentication APIs
```
POST /api/auth/register
Body: { email, password, name, role, phone }
Response: { _id, email, name, role, token }

POST /api/auth/login  
Body: { email, password, role }
Response: { _id, email, name, role, token }

GET /api/auth/profile
Headers: Authorization: Bearer <token>
Response: { _id, email, name, role, phone }
```

## Menu APIs
```
GET /api/menu?category=HOT&available=true
Response: [{ _id, name, price, category, isAvailable, ... }]

POST /api/menu
Headers: Authorization: Bearer <token>
Body: { name, price, category, description, image }
Response: { _id, name, price, ... }

PATCH /api/menu/:id/availability
Response: { _id, name, isAvailable }
```

## Order APIs
```
POST /api/orders
Body: { items: [{ menuItem, quantity }], payment_mode }
Response: { order_id, items, total_amount, qr_token, upi_link }

GET /api/orders/my-orders
Response: [{ order_id, items, status, queue_position, ... }]

GET /api/orders/kanban
Response: { QUEUED: [...], PREPARING: [...], READY: [...], ... }

PATCH /api/orders/:id/status
Body: { status: 'PREPARING' }
Response: { message, order }

POST /api/orders/scan-serve/:qr_token
Response: { message, order }
```

## Analytics APIs
```
GET /api/analytics/dashboard?startDate=2026-02-01&endDate=2026-02-20
Response: { totalOrders, onlineOrders, totalRevenue, ... }

GET /api/analytics/hourly?date=2026-02-20
Response: [{ hour: 0, orders: 5, revenue: 250 }, ...]

GET /api/analytics/popular-items
Response: [{ name, total_quantity, total_revenue }, ...]
```

---

# APPENDIX B: ENVIRONMENT SETUP

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup
```bash
cd backend
npm install
# Create .env file
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ves_canteen
JWT_SECRET=your_secret_key
VENDOR_UPI_ID=vescanteen@upi

npm run dev  # or node server.js
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

## Test Accounts
```
Student:
  Email: test.student@ves.ac.in
  Password: password123
  Role: STUDENT

Vendor:
  Email: canteen.vendor@ves.ac.in
  Password: vendor123
  Role: VENDOR
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Project: VES Canteen Digital Queue Management System*
*Group: 12*
