"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Product } from "../../components/ProductCard";

export interface ReviewItem {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string;
    user_email?: string;
}

export default function ProductDetail() {
    const params = useParams();
    const productId = params?.id;

    const { user } = useAuth();
    const { cart, addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Form state
    const [userRating, setUserRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const currentItem = cart.find(
        (item) => item.product_id === Number(productId)
    );
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    const fetchProductAndReviews = useCallback(async () => {
        if (!productId) return;

        try {
            const [prodRes, revRes] = await Promise.all([
                fetch(`http://localhost:5000/products/${productId}`),
                fetch(`http://localhost:5000/products/${productId}/reviews`)
            ]);

            if (prodRes.ok) {
                const prodData: Product = await prodRes.json();
                setProduct(prodData);
            }

            if (revRes.ok) {
                const revData = await revRes.json();
                setReviews(revData.reviews || []);
                setAvgRating(Number(revData.avg_rating) || 0);
                setTotalReviews(Number(revData.total_reviews) || 0);

                // Nếu user hiện tại đã từng review, điền sẵn thông tin để chỉnh sửa
                if (user && revData.reviews) {
                    const existingMyReview = revData.reviews.find((r: ReviewItem) => r.user_id === user.id);
                    if (existingMyReview) {
                        setUserRating(existingMyReview.rating);
                        setComment(existingMyReview.comment);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi tải thông tin sản phẩm và đánh giá:", error);
        } finally {
            setLoading(false);
        }
    }, [productId, user]);

    useEffect(() => {
        fetchProductAndReviews();
    }, [fetchProductAndReviews]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Vui lòng đăng nhập để đánh giá");
            return;
        }

        if (!comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setSubmittingReview(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/products/${productId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: userRating,
                    comment: comment.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể gửi đánh giá");
            }

            alert("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
            fetchProductAndReviews();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Không thể xóa đánh giá");
            }

            fetchProductAndReviews();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-500">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 text-center">
                <p className="text-xl font-semibold text-gray-700 mb-4">Không tìm thấy sản phẩm.</p>
                <Link href="/" className="bg-black text-white px-6 py-2.5 rounded-lg text-sm">
                    ← Quay lại cửa hàng
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">

            {/* BREADCRUMB */}
            <div className="mb-6">
                <Link href="/" className="text-sm text-gray-500 hover:text-black">
                    ← Quay lại danh sách sản phẩm
                </Link>
            </div>

            {/* CHI TIẾT SẢN PHẨM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                <div className="h-96 bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden border p-4">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <span className="text-gray-400">
                            Ảnh sản phẩm
                        </span>
                    )}
                </div>

                <div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {product.brand}
                        </span>

                        {totalReviews > 0 && (
                            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                <span>★</span>
                                <span>{avgRating.toFixed(1)} / 5</span>
                                <span className="text-gray-400 font-normal">({totalReviews} đánh giá)</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold mt-3">
                        {product.name}
                    </h1>

                    <p className="text-3xl text-red-500 font-extrabold mt-4">
                        {Number(product.price).toLocaleString("vi-VN")} VNĐ
                    </p>

                    <div className="border-t border-b py-4 my-6 space-y-2">
                        <p className="text-sm text-gray-500">Mô tả sản phẩm:</p>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                            {product.description || "Chưa có mô tả chi tiết."}
                        </p>
                    </div>

                    <p className="text-sm text-gray-600">
                        Tình trạng: {product.stock > 0 ? (
                            <span className="text-green-600 font-semibold">Còn {product.stock} sản phẩm trong kho</span>
                        ) : (
                            <span className="text-red-500 font-semibold">Tạm hết hàng</span>
                        )}
                    </p>

                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-xl mt-6 hover:bg-gray-800 transition-colors font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {product.stock > 0 ? "🛒 Thêm vào giỏ hàng" : "Hết hàng"}
                    </button>

                    {currentQuantity > 0 && (
                        <p className="mt-3 text-sm text-gray-500">
                            Đã có <span className="font-bold text-black">{currentQuantity}</span> sản phẩm này trong giỏ hàng.
                        </p>
                    )}

                </div>

            </div>

            {/* KHU VỰC ĐÁNH GIÁ & BÌNH LUẬN */}
            <section className="mt-16 pt-10 border-t">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">
                            ⭐ Đánh giá & Nhận xét từ khách hàng
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Chia sẻ cảm nhận thực tế về chất lượng và hiệu năng của {product.name}
                        </p>
                    </div>

                    {/* STATS BADGE */}
                    <div className="flex items-center gap-4 bg-gray-50 border p-4 rounded-xl">
                        <div className="text-center">
                            <span className="text-3xl font-extrabold text-amber-500">
                                {totalReviews > 0 ? avgRating.toFixed(1) : "0"}
                            </span>
                            <span className="text-xs text-gray-400 block">trên 5 sao</span>
                        </div>
                        <div className="border-l pl-4 text-xs text-gray-500">
                            <div className="flex text-amber-400 text-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                        {star <= Math.round(avgRating) ? "★" : "☆"}
                                    </span>
                                ))}
                            </div>
                            <span className="mt-0.5 block">{totalReviews} lượt đánh giá</span>
                        </div>
                    </div>
                </div>

                {/* FORM GỬI ĐÁNH GIÁ */}
                <div className="bg-gray-50 border rounded-2xl p-6 mb-10">
                    <h3 className="text-lg font-bold mb-3">
                        ✍️ Viết đánh giá của bạn
                    </h3>

                    {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Chọn số sao đánh giá:
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setUserRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <span className={
                                                star <= (hoverRating || userRating)
                                                    ? "text-amber-400"
                                                    : "text-gray-300"
                                            }>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                    <span className="ml-3 text-sm font-semibold text-gray-700">
                                        {userRating === 5 && "Tuyệt vời (5/5)"}
                                        {userRating === 4 && "Rất tốt (4/5)"}
                                        {userRating === 3 && "Bình thường (3/5)"}
                                        {userRating === 2 && "Tạm được (2/5)"}
                                        {userRating === 1 && "Không hài lòng (1/5)"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Nội dung nhận xét:
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Chia sẻ cảm nhận về thiết kế, thời lượng pin, camera, độ mượt..."
                                    rows={3}
                                    className="w-full border rounded-xl p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-600 mb-3">
                                Bạn cần đăng nhập tài khoản để có thể đánh giá sản phẩm này.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>

                {/* DANH SÁCH BÌNH LUẬN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-4">
                        Tất cả nhận xét ({reviews.length})
                    </h3>

                    {reviews.length === 0 ? (
                        <div className="border border-dashed rounded-xl p-8 text-center text-gray-400">
                            Chưa có nhận xét nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                        </div>
                    ) : (
                        reviews.map((rev) => {
                            const isMine = user && user.id === rev.user_id;
                            const canDelete = isMine || user?.role === "admin";

                            return (
                                <div key={rev.id} className="border rounded-xl p-5 bg-white shadow-sm hover:border-gray-300 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                                {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : "U"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900">
                                                        {rev.user_name}
                                                    </h4>
                                                    {isMine && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                            Bạn
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="text-amber-400 text-xs">
                                                        {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        • {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {canDelete && (
                                            <button
                                                onClick={() => handleDeleteReview(rev.id)}
                                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                                                title="Xóa đánh giá này"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-gray-700 text-sm mt-3 pl-12 leading-relaxed">
                                        {rev.comment}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

            </section>

        </main>
    );
}
