"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Đăng nhập tài khoản thường
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng nhập thất bại");
            }

            // Nếu tài khoản là Admin nhưng đăng nhập thường
            if (data.user.role === "admin") {
                setError(
                    "Đây là tài khoản Admin. Vui lòng chọn \"Đăng nhập với Admin\""
                );
                return;
            }

            login(data.token, data.user);

            router.push("/");

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Đăng nhập Admin
    const handleAdminLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng nhập thất bại");
            }

            // Kiểm tra quyền Admin
            if (data.user.role !== "admin") {
                setError(
                    "Tài khoản này không có quyền Admin"
                );
                return;
            }

            // Đúng Admin → đăng nhập ngay
            login(data.token, data.user);

            // → vào Admin ngay
            router.push("/admin");

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 px-6">

            <h1 className="text-3xl font-bold text-center mb-2">
                Đăng nhập
            </h1>

            <p className="text-center text-gray-500 mb-8">
                Đăng nhập vào tài khoản của bạn
            </p>

            {/* FORM ĐĂNG NHẬP THƯỜNG */}
            <form
                onSubmit={handleLogin}
                className="space-y-4"
            >

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                    required
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                    required
                />

                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-medium rounded-lg py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {loading
                        ? "Đang đăng nhập..."
                        : "Đăng nhập"}
                </button>

            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-gray-300 flex-1"></div>

                <span className="text-gray-500 text-sm">
                    hoặc
                </span>

                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* ĐĂNG NHẬP ADMIN */}
            <button
                type="button"
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg py-3 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                🛡️ Đăng nhập với Admin
            </button>

            {/* ĐĂNG KÝ */}
            <p className="mt-8 text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                    href="/register"
                    className="font-bold text-black hover:underline"
                >
                    Đăng ký ngay
                </Link>
            </p>

        </div>
    );
}