"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
    const {
        cart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useCart();

    const totalPrice = cart.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">

            <h1 className="text-3xl font-bold mb-8">
                Giỏ hàng
            </h1>

            {cart.length === 0 ? (
                <p>Giỏ hàng đang trống.</p>
            ) : (
                <div>

                    {/* DANH SÁCH SẢN PHẨM */}

                    <div className="space-y-4">

                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-lg p-4 flex justify-between items-center"
                            >

                                <div>
                                    <h2 className="text-xl font-bold">
                                        {item.name}
                                    </h2>

                                    <p className="text-gray-500">
                                        {item.brand}
                                    </p>

                                    <p className="text-red-500 font-bold mt-2">
                                        {Number(item.price).toLocaleString("vi-VN")} VNĐ
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">

                                    <button
                                        onClick={() => decreaseQuantity(item.id)}
                                        className="border px-3 py-1 rounded"
                                    >
                                        −
                                    </button>

                                    <span>
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => increaseQuantity(item.id)}
                                        className="border px-3 py-1 rounded"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 ml-6"
                                    >
                                        Xóa
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>


                    {/* TỔNG TIỀN */}

                    <div className="border-t mt-8 pt-6 text-right">

                        <p className="text-xl font-bold">
                            Tổng tiền:
                        </p>

                        <p className="text-2xl text-red-500 font-bold mt-2">
                            {totalPrice.toLocaleString("vi-VN")} VNĐ
                        </p>

                        <button
                            className="bg-black text-white px-6 py-3 rounded-lg mt-4"
                        >
                            Tiến hành thanh toán
                        </button>

                    </div>

                </div>
            )}

        </main>
    );
}