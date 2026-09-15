"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

interface MyOrder {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    payment_method: string;
    coupon_code: string | null;
    discount_amount: number | string;
    total_price: number | string;
    status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
    note: string | null;
    created_at: string;
}

const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 border-yellow-200", desc: "Đơn hàng đang chờ shop tiếp nhận và chuẩn bị" },
    processing: { label: "Đang đóng gói", color: "bg-blue-100 text-blue-800 border-blue-200", desc: "Shop đang đóng gói đơn hàng cho bạn" },
    shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800 border-purple-200", desc: "Đơn hàng đang được shipper giao đến bạn" },
    completed: { label: "Đã giao thành công", color: "bg-green-100 text-green-800 border-green-200", desc: "Đơn hàng đã được giao và thanh toán thành công" },
    cancelled: { label: "Đã hủy đơn", color: "bg-red-100 text-red-800 border-red-200", desc: "Đơn hàng này đã bị hủy" },
};

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
            return;
        }

        if (user) {
            const token = localStorage.getItem("token");
            fetch("http://localhost:5000/orders/my-orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Không thể tải đơn hàng");
                    return res.json();
                })
                .then((data: MyOrder[]) => {
                    setOrders(data || []);
                })
                .catch((err) => {
                    console.error("Lỗi lấy đơn hàng:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="max-w-5xl mx-auto p-12 text-center">
                <p>Đang tải danh sách đơn hàng của bạn...</p>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Đơn hàng của tôi
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Theo dõi tình trạng các đơn hàng bạn đã đặt
                    </p>
                </div>

                <Link
                    href="/"
                    className="bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors font-medium"
                >
                    Tiếp tục mua hàng
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 border rounded-2xl bg-gray-50 space-y-4">
                    <p className="text-4xl">📦</p>
                    <h2 className="text-xl font-bold text-gray-800">
                        Bạn chưa có đơn hàng nào
                    </h2>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Hãy dạo quanh cửa hàng và chọn cho mình những sản phẩm yêu thích nhé!
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const st = statusMap[order.status] || {
                            label: order.status,
                            color: "bg-gray-100 text-gray-800 border-gray-200",
                            desc: ""
                        };

                        return (
                            <div
                                key={order.id}
                                className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-blue-600">
                                            #{order.id}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            • Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}
                                        </span>
                                    </div>

                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${st.color}`}>
                                        {st.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Người nhận:</p>
                                        <p className="font-semibold">{order.customer_name} ({order.customer_phone})</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Địa chỉ giao hàng:</p>
                                        <p className="font-medium">{order.customer_address}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Phương thức thanh toán:</p>
                                        <p className="font-medium">
                                            {order.payment_method === "BANKING"
                                                ? "🏦 Chuyển khoản VietQR"
                                                : "💵 Thanh toán tiền mặt (COD)"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Tổng tiền thanh toán:</p>
                                        <p className="font-extrabold text-lg text-red-600">
                                            {Number(order.total_price).toLocaleString("vi-VN")} VNĐ
                                        </p>
                                        {order.coupon_code && (
                                            <p className="text-xs text-green-600">
                                                (Đã áp dụng mã {order.coupon_code}: -{Number(order.discount_amount).toLocaleString("vi-VN")}đ)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t flex justify-between items-center text-xs text-gray-500">
                                    <p>💡 {st.desc}</p>
                                    <Link
                                        href={`/order-success/${order.id}`}
                                        className="text-black font-semibold hover:underline"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </main>
    );
}
