
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, onConfirm, initialData, coupons }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        zip: initialData.zip || ""
    });

    // Coupon inputs
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = () => {
        setCouponError("");
        const code = couponCode.trim();
        if (!code) return;

        // Find coupon in coupons list (case sensitive or not? usually case sensitive or uppercase)
        const found = coupons.find(c => c.code === code);
        if (found) {
            setAppliedCoupon(found);
        } else {
            setCouponError("Invalid Coupon Code");
            setAppliedCoupon(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Please fill in required fields.");
            return;
        }
        onConfirm(formData, appliedCoupon);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50"
            >
                <div className="p-6 border-b border-charcoal/5 flex justify-between items-center bg-stone-50/50">
                    <h3 className="text-xl font-serif font-bold text-charcoal">Shipping & Offers</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200/50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Form Fields */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">Your Details</h4>
                        <input name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
                        <input name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
                        <input name="address" placeholder="Address *" value={formData.address} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
                            <input name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="h-[1px] bg-charcoal/5 w-full" />

                    {/* Coupon Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">Have a Coupon?</h4>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter Code"
                                className="flex-1 p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none uppercase tracking-wider placeholder:normal-case"
                            />
                            <button onClick={handleApplyCoupon} type="button" className="px-6 bg-charcoal text-white rounded-xl hover:bg-sage transition-colors font-medium text-sm">Apply</button>
                        </div>

                        {couponError && <p className="text-red-500 text-sm pl-1">{couponError}</p>}

                        {appliedCoupon && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-sage/10 rounded-xl border border-sage/20 flex justify-between items-center text-sage-dark">
                                <div>
                                    <span className="font-bold block text-charcoal">Coupon Applied!</span>
                                    <span className="text-xs">Saving ₹{appliedCoupon.discountAmount}</span>
                                </div>
                                <CheckCircle className="w-5 h-5 text-sage" />
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-charcoal/5 bg-stone-50/50 flex justify-end gap-4">
                    {!appliedCoupon && <span className="text-xs text-charcoal/40 self-center">No coupon applied</span>}
                    <button onClick={handleSubmit} className="px-8 py-3 bg-charcoal text-white font-bold rounded-xl hover:bg-sage transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Confirm & Order
                    </button>
                </div>
            </motion.div>

        </motion.div>
    )
}

export default CheckoutModal;
