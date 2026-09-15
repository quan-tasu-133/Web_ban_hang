"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    payment_method: string;
    coupon_code: string | null;
    discount_amount: number | string;
    total_price: number | string;
    status: string;
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

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params?.id;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Không tìm thấy đơn hàng");
                }

                const data = await response.json();
                setOrder(data.order);
                setItems(data.items || []);
            } catch (error) {
                console.error("Lỗi fetchOrder:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-12 text-center">
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
                <h1 className="text-2xl font-bold">Không tìm thấy đơn hàng</h1>
                <Link href="/" className="inline-block bg-black text-white px-5 py-2.5 rounded-lg">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">

            {/* HEADER THÀNH CÔNG */}
            <div className="text-center space-y-3 mb-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Đặt hàng thành công!
                </h1>
                <p className="text-gray-500 text-sm">
                    Cảm ơn bạn đã mua hàng tại Phone Shop. Đơn hàng của bạn đang được xử lý.
                </p>
                <p className="inline-block bg-gray-100 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-700">
                    Mã đơn hàng: #{order.id}
                </p>
            </div>

            {/* NẾU CHỌN CHUYỂN KHOẢN NGÂN HÀNG (VIETQR) */}
            {order.payment_method === "BANKING" && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 mb-8 text-sm space-y-3">
                    <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
                        🏦 Hướng dẫn chuyển khoản ngân hàng
                    </h2>
                    <p className="text-blue-800">
                        Vui lòng chuyển khoản đúng số tiền và nội dung để hệ thống tự động xác nhận đơn hàng của bạn:
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-2 text-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngân hàng:</span>
                            <span className="font-bold">MB Bank (Quân Đội)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số tài khoản:</span>
                            <span className="font-bold text-base text-blue-700">0987654321</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Chủ tài khoản:</span>
                            <span className="font-bold">PHONE SHOP VIETNAM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="font-bold text-red-600 text-base">
                                {Number(order.total_price).toLocaleString("vi-VN")} VNĐ
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nội dung chuyển khoản:</span>
                            <span className="font-bold bg-yellow-100 px-2 py-0.5 rounded text-yellow-900">
                                DH {order.id}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* THÔNG TIN CHI TIẾT ĐƠN HÀNG */}
            <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">

                <div>
                    <h2 className="text-lg font-bold mb-4 pb-2 border-b">
                        Thông tin giao nhận
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Người nhận:</p>
                            <p className="font-semibold text-base">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Số điện thoại:</p>
                            <p className="font-semibold text-base">{order.customer_phone}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-gray-500">Địa chỉ giao hàng:</p>
                            <p className="font-medium">{order.customer_address}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Phương thức thanh toán:</p>
                            <p className="font-semibold">
                                {order.payment_method === "BANKING"
                                    ? "Chuyển khoản ngân hàng"
                                    : "Thanh toán khi nhận hàng (COD)"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Thời gian đặt:</p>
                            <p className="font-medium">
                                {new Date(order.created_at).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SẢN PHẨM ĐÃ MUA */}
                <div>
                    <h2 className="text-lg font-bold mb-4 pb-2 border-b">
                        Sản phẩm đã đặt ({items.length})
                    </h2>
                    <div className="divide-y text-sm">
                        {items.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.product_image ? (
                                            <img
                                                src={item.product_image}
                                                alt={item.product_name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">Ảnh</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">Số lượng: x{item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold whitespace-nowrap">
                                    {(Number(item.price) * item.quantity).toLocaleString("vi-VN")} ₫
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TỔNG KẾT */}
                <div className="border-t pt-4 space-y-2 text-sm">
                    {order.coupon_code && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Mã giảm giá áp dụng ({order.coupon_code}):</span>
                            <span>-{Number(order.discount_amount).toLocaleString("vi-VN")} ₫</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t text-black">
                        <span>Tổng tiền thanh toán:</span>
                        <span className="text-2xl text-red-600 font-extrabold">
                            {Number(order.total_price).toLocaleString("vi-VN")} VNĐ
                        </span>
                    </div>
                </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-4 mt-8">
                <Link
                    href="/"
                    className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>

        </div>
    );
}
