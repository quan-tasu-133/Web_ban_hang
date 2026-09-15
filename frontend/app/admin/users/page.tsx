"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export interface UserItem {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
    created_at: string;
    total_orders?: string | number;
}

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách tài khoản");
            }

            const data = await response.json();
            setUsers(data || []);
        } catch (error) {
            console.error("Lỗi fetchUsers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (targetUser: UserItem) => {
        const newRole = targetUser.role === "admin" ? "user" : "admin";
        const confirmMessage = targetUser.role === "admin"
            ? `Bạn có chắc muốn hạ quyền quản trị viên của tài khoản "${targetUser.name}" (${targetUser.email}) xuống làm Khách hàng?`
            : `Bạn có chắc muốn thăng cấp tài khoản "${targetUser.name}" (${targetUser.email}) thành Quản trị viên (Admin)?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setActionLoadingId(targetUser.id);
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/admin/users/${targetUser.id}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật quyền");
            }

            fetchUsers();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteUser = async (targetUser: UserItem) => {
        if (!window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${targetUser.name}" (${targetUser.email})? Mọi giỏ hàng và dữ liệu liên quan sẽ bị xóa.`)) {
            return;
        }

        try {
            setActionLoadingId(targetUser.id);
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/admin/users/${targetUser.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể xóa tài khoản");
            }

            fetchUsers();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesKeyword =
            u.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            u.id.toString().includes(searchKeyword);

        const matchesRole =
            roleFilter === "all" || u.role === roleFilter;

        return matchesKeyword && matchesRole;
    });

    const totalAdminCount = users.filter((u) => u.role === "admin").length;
    const totalCustomerCount = users.filter((u) => u.role === "user").length;

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-500">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p>Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="text-gray-500 hover:text-black text-sm">
                            ← Quay lại Admin
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold mt-1">
                        Quản lý Người dùng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Xem danh sách thành viên, phân quyền Quản trị viên (Admin) và quản lý tài khoản
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchUsers}
                        className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="border rounded-xl p-5 bg-white shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Tổng tài khoản</span>
                    <p className="text-2xl font-bold mt-1">{users.length}</p>
                </div>

                <div className="border rounded-xl p-5 bg-white shadow-sm">
                    <span className="text-sm font-medium text-purple-600">Quản trị viên (Admin)</span>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{totalAdminCount}</p>
                </div>

                <div className="border rounded-xl p-5 bg-white shadow-sm">
                    <span className="text-sm font-medium text-blue-600">Khách hàng (User)</span>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{totalCustomerCount}</p>
                </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
                <div className="w-full md:w-96 relative">
                    <input
                        type="text"
                        placeholder="Tìm theo ID, Họ tên, Email..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        🔍
                    </span>
                    {searchKeyword && (
                        <button
                            onClick={() => setSearchKeyword("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Vai trò:</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black w-full md:w-auto"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                        <option value="user">Khách hàng (User)</option>
                    </select>
                </div>
            </div>

            {/* USERS TABLE */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-700 tracking-wider">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Họ và tên</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4 text-center">Số đơn hàng</th>
                            <th className="p-4">Ngày đăng ký</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    Không tìm thấy tài khoản người dùng nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const isSelf = currentUser?.id === u.id || currentUser?.email === u.email;
                                const isLoading = actionLoadingId === u.id;

                                return (
                                    <tr key={u.id} className={`hover:bg-gray-50 ${isSelf ? "bg-blue-50/40" : ""}`}>
                                        <td className="p-4 font-mono font-medium text-gray-500">
                                            #{u.id}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            {u.name}
                                            {isSelf && (
                                                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-normal">
                                                    Bạn
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {u.email}
                                        </td>
                                        <td className="p-4">
                                            {u.role === "admin" ? (
                                                <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                                                    🛡️ Admin
                                                </span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                                                    👤 Khách hàng
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-700">
                                            {u.total_orders || 0} đơn
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {new Date(u.created_at).toLocaleString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* ĐỔI VAI TRÒ */}
                                                <button
                                                    onClick={() => handleRoleChange(u)}
                                                    disabled={isSelf || isLoading}
                                                    title={isSelf ? "Không thể tự đổi vai trò của chính mình" : "Đổi vai trò"}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                        isSelf
                                                            ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                                            : u.role === "admin"
                                                            ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                                                            : "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                                                    }`}
                                                >
                                                    {isLoading ? "..." : u.role === "admin" ? "Hạ quyền User" : "Thăng cấp Admin"}
                                                </button>

                                                {/* XÓA TÀI KHOẢN */}
                                                <button
                                                    onClick={() => handleDeleteUser(u)}
                                                    disabled={isSelf || isLoading}
                                                    title={isSelf ? "Không thể tự xóa tài khoản của chính mình" : "Xóa tài khoản"}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                        isSelf
                                                            ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                                            : "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                                                    }`}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
