"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface AdminOrder {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
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

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string | null;
    price: number | string;
    quantity: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
    processing: { label: "Đang đóng gói", color: "bg-blue-100 text-blue-800" },
    shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
    completed: { label: "Đã hoàn thành", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Đã hủy đơn", color: "bg-red-100 text-red-800" },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const url = filterStatus === "ALL"
                ? "http://localhost:5000/orders"
                : `http://localhost:5000/orders?status=${filterStatus}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setOrders(data || []);
        } catch (error) {
            console.error("Lỗi fetchOrders:", error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error("Không thể cập nhật trạng thái đơn hàng");
            }

            // Cập nhật lại state
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId ? { ...o, status: newStatus as AdminOrder["status"] } : o
                )
            );

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as AdminOrder["status"] } : null);
            }

        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
    };

    const handleViewDetail = async (order: AdminOrder) => {
        setSelectedOrder(order);
        setLoadingDetail(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/orders/${order.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setSelectedItems(data.items || []);
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const filteredOrders = orders.filter((o) => {
        if (!searchTerm.trim()) return true;
        const s = searchTerm.toLowerCase();
        return (
            o.id.toString().includes(s) ||
            o.customer_name.toLowerCase().includes(s) ||
            o.customer_phone.includes(s) ||
            o.customer_address.toLowerCase().includes(s)
        );
    });

    if (loading) {
        return <p className="p-8">Đang tải danh sách đơn hàng...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link href="/admin" className="text-gray-500 hover:text-black text-sm">
                        ← Quay lại Admin
                    </Link>
                    <h1 className="text-3xl font-bold mt-1">
                        Quản lý Đơn hàng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Theo dõi tiến độ, xem chi tiết và đổi trạng thái giao hàng
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn, Tên, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-black w-64"
                    />
                </div>
            </div>

            {/* BỘ LỌC TRẠNG THÁI */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { id: "ALL", label: "Tất cả" },
                    { id: "pending", label: "Chờ xác nhận" },
                    { id: "processing", label: "Đang đóng gói" },
                    { id: "shipping", label: "Đang giao" },
                    { id: "completed", label: "Hoàn thành" },
                    { id: "cancelled", label: "Đã hủy" },
                ].map((st) => (
                    <button
                        key={st.id}
                        onClick={() => setFilterStatus(st.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filterStatus === st.id
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {st.label}
                    </button>
                ))}
            </div>

            {/* BẢNG ĐƠN HÀNG */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
                        <tr>
                            <th className="p-4">Mã đơn</th>
                            <th className="p-4">Khách hàng</th>
                            <th className="p-4">Liên hệ & Địa chỉ</th>
                            <th className="p-4">Tổng tiền</th>
                            <th className="p-4">Thanh toán</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    Không có đơn hàng nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const st = statusMap[order.status] || {
                                    label: order.status,
                                    color: "bg-gray-100 text-gray-800"
                                };

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold text-base text-blue-600">
                                            #{order.id}
                                            <p className="text-xs text-gray-400 font-normal mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString("vi-VN")}
                                            </p>
                                        </td>

                                        <td className="p-4 font-semibold">
                                            {order.customer_name}
                                            <p className="text-xs text-gray-500 font-normal">
                                                Tài khoản: {order.user_email}
                                            </p>
                                        </td>

                                        <td className="p-4 max-w-xs">
                                            <p className="font-medium">{order.customer_phone}</p>
                                            <p className="text-xs text-gray-500 truncate" title={order.customer_address}>
                                                {order.customer_address}
                                            </p>
                                        </td>

                                        <td className="p-4">
                                            <p className="font-bold text-red-600">
                                                {Number(order.total_price).toLocaleString("vi-VN")} ₫
                                            </p>
                                            {order.coupon_code && (
                                                <p className="text-xs text-green-600 font-medium">
                                                    Mã: {order.coupon_code} (-{Number(order.discount_amount).toLocaleString("vi-VN")}đ)
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-4 text-xs font-semibold">
                                            {order.payment_method === "BANKING" ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    Chuyển khoản
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    Tiền mặt (COD)
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${st.color}`}
                                            >
                                                <option value="pending">Chờ xác nhận</option>
                                                <option value="processing">Đang đóng gói</option>
                                                <option value="shipping">Đang giao hàng</option>
                                                <option value="completed">Đã hoàn thành</option>
                                                <option value="cancelled">Đã hủy đơn</option>
                                            </select>
                                        </td>

                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(order)}
                                                className="bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">

                        <div className="flex justify-between items-start border-b pb-4">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Chi tiết đơn hàng #{selectedOrder.id}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-black text-xl font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* THÔNG TIN GIAO HÀNG */}
                        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Khách hàng:</span>
                                <span className="font-bold">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Địa chỉ:</span>
                                <span className="font-medium text-right max-w-xs">{selectedOrder.customer_address}</span>
                            </div>
                            {selectedOrder.note && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ghi chú:</span>
                                    <span className="font-medium italic">{selectedOrder.note}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Thanh toán:</span>
                                <span className="font-semibold">
                                    {selectedOrder.payment_method === "BANKING" ? "Chuyển khoản VietQR" : "Thanh toán khi nhận hàng (COD)"}
                                </span>
                            </div>
                        </div>

                        {/* SẢN PHẨM TRONG ĐƠN */}
                        <div>
                            <h3 className="font-bold text-sm mb-3">Sản phẩm đã đặt:</h3>
                            {loadingDetail ? (
                                <p className="text-sm text-gray-500">Đang tải sản phẩm...</p>
                            ) : (
                                <div className="divide-y text-sm border rounded-lg overflow-hidden">
                                    {selectedItems.map((item) => (
                                        <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {item.product_image ? (
                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Ảnh</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500">Số lượng: x{item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold">
                                                {(Number(item.price) * item.quantity).toLocaleString("vi-VN")} ₫
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TỔNG TIỀN */}
                        <div className="border-t pt-4 space-y-2 text-sm">
                            {selectedOrder.coupon_code && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Mã giảm giá ({selectedOrder.coupon_code}):</span>
                                    <span>-{Number(selectedOrder.discount_amount).toLocaleString("vi-VN")} ₫</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-base font-bold text-black pt-2 border-t">
                                <span>Tổng cộng:</span>
                                <span className="text-xl text-red-600">
                                    {Number(selectedOrder.total_price).toLocaleString("vi-VN")} VNĐ
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                            >
                                Đóng
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
