"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Đăng ký thất bại");
                return;
            }

            alert("Đăng ký thành công! Hãy đăng nhập vào tài khoản của bạn.");

            router.push("/login");

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể kết nối tới server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 px-6">

            <h1 className="text-3xl font-bold text-center mb-2">
                Tạo tài khoản
            </h1>

            <p className="text-center text-gray-500 mb-8">
                Đăng ký để mua sắm và theo dõi đơn hàng
            </p>

            <form
                onSubmit={handleRegister}
                className="space-y-4"
            >

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Email *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="example@gmail.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu *
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="Tối thiểu 6 ký tự"
                        minLength={6}
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-medium rounded-lg py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                >
                    {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
                </button>

            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                    href="/login"
                    className="font-bold text-black hover:underline"
                >
                    Đăng nhập
                </Link>
            </p>

        </div>
    );
}