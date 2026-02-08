
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from '../assets/firebase';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('domz_cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [appLoaded, setAppLoaded] = useState(false);

    // Fetch Products
    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Persist Cart
    useEffect(() => {
        localStorage.setItem('domz_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        console.log("Adding to cart:", product);
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const value = {
        products,
        loading,
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        setIsCartOpen,
        isCartOpen,
        subtotal,
        appLoaded,
        setAppLoaded
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
