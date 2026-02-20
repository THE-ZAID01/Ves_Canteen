import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentMenu from './pages/student/Menu';
import StudentCart from './pages/student/Cart';
import StudentPayment from './pages/student/Payment';
import StudentOrders from './pages/student/Orders';
import StudentOrderDetail from './pages/student/OrderDetail';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorMenu from './pages/vendor/MenuManagement';
import VendorOrders from './pages/vendor/OrdersKanban';
import VendorScanner from './pages/vendor/Scanner';
import VendorAnalytics from './pages/vendor/Analytics';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="STUDENT">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="menu" element={<StudentMenu />} />
        <Route path="cart" element={<StudentCart />} />
        <Route path="payment" element={<StudentPayment />} />
        <Route path="orders" element={<StudentOrders />} />
        <Route path="orders/:orderId" element={<StudentOrderDetail />} />
      </Route>

      {/* Vendor Routes */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute role="VENDOR">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="menu" element={<VendorMenu />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="scanner" element={<VendorScanner />} />
        <Route path="analytics" element={<VendorAnalytics />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
