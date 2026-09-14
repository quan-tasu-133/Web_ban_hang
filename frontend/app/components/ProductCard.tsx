"use client";

import Link from "next/link";

export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number | string;
    description?: string;
    image?: string;
    stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="h-48 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                        />
                    ) : (
                        <span className="text-gray-400">
                            Ảnh sản phẩm
                        </span>
                    )}
                </div>

                <h2 className="text-lg font-bold mt-4 line-clamp-1">
                    {product.name}
                </h2>

                <p className="text-gray-500 text-sm">
                    {product.brand}
                </p>

                <p className="text-red-500 font-bold mt-2 text-lg">
                    {Number(product.price).toLocaleString("vi-VN")} VNĐ
                </p>

                <p className="text-sm text-gray-500 mt-1">
                    Còn lại: {product.stock}
                </p>
            </div>

            <Link
                href={`/products/${product.id}`}
                className="block text-center bg-black text-white rounded-lg py-2 mt-4 hover:bg-gray-800 transition-colors"
            >
                Xem chi tiết
            </Link>
        </div>
    );
}