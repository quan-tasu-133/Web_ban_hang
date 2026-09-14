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

            alert("Đăng ký thành công");

            router.push("/login");

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể kết nối tới server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md border rounded-lg p-8">

                <h1 className="text-3xl font-bold mb-6">
                    Đăng ký
                </h1>

                <form
                    onSubmit={handleRegister}
                    className="space-y-4"
                >

                    <div>
                        <label className="block mb-1">
                            Họ tên
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="block mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-1">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded"
                    >
                        {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                </form>

                <p className="mt-6 text-center">
                    Đã có tài khoản?{" "}
                    <Link
                        href="/login"
                        className="font-bold"
                    >
                        Đăng nhập
                    </Link>
                </p>

            </div>
        </div>
    );
}