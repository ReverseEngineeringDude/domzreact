
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from '../assets/firebase';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Local auth state check to redirect if already logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) navigate('/admin');
        });
        return unsubscribe;
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation handled by useEffect
        } catch (error) {
            console.error("Login failed", error);
            setError(error.message);
        }
    };

    if (loading) return null; // Or a spinner

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center font-sans relative overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-sage/20 rounded-full blur-[100px]" />

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full max-w-md p-8 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-charcoal/5 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-charcoal" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">Control Center</h2>
                    <p className="text-charcoal/50">Authenticate to manage essence.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <div className="p-3 text-red-500 bg-red-50 rounded-lg text-sm text-center">{error}</div>}
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-white/60 border border-transparent focus:border-sage outline-none transition-all placeholder:text-charcoal/30" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-white/60 border border-transparent focus:border-sage outline-none transition-all placeholder:text-charcoal/30" />

                    <button type="submit" className="w-full py-4 bg-charcoal text-white font-medium rounded-xl hover:bg-sage transition-colors shadow-lg">
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-charcoal/30 uppercase tracking-widest">
                    <Link to="/" className="hover:text-sage transition-colors">← Return to Gravity</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
