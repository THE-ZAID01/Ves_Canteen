import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  FiHome, FiMenu, FiShoppingCart, FiClipboard, 
  FiLogOut, FiBarChart2, FiCamera, FiUser,
  FiCoffee
} from 'react-icons/fi';

const Layout = () => {
  const { user, logout, isVendor } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/student/menu', icon: FiMenu, label: 'Menu' },
    { to: '/student/cart', icon: FiShoppingCart, label: 'Cart', badge: itemCount },
    { to: '/student/orders', icon: FiClipboard, label: 'Orders' },
  ];

  const vendorLinks = [
    { to: '/vendor', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/vendor/menu', icon: FiMenu, label: 'Menu' },
    { to: '/vendor/orders', icon: FiClipboard, label: 'Orders' },
    { to: '/vendor/scanner', icon: FiCamera, label: 'Scanner' },
    { to: '/vendor/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const links = isVendor ? vendorLinks : studentLinks;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiCoffee className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">VES Canteen</h1>
              <p className="text-xs text-gray-400">Digital Queue System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <link.icon className="text-lg" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <FiUser className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-all duration-200"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
