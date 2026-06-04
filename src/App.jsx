import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import AdminDashboard from './pages/AdminDashboard'
import AddAnimal from './pages/AddAnimal'
import RevenueChart from './components/RevenueChart'
import RecentInquiriesTable from './components/RecentInquiriesTable'
import InventoryPreview from './components/InventoryPreview'
import Orders from './pages/Orders'
import Confirmation from './components/Confirmation'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailVerification from './pages/EmailVerification'
import AllReviews from './pages/AllReviews'
import HowItWorks from './pages/HowItWorks'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import AdminReviews from './pages/AdminReviews'
import AdminUsers from './pages/AdminUsers'
import AdminGuestUsers from './pages/AdminGuestUsers'
import AdminButchers from './pages/AdminButchers'
import SendingEmail from './pages/SendingEmail'
import WelcomeModal from './components/WelcomeModal';
import UnavailableItem from './pages/UnavailableItem'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext';
import PageTitle from './components/PageTitle';
import UserAnalytics from './pages/UserAnalytics';
import Adminmeatform from './components/Adminmeatform'
import MenuPage from './components/MenuPage'
import FormSelection from './components/FormSelection'



const withPageTitle = (element, title) => (
  <PageTitle title={title}>
    {element}
  </PageTitle>
)

function AppShell() {
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Total duration: 2 to 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1900); // Trigger fade-out slightly after text animation finishes
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <SplashScreen isVisible={showSplash} />
        {location.pathname === '/' && !showSplash && <WelcomeModal />}
        <Navbar />
        <Routes>
          <Route path="/" element={withPageTitle(<Home />, 'Home')} />
          <Route path="/about" element={withPageTitle(<About />, 'About')} />
          <Route path="/how-it-works" element={withPageTitle(<HowItWorks />, 'How It Works')} />
          <Route path="/shop" element={withPageTitle(<Shop />, 'Products')} />
          <Route path="/all-reviews" element={withPageTitle(<AllReviews />, 'Reviews')} />
          <Route path="/contact" element={withPageTitle(<Contact />, 'Contact')} />
          <Route path="/cart" element={withPageTitle(<Cart />, 'Cart')} />
          <Route path="/checkout" element={withPageTitle(<Checkout />, 'Checkout')} />
          <Route path="/order-success" element={withPageTitle(<OrderSuccess />, 'Order Success')} />
          <Route path="/terms" element={withPageTitle(<Terms />, 'Terms')} />
          <Route path="/privacy-policy" element={withPageTitle(<PrivacyPolicy />, 'Privacy Policy')} />
          <Route path="/signup" element={withPageTitle(<Signup />, 'Sign Up')} />
          <Route path="/login" element={withPageTitle(<Login />, 'Login')} />
          <Route path="/shop/:id" element={withPageTitle(<ProductDetail />, 'Product Details')} />
          <Route path="/unavailable-item" element={withPageTitle(<UnavailableItem />, 'Unavailable Item')} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={withPageTitle(<AdminDashboard />, 'Dashboard')} />
            <Route path="add-product" element={withPageTitle(<FormSelection />, 'Select Form')} />
            <Route path="add-product/livestock" element={withPageTitle(<AddAnimal />, 'Add Product')} />
            <Route path="add-product/meat" element={withPageTitle(<Adminmeatform />, 'Add Meat Item')} />
            <Route path="edit-product/:id" element={withPageTitle(<AddAnimal />, 'Edit Product')} />
            <Route path="orders" element={withPageTitle(<Orders />, 'Orders')} />
            <Route path="animals" element={withPageTitle(<InventoryPreview />, 'Inventory')} />
            <Route path="inquiries" element={withPageTitle(<RecentInquiriesTable />, 'Inquiries')} />
            <Route path="reviews" element={withPageTitle(<AdminReviews />, 'Reviews')} />
            <Route path="users" element={withPageTitle(<AdminUsers />, 'Users')} />
            <Route path="guest-users" element={withPageTitle(<AdminGuestUsers />, 'Guest Users')} />
            <Route path="butchers" element={withPageTitle(<AdminButchers />, 'Butchers')} />
            <Route path="send-email" element={withPageTitle(<SendingEmail />, 'Send Email')} />
            <Route path="analytics" element={withPageTitle(<UserAnalytics />, 'User Analytics')} />
          </Route>

          <Route path="/add-animal" element={<Navigate to="/admin/add-animal" replace />} />
          <Route path="/admin-meatform" element={<Navigate to="/admin/add-animal/meat" replace />} />
          <Route path="/menu-page" element={withPageTitle(<MenuPage />, 'Menu Page')} />
          <Route path="/revenue-chart" element={withPageTitle(<RevenueChart />, 'Revenue')} />
          <Route path="/recent-inquiries" element={<Navigate to="/admin/inquiries" replace />} />
          <Route path="/inventory-preview" element={<Navigate to="/admin/animals" replace />} />
          <Route path="/orders" element={withPageTitle(<Orders />, 'Orders')} />
          <Route path="/confirmation" element={withPageTitle(<Confirmation />, 'Confirmation')} />
          <Route path="/forgot-password" element={withPageTitle(<ForgotPassword />, 'Forgot Password')} />
          <Route path="/reset-password/:token" element={withPageTitle(<ResetPassword />, 'Reset Password')} />
          <Route path="/verify-email/:token" element={withPageTitle(<EmailVerification />, 'Verify Email')} />
        </Routes>
        <Footer />
      </CartProvider>
    </AuthProvider>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
