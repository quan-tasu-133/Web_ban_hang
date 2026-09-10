"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { cart } = useCart();
    const { user, logout} = useAuth();

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center gap-8">

                    {/* LOGO */}
                    <Link
                        href="/"
                        className="text-2xl font-bold whitespace-nowrap"
                    >
                        Phone Shop
                    </Link>

                    {/* SEARCH */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full border rounded-full px-5 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-black"
                            />

                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* CART */}
                    <Link
                        href="/cart"
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="text-xl">
                            🛒
                        </span>

                        <span>
                            Giỏ hàng ({totalQuantity})
                        </span>
                    </Link>

                    {/* ACCOUNT */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="whitespace-nowrap"
                            >
                                👤 {user.name}
                            </Link>

                            <button
                                onClick={logout}
                                className="text-red-600"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 whitespace-nowrap"
                        >
                            <span className="text-xl">
                                👤
                            </span>

                            <span>
                                Tài khoản
                            </span>
                        </Link>
                    )}

                </div>
            </div>
        </nav>
    );
}