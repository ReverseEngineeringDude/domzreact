
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Navbar = () => {
    const { cart, setIsCartOpen } = useShop();
    const cartCount = cart.reduce((a, c) => a + c.qty, 0);

    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we are on login page or admin page to maybe hide or change navbar style?
    // For now, keep it consistent.

    useEffect(() => {
        const updateScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", updateScroll);
        return () => window.removeEventListener("scroll", updateScroll);
    }, [lastScrollY]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: visible ? 20 : -100 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
                <div className="glass-heavy rounded-full px-4 md:px-8 py-3 md:py-4 flex items-center gap-6 md:gap-10 pointer-events-auto">
                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-charcoal/80 hover:text-sage transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>

                    <Link to="/" className="font-serif font-bold text-xl md:text-2xl tracking-tighter text-charcoal">
                        Domz<span className="text-sage">.</span>
                    </Link>

                    <div className="hidden md:flex gap-6 text-sm font-medium text-charcoal/60">
                        <Link to="/" className={`hover:text-charcoal transition-colors ${location.pathname === '/' ? 'text-charcoal' : ''}`}>Home</Link>
                        <Link to="/products" className={`hover:text-charcoal transition-colors ${location.pathname === '/products' ? 'text-charcoal' : ''}`}>Shop</Link>
                        <Link to="/about" className={`hover:text-charcoal transition-colors ${location.pathname === '/about' ? 'text-charcoal' : ''}`}>About</Link>
                    </div>

                    <div className="hidden md:block h-4 w-[1px] bg-charcoal/10" />

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)}
                            className="group relative flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-sage transition-colors"
                        >
                            <span className="opacity-0 group-hover:opacity-100 absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest pointer-events-none transition-opacity hidden md:block">Bag</span>
                            <div className="relative">
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-sage text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[60] bg-bone flex flex-col items-center justify-center text-center p-6"
                    >
                        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 p-2 rounded-full bg-charcoal/5 hover:bg-charcoal/10 transition-colors">
                            <X className="w-6 h-6 text-charcoal" />
                        </button>

                        <div className="flex flex-col gap-8">
                            <Link to="/" className="text-4xl font-serif text-charcoal hover:text-sage transition-colors">Home</Link>
                            <Link to="/products" className="text-4xl font-serif text-charcoal hover:text-sage transition-colors">Shop</Link>
                            <Link to="/about" className="text-4xl font-serif text-charcoal hover:text-sage transition-colors">About</Link>
                        </div>

                        <div className="mt-12 flex gap-6">
                            <a href="#" className="text-sm uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors">Instagram</a>
                            <a href="#" className="text-sm uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors">Facebook</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
