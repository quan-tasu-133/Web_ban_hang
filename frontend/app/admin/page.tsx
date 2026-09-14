"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function AdminPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }

        if (!loading && user && user.role !== "admin") {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="p-8">
                Đang kiểm tra quyền...
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-2">
                Admin Dashboard
            </h1>

            <p className="text-gray-600 mb-8">
                Xin chào, {user.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="border rounded-xl p-6">
                    <Link
                        href="/admin/products"
                        className="border rounded-xl p-6 block hover:bg-gray-50"
                    >
                        <h2 className="text-xl font-bold mb-2">
                            📱 Sản phẩm
                        </h2>

                        <p className="text-gray-500">
                            Quản lý điện thoại
                        </p>
                    </Link>
                </div>

                <div className="border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-2">
                        📦 Đơn hàng
                    </h2>

                    <p className="text-gray-500">
                        Quản lý đơn hàng
                    </p>
                </div>

                <div className="border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-2">
                        👥 Người dùng
                    </h2>

                    <p className="text-gray-500">
                        Quản lý tài khoản
                    </p>
                </div>

            </div>
        </div>
    );
}