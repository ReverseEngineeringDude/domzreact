
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import CheckoutModal from './CheckoutModal';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from '../assets/firebase';

const CartDrawer = () => {
    // 1. Ensure these are coming from useShop()
    const { cart, updateQty, removeFromCart, subtotal, isCartOpen, setIsCartOpen, clearCart } = useShop();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [coupons, setCoupons] = useState([]);

    // 2. Add an effect to prevent body scroll when cart is open (Good UX)
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isCartOpen]);

    // ... rest of your code

    // Fetch coupons for checkout
    useEffect(() => {
        const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, []);

    const handleCheckout = (details, coupon) => {
        let finalTotal = subtotal;
        if (coupon) finalTotal -= coupon.discountAmount;

        // Construct WhatsApp Message
        const itemsList = cart.map(i => `- ${i.name} (x${i.qty}): ₹${i.price * i.qty}`).join('%0A');
        const couponText = coupon ? `%0A----------%0ACoupon Applied: ${coupon.code} (-₹${coupon.discountAmount})` : "";
        const message = `*New Order from ${details.name}*%0A%0A*Items:*%0A${itemsList}%0A%0A*Subtotal:* ₹${subtotal}${couponText}%0A*Total:* ₹${Math.max(0, finalTotal)}%0A%0A*Shipping Details:*%0A${details.address}, ${details.city} - ${details.zip}%0APhone: ${details.phone}`;

        // Redirect to Admin Logic
        let phone = "918590985286"; // Default
        if (coupon && coupon.adminNumber) {
            phone = "91" + coupon.adminNumber.replace(/\D/g, '');
        }

        const url = `https://wa.me/${phone}?text=${message}`;
        window.open(url, '_blank');
        clearCart();
        setCheckoutOpen(false);
        setIsCartOpen(false);
    };




    return createPortal(
        <div className={`fixed inset-0 z-[99999] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-stone-100">
                    <h2 className="font-serif text-2xl text-charcoal">Your Selection</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-charcoal/40 space-y-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Your bag is empty.</p>
                            <button onClick={() => setIsCartOpen(false)} className="text-sage underline hover:text-charcoal transition-colors">Continue Shopping</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-24 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                                    {item.image && <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-serif font-bold text-charcoal">{item.name}</h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                    <p className="text-xs text-charcoal/50 mb-3">{item.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-stone-50 rounded-full px-2 py-1">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-full transition-colors"><Minus className="w-3 h-3" /></button>
                                            <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-full transition-colors"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <span className="font-medium text-sage">₹{item.price * item.qty}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50/50">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-charcoal/60 uppercase text-xs tracking-widest font-bold">Subtotal</span>
                        <span className="text-xl font-serif text-charcoal">₹{subtotal}</span>
                    </div>
                    <button
                        onClick={() => setCheckoutOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-charcoal text-white font-medium rounded-xl hover:bg-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group"
                    >
                        Proceed to Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {checkoutOpen && (
                <CheckoutModal
                    isOpen={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    onConfirm={handleCheckout}
                    initialData={{}}
                    coupons={coupons}
                />
            )}
        </div>,
        document.body
    );
};

export default CartDrawer;
