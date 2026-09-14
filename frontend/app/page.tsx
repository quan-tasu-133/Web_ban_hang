"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard, { Product } from "./components/ProductCard";

function ProductList() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const sort = searchParams.get("sort") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const brands = ["Tất cả", "Apple", "Samsung", "Xiaomi"];

    useEffect(() => {
        setLoading(true);

        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (brand && brand !== "Tất cả") params.set("brand", brand);
        if (sort) params.set("sort", sort);

        const queryString = params.toString();
        const url = `http://localhost:5000/products${queryString ? `?${queryString}` : ""}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error("Không thể tải sản phẩm");
                return response.json();
            })
            .then((data: Product[]) => {
                setProducts(data || []);
            })
            .catch((error) => {
                console.error("Lỗi tải sản phẩm:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [search, brand, sort]);

    const handleBrandChange = (newBrand: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newBrand === "Tất cả") {
            params.delete("brand");
        } else {
            params.set("brand", newBrand);
        }
        router.push(`/?${params.toString()}`);
    };

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newSort) {
            params.set("sort", newSort);
        } else {
            params.delete("sort");
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">

            {/* HEADER & FILTER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        {search
                            ? `Kết quả tìm kiếm cho: "${search}"`
                            : "Sản phẩm nổi bật"}
                    </h1>

                    {search && (
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-gray-500">
                                Tìm thấy {products.length} sản phẩm
                            </span>
                            <Link
                                href="/"
                                className="text-sm text-blue-600 hover:underline font-medium"
                            >
                                ✕ Xóa tìm kiếm
                            </Link>
                        </div>
                    )}
                </div>

                {/* SORT */}
                <div className="flex items-center gap-3">
                    <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">
                        Sắp xếp:
                    </label>
                    <select
                        id="sort-select"
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                        <option value="">Mặc định</option>
                        <option value="price_asc">Giá: Thấp đến Cao</option>
                        <option value="price_desc">Giá: Cao đến Thấp</option>
                        <option value="newest">Mới nhất</option>
                    </select>
                </div>
            </div>

            {/* BRAND FILTER CHIPS */}
            <div className="flex flex-wrap gap-2 mb-8">
                {brands.map((b) => {
                    const isActive = (!brand && b === "Tất cả") || brand === b;
                    return (
                        <button
                            key={b}
                            onClick={() => handleBrandChange(b)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {b}
                        </button>
                    );
                })}
            </div>

            {/* PRODUCT GRID */}
            {loading ? (
                <div className="py-20 text-center">
                    <p className="text-gray-500">Đang tìm kiếm sản phẩm...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="py-16 text-center border rounded-xl bg-gray-50">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-lg font-semibold text-gray-700">
                        Không tìm thấy sản phẩm nào phù hợp
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                    </p>
                    <Link
                        href="/"
                        className="inline-block mt-4 bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                    >
                        Xem tất cả sản phẩm
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            )}

        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-10">Đang tải trang...</div>}>
            <ProductList />
        </Suspense>
    );
}