"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { Product } from "../../components/ProductCard";

export default function ProductDetail() {
    const params = useParams();
    const productId = params?.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const { cart, addToCart } = useCart();

    const currentItem = cart.find(
        (item) => item.product_id === Number(productId)
    );
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    useEffect(() => {
        if (!productId) return;

        fetch(`http://localhost:5000/products/${productId}`)
            .then((response) => {
                if (!response.ok) throw new Error("Không thể tải sản phẩm");
                return response.json();
            })
            .then((data: Product) => {
                setProduct(data);
            })
            .catch((error) => {
                console.error("Lỗi:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [productId]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10">
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10">
                <p>Không tìm thấy sản phẩm.</p>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden border">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                        />
                    ) : (
                        <span className="text-gray-400">
                            Ảnh sản phẩm
                        </span>
                    )}
                </div>

                <div>

                    <p className="text-gray-500">
                        {product.brand}
                    </p>

                    <h1 className="text-3xl font-bold mt-2">
                        {product.name}
                    </h1>

                    <p className="text-2xl text-red-500 font-bold mt-6">
                        {Number(product.price).toLocaleString("vi-VN")} VNĐ
                    </p>

                    <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.description || "Chưa có mô tả chi tiết."}
                    </p>

                    <p className="mt-4 text-sm text-gray-600">
                        Tồn kho: <span className="font-semibold">{product.stock}</span>
                    </p>

                    <button
                        onClick={() => addToCart(product)} 
                        className="bg-black text-white px-8 py-3 rounded-lg mt-8 hover:bg-gray-800 transition-colors font-medium"
                    >
                        Thêm vào giỏ hàng
                    </button>

                    <p className="mt-4 text-sm text-gray-500">
                        Số lượng sản phẩm này trong giỏ hàng: <span className="font-semibold text-black">{currentQuantity}</span>
                    </p>

                </div>

            </div>

        </main>
    );
}