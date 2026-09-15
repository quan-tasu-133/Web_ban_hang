"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, User } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<User | null>(null);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                setProfile(data.user);

            } catch (error) {
                console.error(error);
            }
        };

        fetchProfile();
    }, [user, loading, router]);

    if (loading || !profile) {
        return <p className="p-6">Đang tải...</p>;
    }

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                Tài khoản
            </h1>

            <div className="border rounded-lg p-6 space-y-4">
                <div>
                    <p className="text-gray-500">
                        Họ tên
                    </p>

                    <p className="text-lg font-medium">
                        {profile.name}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">
                        Email
                    </p>

                    <p className="text-lg font-medium">
                        {profile.email}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">
                        ID
                    </p>

                    <p className="text-lg font-medium">
                        {profile.id}
                    </p>
                </div>

                <div className="pt-4 border-t flex flex-wrap gap-4">
                    <Link
                        href="/orders"
                        className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                    >
                        📦 Lịch sử đơn hàng của tôi
                    </Link>
                </div>
            </div>
        </main>
    );
}