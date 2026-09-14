"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "admin") {
            router.replace("/");
            return;
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="p-8">
                Đang kiểm tra quyền Admin...
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <>
            {children}
        </>
    );
}