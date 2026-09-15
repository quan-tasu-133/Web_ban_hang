"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAdminPage = pathname?.startsWith("/admin");

    const [keyword, setKeyword] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            router.push(`/?search=${encodeURIComponent(keyword.trim())}`);
        } else {
            router.push("/");
        }
    };

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center gap-8">

                    {/* LOGO */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-2xl font-bold whitespace-nowrap"
                        >
                            Phone Shop
                        </Link>
                        {isAdminPage && (
                            <span className="bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                                ADMIN
                            </span>
                        )}
                    </div>

                    {/* SEARCH (Chỉ hiển thị ở trang khách hàng) */}
                    <div className="flex-1">
                        {!isAdminPage ? (
                            <form onSubmit={handleSearch} className="relative max-w-2xl">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên, thương hiệu (iPhone, Samsung...)"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full border rounded-full px-5 py-2.5 pr-20 outline-none focus:ring-2 focus:ring-black text-sm"
                                />

                                {keyword && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setKeyword("");
                                            router.push("/");
                                        }}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-semibold"
                                    >
                                        ✕
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    aria-label="Tìm kiếm"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-black transition-colors"
                                >
                                    🔍
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <Link
                                    href="/admin"
                                    className={`hover:text-black font-medium ${pathname === "/admin" ? "text-black font-bold" : ""}`}
                                >
                                    Tổng quan
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className={`hover:text-black font-medium ${pathname === "/admin/products" ? "text-black font-bold" : ""}`}
                                >
                                    Sản phẩm
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className={`hover:text-black font-medium ${pathname === "/admin/orders" ? "text-black font-bold" : ""}`}
                                >
                                    Đơn hàng
                                </Link>
                                <Link
                                    href="/admin/coupons"
                                    className={`hover:text-black font-medium ${pathname === "/admin/coupons" ? "text-black font-bold" : ""}`}
                                >
                                    Mã giảm giá
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className={`hover:text-black font-medium ${pathname === "/admin/users" ? "text-black font-bold" : ""}`}
                                >
                                    Người dùng
                                </Link>
                                <Link
                                    href="/"
                                    className="hover:text-black text-blue-600 font-medium ml-2"
                                >
                                    🏪 Xem cửa hàng
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CART (Chỉ hiển thị ở trang khách hàng) */}
                    {!isAdminPage && (
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
                    )}

                    {/* ACCOUNT */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                                >
                                    🛡️ Admin
                                </Link>
                            )}

                            {!isAdminPage && (
                                <Link
                                    href="/orders"
                                    className="text-sm font-medium hover:text-black text-gray-700 whitespace-nowrap"
                                >
                                    📦 Đơn hàng
                                </Link>
                            )}

                            <Link
                                href="/profile"
                                className="whitespace-nowrap font-medium text-sm"
                            >
                                👤 {user.name}
                            </Link>

                            <button
                                onClick={logout}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
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