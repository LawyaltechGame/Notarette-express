import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Checkout from './pages/Checkout'
import PostCheckout from './routes/PostCheckout'
import ThankYou from './routes/ThankYou'
import Portal from './pages/Portal'
import About from './pages/About'
import Contact from './pages/Contact'
import HowItWorksPage from './pages/HowItWorks'
import TestimonialsPage from './pages/Testimonials'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Register from './pages/Register'
import PaymentSuccess from './pages/PaymentSuccess'
import NotFound from './pages/NotFound'
import './index.css'

// Note: About, Contact, and How It Works pages are hidden from navigation
// but kept in the code since they already exist on the WordPress website.
// Users will come from WordPress to this service-specific application.

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Default route - redirect to services if authenticated, login if not */}
                <Route path="/" element={
                  <ProtectedRoute requireAuth={false}>
                    <Navigate to="/services" replace />
                  </ProtectedRoute>
                } />
                
                {/* Public routes - redirect to services if already authenticated */}
                <Route path="/login" element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } />
                <Route path="/register" element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes - require authentication */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/services" element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                } />
                <Route path="/services/:slug" element={
                  <ProtectedRoute>
                    <ServiceDetail />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/payment-success" element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/thank-you" element={
                  <ProtectedRoute>
                    <ThankYou />
                  </ProtectedRoute>
                } />
                <Route path="/portal" element={
                  <ProtectedRoute>
                    <Portal />
                  </ProtectedRoute>
                } />
                
                {/* Stripe post-checkout verification routes - no auth required */}
                <Route path="/post-checkout" element={<PostCheckout />} />
                
                {/* Hidden routes - these pages exist on WordPress website */}
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={
                  <ProtectedRoute>
                    <Contact />
                  </ProtectedRoute>
                } />
                <Route path="/how-it-works" element={
                  <ProtectedRoute>
                    <HowItWorksPage />
                  </ProtectedRoute>
                } />
                <Route path="/testimonials" element={
                  <ProtectedRoute>
                    <TestimonialsPage />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={
                  <ProtectedRoute>
                    <FAQ />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  )
}

export default App