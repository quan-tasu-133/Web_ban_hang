"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function ProductDetail() {
    const params = useParams();

    const [product, setProduct] = useState(null);

    const { cart,addToCart } = useCart();

    useEffect(() => {
        fetch(`http://localhost:5000/products/${params.id}`)
            .then((response) => response.json())
            .then((data) => {
                setProduct(data);
            })
            .catch((error) => {
                console.error("Lỗi:", error);
            });
    }, [params.id]);

    if (!product) {
        return <p>Đang tải...</p>;
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">
                        Ảnh sản phẩm
                    </span>
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

                    <p className="mt-6">
                        {product.description}
                    </p>

                    <p className="mt-4">
                        Tồn kho: {product.stock}
                    </p>

                    <button
                        onClick={() => addToCart(product)} 
                        className="bg-black text-white px-6 py-3 rounded-lg mt-8"
                                            >
                        Thêm vào giỏ hàng
                    </button>

                    <p className="mt-4">
                        Số sản phẩm trong giỏ hàng: {cart.length}
                    </p>

                </div>

            </div>

        </main>
    );
}