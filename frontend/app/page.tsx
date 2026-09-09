"use client";

import { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";

export default function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/products")
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
            })
            .catch((error) => {
                console.error("Lỗi:", error);
            });
    }, []);

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">

            <h1 className="text-3xl font-bold mb-8">
                Phone Shop
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>

        </main>
    );
}