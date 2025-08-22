import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Checkout from './pages/Checkout'
import ThankYou from './pages/ThankYou'
import Portal from './pages/Portal'
import About from './pages/About'
import Contact from './pages/Contact'
import HowItWorksPage from './pages/HowItWorks'
import TestimonialsPage from './pages/Testimonials'

import Login from './pages/Login'
import NotFound from './pages/NotFound'
import './index.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />

              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </Router>
    </Provider>
  )
}

export default App