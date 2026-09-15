"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export interface Coupon {
    id: number;
    code: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number | string;
    min_order_value: number | string;
    max_discount_amount: number | string | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("fixed_amount");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderValue, setMinOrderValue] = useState("");
    const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    const fetchCoupons = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/coupons", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setCoupons(data || []);
        } catch (error) {
            console.error("Lỗi fetchCoupons:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code.trim().toUpperCase(),
                    discount_type: discountType,
                    discount_value: Number(discountValue),
                    min_order_value: minOrderValue ? Number(minOrderValue) : 0,
                    max_discount_amount: discountType === "percentage" && maxDiscountAmount ? Number(maxDiscountAmount) : null,
                    usage_limit: usageLimit ? Number(usageLimit) : null,
                    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Tạo mã thất bại");
            }

            // Reset form
            setCode("");
            setDiscountType("fixed_amount");
            setDiscountValue("");
            setMinOrderValue("");
            setMaxDiscountAmount("");
            setUsageLimit("");
            setExpiresAt("");
            setShowForm(false);

            fetchCoupons();

        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/coupons/${id}/toggle`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Không thể đổi trạng thái");
            }

            fetchCoupons();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
    };

    const handleDeleteCoupon = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa mã giảm giá này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/coupons/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Không thể xóa mã");
            }

            fetchCoupons();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
    };

    if (loading) {
        return <p className="p-8">Đang tải mã giảm giá...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="text-gray-500 hover:text-black text-sm">
                            ← Quay lại Admin
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold mt-1">
                        Quản lý Mã giảm giá
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Tạo và quản lý các voucher giảm giá cho khách hàng
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    {showForm ? "Đóng" : "+ Tạo mã giảm giá mới"}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleCreateCoupon}
                    className="border rounded-xl p-6 mb-8 space-y-4 bg-gray-50"
                >
                    <h2 className="text-xl font-bold mb-2">
                        Tạo mã giảm giá mới
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã Code (Viết liền không dấu) *
                            </label>
                            <input
                                type="text"
                                placeholder="Ví dụ: GIAM100K, SALE20..."
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full border rounded-lg px-4 py-2.5 uppercase font-bold bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hình thức giảm giá *
                            </label>
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed_amount")}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white"
                            >
                                <option value="fixed_amount">Giảm theo số tiền (VNĐ)</option>
                                <option value="percentage">Giảm theo phần trăm (%)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {discountType === "percentage" ? "Phần trăm giảm (%) *" : "Số tiền giảm (VNĐ) *"}
                            </label>
                            <input
                                type="number"
                                placeholder={discountType === "percentage" ? "Ví dụ: 10 (cho 10%)" : "Ví dụ: 100000 (cho 100k)"}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white"
                                required
                                min="1"
                                max={discountType === "percentage" ? "100" : undefined}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đơn hàng tối thiểu (VNĐ)
                            </label>
                            <input
                                type="number"
                                placeholder="Ví dụ: 500000 (đơn từ 500k mới áp dụng)"
                                value={minOrderValue}
                                onChange={(e) => setMinOrderValue(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white"
                            />
                        </div>

                        {discountType === "percentage" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giảm tối đa (VNĐ) (Tùy chọn)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Để trống = Giảm không giới hạn"
                                    value={maxDiscountAmount}
                                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2.5 bg-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lưu ý: Nếu nhập số vào đây, số tiền giảm sẽ không vượt quá mức này.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới hạn số lượt dùng (Tùy chọn)
                            </label>
                            <input
                                type="number"
                                placeholder="Để trống = Không giới hạn"
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày hết hạn (Tùy chọn)
                            </label>
                            <input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 font-medium"
                        >
                            Tạo mã
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* DANH SÁCH MÃ */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
                        <tr>
                            <th className="p-4">Mã Code</th>
                            <th className="p-4">Hình thức giảm</th>
                            <th className="p-4">Giá trị giảm</th>
                            <th className="p-4">Giảm tối đa</th>
                            <th className="p-4">Đơn tối thiểu</th>
                            <th className="p-4">Đã dùng</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên!
                                </td>
                            </tr>
                        ) : (
                            coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-base text-blue-600">
                                        {c.code}
                                    </td>
                                    <td className="p-4">
                                        {c.discount_type === "percentage" ? (
                                            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded text-xs font-semibold">
                                                Phần trăm (%)
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-semibold">
                                                Tiền mặt (VNĐ)
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        {c.discount_type === "percentage"
                                            ? `${c.discount_value}%`
                                            : `${Number(c.discount_value).toLocaleString("vi-VN")} ₫`}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {c.discount_type === "percentage"
                                            ? (c.max_discount_amount ? `${Number(c.max_discount_amount).toLocaleString("vi-VN")} ₫` : "Không giới hạn")
                                            : "-"}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {Number(c.min_order_value) > 0
                                            ? `${Number(c.min_order_value).toLocaleString("vi-VN")} ₫`
                                            : "Không yêu cầu"}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {c.used_count} {c.usage_limit ? `/ ${c.usage_limit}` : "lượt"}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleStatus(c.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                c.is_active
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                            }`}
                                        >
                                            {c.is_active ? "Đang bật" : "Đã tắt"}
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDeleteCoupon(c.id)}
                                            className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
