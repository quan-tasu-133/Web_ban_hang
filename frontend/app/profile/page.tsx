"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, User } from "../context/AuthContext";

export default function ProfilePage() {
    const { user, loading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<User | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Form profile state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Không thể tải thông tin");
                }

                setProfile(data.user);
                setName(data.user.name || "");
                setPhone(data.user.phone || "");
                setAddress(data.user.address || "");
            } catch (error) {
                console.error("Lỗi fetchProfile:", error);
            } finally {
                setPageLoading(false);
            }
        };

        fetchProfile();
    }, [user, authLoading, router]);

    // Cập nhật thông tin cá nhân
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setProfileLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    phone,
                    address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật thông tin");
            }

            setProfile(data.user);
            updateUser(data.user);
            setProfileMessage({
                type: "success",
                text: "Cập nhật thông tin thành công!"
            });
        } catch (err: unknown) {
            setProfileMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Đã có lỗi xảy ra"
            });
        } finally {
            setProfileLoading(false);
        }
    };

    // Đổi mật khẩu
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({
                type: "error",
                text: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({
                type: "error",
                text: "Mật khẩu xác nhận không khớp"
            });
            return;
        }

        setPasswordLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/auth/profile/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể đổi mật khẩu");
            }

            setPasswordMessage({
                type: "success",
                text: "Đổi mật khẩu thành công!"
            });

            // Reset password inputs
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            setPasswordMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Đã có lỗi xảy ra"
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (authLoading || pageLoading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-500">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p>Đang tải thông tin tài khoản...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <p className="text-gray-600 mb-4">Không tìm thấy thông tin tài khoản.</p>
                <Link href="/login" className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                    Đăng nhập lại
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-10">

            {/* PROFILE HEADER CARD */}
            <div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profile.name}
                            </h1>
                            {profile.role === "admin" ? (
                                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    🛡️ Quản trị viên
                                </span>
                            ) : (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    👤 Khách hàng
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-0.5">
                            {profile.email} • Tham gia từ {profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : "Gần đây"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        href="/orders"
                        className="flex-1 md:flex-initial bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors text-center inline-flex items-center justify-center gap-2 shadow-sm"
                    >
                        📦 Đơn hàng đã mua
                    </Link>

                    {profile.role === "admin" && (
                        <Link
                            href="/admin"
                            className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-center"
                        >
                            🛡️ Trang Admin
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* FORM 1: THÔNG TIN CÁ NHÂN & GIAO HÀNG */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <span>👤</span> Thông tin cá nhân & Giao hàng
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Cập nhật thông tin để tự động điền khi đặt hàng
                    </p>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full border rounded-xl px-4 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <span className="text-[11px] text-gray-400 mt-1 block">Email được dùng làm tài khoản đăng nhập và không thể thay đổi.</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại mặc định
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ví dụ: 0912345678"
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ giao hàng mặc định
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội"
                                rows={3}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50 resize-none"
                            />
                        </div>

                        {profileMessage && (
                            <div className={`p-3 rounded-xl text-sm ${
                                profileMessage.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full bg-black text-white font-medium rounded-xl py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                        >
                            {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </form>
                </div>

                {/* FORM 2: ĐỔI MẬT KHẨU */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <span>🔒</span> Đổi mật khẩu
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Bảo vệ tài khoản bằng mật khẩu an toàn
                    </p>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu hiện tại *
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu mới *
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Tối thiểu 6 ký tự"
                                minLength={6}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu mới *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                minLength={6}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                                required
                            />
                        </div>

                        {passwordMessage && (
                            <div className={`p-3 rounded-xl text-sm ${
                                passwordMessage.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full bg-black text-white font-medium rounded-xl py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                        >
                            {passwordLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </button>
                    </form>
                </div>

            </div>

        </main>
    );
}
