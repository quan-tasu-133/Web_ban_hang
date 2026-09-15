"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function AdminPage() {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-2">
                Admin Dashboard
            </h1>

            <p className="text-gray-600 mb-8">
                Xin chào, {user?.name || "Admin"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Link
                    href="/admin/products"
                    className="border rounded-xl p-6 block hover:bg-gray-50 transition-colors"
                >
                    <h2 className="text-xl font-bold mb-2">
                        📱 Sản phẩm
                    </h2>

                    <p className="text-gray-500">
                        Quản lý điện thoại, giá và kho hàng
                    </p>
                </Link>

                <Link
                    href="/admin/coupons"
                    className="border rounded-xl p-6 block hover:bg-gray-50 transition-colors"
                >
                    <h2 className="text-xl font-bold mb-2">
                        🎟️ Mã giảm giá
                    </h2>

                    <p className="text-gray-500">
                        Quản lý voucher giảm theo % hoặc tiền mặt
                    </p>
                </Link>

                <Link
                    href="/admin/orders"
                    className="border rounded-xl p-6 block hover:bg-gray-50 transition-colors"
                >
                    <h2 className="text-xl font-bold mb-2">
                        📦 Đơn hàng
                    </h2>

                    <p className="text-gray-500">
                        Quản lý và đổi trạng thái đơn hàng khách đặt
                    </p>
                </Link>

                <Link
                    href="/admin/users"
                    className="border rounded-xl p-6 block hover:bg-gray-50 transition-colors"
                >
                    <h2 className="text-xl font-bold mb-2">
                        👥 Người dùng
                    </h2>

                    <p className="text-gray-500">
                        Quản lý tài khoản, phân quyền Admin/User
                    </p>
                </Link>

            </div>
        </div>
    );
}