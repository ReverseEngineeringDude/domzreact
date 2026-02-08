
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis'
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Preloader from './components/Preloader';

import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Login from './pages/Login';
import Admin from './pages/Admin';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-10 text-red-500">Something went wrong: {this.state.error?.message}</div>;
    return this.props.children;
  }
}

const Layout = ({ children }) => {
  const location = useLocation();

  // Initialize Lenis Global
  useEffect(() => {
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(lenis.raf)
      lenis.destroy()
    }
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="font-sans text-charcoal bg-bone min-h-screen selection:bg-sage selection:text-white">
      {/* Only show Preloader on initial load? Or every major route change? 
                 For a "Cinematic" feel, let's keep it mounted. If it has internal logic to run once, good.
                 The extracted Preloader runs GSAP on mount. So it will run every time Layout remounts or if we force it.
                 Layout remounts? No, Layout is persistent if wrapped correctly in Routes.
                 However, if we want it to run on every page load (refresh), it works. 
                 If we navigate client-side, Layout stays, so Preloader stays ... but looking at Preloader logic,
                 it hides itself with animation. So it sits there hidden. Perfect.
             */}
      <Preloader />

      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <Navbar />
      <CartDrawer />

      {children}

      <Footer />
    </div>
  );
};

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ShopProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes with Layout */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />

              {/* Auth Routes - No Layout/Navbar/Footer if desired, or wrapped if you want them */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ShopProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
