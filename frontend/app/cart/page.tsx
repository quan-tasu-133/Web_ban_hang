"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const {
        cart,
        loading,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart
    } = useCart();

    const totalPrice = cart.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p>Đang tải giỏ hàng...</p>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">
                    Giỏ hàng
                </h1>

                <p>Giỏ hàng đang trống.</p>

                <Link
                    href="/"
                    className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
                >
                    Tiếp tục mua hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Giỏ hàng
                </h1>

                <button
                    onClick={clearCart}
                    className="text-red-600"
                >
                    Xóa tất cả
                </button>
            </div>

            <div className="space-y-4">

                {cart.map((item) => (

                    <div
                        key={item.product_id}
                        className="border rounded-lg p-4 flex items-center gap-6"
                    >

                        {/* IMAGE */}
                        <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">
                                    Ảnh SP
                                </span>
                            )}
                        </div>

                        {/* INFO */}
                        <div className="flex-1">

                            <h2 className="text-xl font-bold">
                                {item.name}
                            </h2>

                            <p className="text-gray-500">
                                {item.brand}
                            </p>

                            <p className="font-medium mt-2">
                                {Number(item.price).toLocaleString("vi-VN")} VNĐ
                            </p>

                        </div>

                        {/* QUANTITY */}
                        <div className="flex items-center gap-3">

                            <button
                                onClick={() =>
                                    decreaseQuantity(item.product_id)
                                }
                                className="border px-3 py-1 rounded"
                            >
                                −
                            </button>

                            <span>
                                {item.quantity}
                            </span>

                            <button
                                onClick={() =>
                                    increaseQuantity(item.product_id)
                                }
                                className="border px-3 py-1 rounded"
                            >
                                +
                            </button>

                        </div>

                        {/* DELETE */}
                        <button
                            onClick={() =>
                                removeFromCart(item.product_id)
                            }
                            className="text-red-600"
                        >
                            Xóa
                        </button>

                    </div>

                ))}

            </div>

            {/* TOTAL */}

            <div className="border-t mt-8 pt-6 flex justify-between items-center">

                <span className="text-xl font-bold">
                    Tổng tiền:
                </span>

                <span className="text-2xl font-bold">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                </span>

            </div>

            <Link
                href="/checkout"
                className="mt-6 block text-center w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
            >
                Tiến hành thanh toán →
            </Link>

        </div>
    );
}