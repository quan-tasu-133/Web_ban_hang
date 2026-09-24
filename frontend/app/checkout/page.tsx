"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { cart, loading: cartLoading, clearCart } = useCart();

    // Form states
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANKING">("COD");

    // Coupon states
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
        discount_type: string;
        discount_value: number;
    } | null>(null);
    const [couponError, setCouponError] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Submitting order state
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Auto-fill user's info if available
    useEffect(() => {
        if (user) {
            if (!customerName && user.name) setCustomerName(user.name);
            if (!customerPhone && user.phone) setCustomerPhone(user.phone);
            if (!customerAddress && user.address) setCustomerAddress(user.address);
        }
    }, [user, customerName, customerPhone, customerAddress]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [user, authLoading, router]);

    const subtotal = cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    // Áp dụng mã giảm giá
    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponInput.trim()) return;

        setCouponError("");
        setApplyingCoupon(true);

        try {
            const response = await fetch("http://localhost:5000/coupons/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: couponInput.trim().toUpperCase(),
                    orderTotal: subtotal
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Mã giảm giá không hợp lệ");
            }

            setAppliedCoupon({
                code: data.coupon.code,
                discountAmount: data.coupon.discountAmount,
                discount_type: data.coupon.discount_type,
                discount_value: data.coupon.discount_value
            });
            setCouponInput("");

        } catch (err: unknown) {
            setCouponError(err instanceof Error ? err.message : "Không thể áp dụng mã");
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
    };

    // Xác nhận đặt hàng
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
            setErrorMessage("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.");
            return;
        }

        setErrorMessage("");
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                    customerAddress: customerAddress.trim(),
                    paymentMethod,
                    couponCode: appliedCoupon ? appliedCoupon.code : null,
                    note: note.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đặt hàng thất bại");
            }

            // Dọn sạch giỏ hàng client context
            await clearCart();

            // Chuyển hướng sang trang đặt hàng thành công
            router.push(`/order-success/${data.order.id}`);

        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xử lý đặt hàng");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || cartLoading) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center">
                <p>Đang tải thông tin thanh toán...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
                <p className="text-gray-500 mb-6">Hãy chọn những chiếc điện thoại ưng ý trước khi thanh toán nhé.</p>
                <Link
                    href="/"
                    className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800"
                >
                    Khám phá sản phẩm ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">

            <div className="mb-8">
                <Link href="/cart" className="text-sm text-gray-500 hover:text-black">
                    ← Quay lại Giỏ hàng
                </Link>
                <h1 className="text-3xl font-bold mt-2">
                    Thanh toán đơn hàng
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* CỘT TRÁI: FORM THÔNG TIN GIAO HÀNG */}
                <div className="lg:col-span-7 space-y-6">

                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">

                        {/* 1. THÔNG TIN KHÁCH HÀNG */}
                        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                📍 Thông tin người nhận
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên người nhận *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại liên hệ *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0987654321"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ nhận hàng chi tiết *
                                </label>
                                <textarea
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ghi chú đơn hàng (Tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        {/* 2. PHƯƠNG THỨC THANH TOÁN */}
                        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                💳 Phương thức thanh toán
                            </h2>

                            <div className="space-y-3">
                                <label className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                                    paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-200"
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                        className="w-4 h-4 text-black"
                                    />
                                    <div>
                                        <p className="font-semibold">💵 Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-500">Khách hàng kiểm tra hàng và thanh toán tiền mặt trực tiếp cho shipper.</p>
                                    </div>
                                </label>

                                <label className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                                    paymentMethod === "BANKING" ? "border-black bg-gray-50" : "border-gray-200"
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANKING"
                                        checked={paymentMethod === "BANKING"}
                                        onChange={() => setPaymentMethod("BANKING")}
                                        className="w-4 h-4 text-black"
                                    />
                                    <div>
                                        <p className="font-semibold">🏦 Chuyển khoản ngân hàng (VietQR)</p>
                                        <p className="text-sm text-gray-500">Quét mã QR hoặc chuyển khoản nhanh 24/7 sau khi bấm đặt hàng.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </form>

                </div>

                {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ GIẢM GIÁ */}
                <div className="lg:col-span-5 space-y-6">

                    <div className="border rounded-xl p-6 bg-gray-50 shadow-sm sticky top-24 space-y-6">
                        <h2 className="text-lg font-bold">
                            Tóm tắt đơn hàng ({cart.length} sản phẩm)
                        </h2>

                        {/* DANH SÁCH MÓN */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 pr-2">
                            {cart.map((item) => (
                                <div key={item.product_id} className="py-3 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded border flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">Ảnh</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">SL: x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold whitespace-nowrap">
                                        {(Number(item.price) * item.quantity).toLocaleString("vi-VN")} ₫
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Ô NHẬP MÃ GIẢM GIÁ */}
                        <div className="pt-2 border-t border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🎟️ Mã giảm giá
                            </label>

                            {!appliedCoupon ? (
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã (vd: GIAM100K, SALE10)"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase bg-white outline-none focus:ring-2 focus:ring-black font-semibold"
                                    />
                                    <button
                                        type="submit"
                                        disabled={applyingCoupon || !couponInput.trim()}
                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {applyingCoupon ? "..." : "Áp dụng"}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-green-700 text-sm">
                                            ✓ {appliedCoupon.code}
                                        </span>
                                        <p className="text-xs text-green-600 mt-0.5">
                                            Đã giảm {appliedCoupon.discountAmount.toLocaleString("vi-VN")} VNĐ
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                    >
                                        Gỡ bỏ
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <p className="text-xs text-red-600 mt-2 font-medium">
                                    ⚠️ {couponError}
                                </p>
                            )}
                        </div>

                        {/* TỔNG KẾT TIỀN */}
                        <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString("vi-VN")} ₫</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Giảm giá ({appliedCoupon.code})</span>
                                    <span>-{discountAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-600 font-semibold">Miễn phí</span>
                            </div>

                            <div className="flex justify-between items-center text-lg font-bold border-t border-gray-300 pt-3 text-black">
                                <span>Tổng thanh toán</span>
                                <span className="text-2xl text-red-600">
                                    {finalTotal.toLocaleString("vi-VN")} VNĐ
                                </span>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={submitting}
                            className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 transition-colors font-bold text-base disabled:opacity-50 shadow-md"
                        >
                            {submitting ? "Đang xử lý đơn hàng..." : "Xác nhận đặt hàng"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}
