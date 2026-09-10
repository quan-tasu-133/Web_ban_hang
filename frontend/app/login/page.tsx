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

    const handleLogin = async (e) => {
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
                setError(data.message);
                return;
            }

            login(data.token, data.user);

            alert("Đăng nhập thành công");

            router.push("/");

        } catch (error) {
            setError("Không thể kết nối tới server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md border rounded-lg p-8">

                <h1 className="text-3xl font-bold mb-6">
                    Đăng nhập
                </h1>

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >

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
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                </form>

                <p className="mt-6 text-center">
                    Chưa có tài khoản?{" "}
                    <Link
                        href="/register"
                        className="font-bold"
                    >
                        Đăng ký
                    </Link>
                </p>

            </div>
        </div>
    );
}