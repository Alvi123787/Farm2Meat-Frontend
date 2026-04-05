import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
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
import AdminButchers from './pages/AdminButchers'
import WelcomeModal from './components/WelcomeModal';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WelcomeModal />
          <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/all-reviews" element={<AllReviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
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
            <Route index element={<AdminDashboard />} />
            <Route path="add-animal" element={<AddAnimal />} />
            <Route path="edit-animal/:id" element={<AddAnimal />} />
            <Route path="orders" element={<Orders />} />
            <Route path="animals" element={<InventoryPreview />} />
            <Route path="inquiries" element={<RecentInquiriesTable />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="butchers" element={<AdminButchers />} />
          </Route>

          <Route path="/add-animal" element={<Navigate to="/admin/add-animal" replace />} />
          <Route path="/revenue-chart" element={<RevenueChart />} />
          <Route path="/recent-inquiries" element={<Navigate to="/admin/inquiries" replace />} />
          <Route path="/inventory-preview" element={<Navigate to="/admin/animals" replace />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="/verify-email" element={<EmailVerification />} />
        </Routes>
        <Footer />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
