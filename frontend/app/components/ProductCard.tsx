"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
    return (
        <div className="border rounded-lg p-4 shadow-sm">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">
                    Ảnh sản phẩm
                </span>
            </div>

            <h2 className="text-lg font-bold mt-4">
                {product.name}
            </h2>

            <p className="text-gray-500">
                {product.brand}
            </p>

            <p className="text-red-500 font-bold mt-2">
                {Number(product.price).toLocaleString("vi-VN")} VNĐ
            </p>

            <p className="text-sm text-gray-500 mt-1">
                Còn lại: {product.stock}
            </p>

            <Link
                href={`/products/${product.id}`}
                className="block text-center bg-black text-white rounded-lg py-2 mt-4"
            >
                Xem chi tiết
            </Link>
        </div>
    );
}