"use client";

import { useEffect, useState } from "react";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [stock, setStock] = useState("");

    const fetchProducts = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/products"
            );

            const data = await response.json();

            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const url = editingId
                ? `http://localhost:5000/products/${editingId}`
                : "http://localhost:5000/products";

            const method = editingId
                ? "PATCH"
                : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    brand,
                    price: Number(price),
                    description,
                    image,
                    stock: Number(stock)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setName("");
            setBrand("");
            setPrice("");
            setDescription("");
            setImage("");
            setStock("");

            setEditingId(null);
            setShowForm(false);

            fetchProducts();

        } catch (error) {
            alert(error.message);
        }
    };

    const handleEditProduct = (product) => {
        setEditingId(product.id);

        setName(product.name);
        setBrand(product.brand);
        setPrice(product.price);
        setDescription(product.description || "");
        setImage(product.image || "");
        setStock(product.stock);

        setShowForm(true);
    };

    const handleDeleteProduct = async (id) => {
            const confirmDelete = window.confirm(
                "Bạn có chắc muốn xóa sản phẩm này?"
            );

            if (!confirmDelete) {
                return;
            }

            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/products/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                fetchProducts();

            } catch (error) {
                alert(error.message);
            }
        };

    if (loading) {
        return (
            <p className="p-8">
                Đang tải sản phẩm...
            </p>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Quản lý sản phẩm
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Thêm, sửa và xóa sản phẩm
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-5 py-3 rounded-lg"
                >
                    {showForm
                        ? "Đóng"
                        : "+ Thêm sản phẩm"}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleCreateProduct}
                    className="border rounded-xl p-6 mb-8 space-y-4"
                >
                    <h2 className="text-xl font-bold">
                        {editingId
                            ? "Sửa sản phẩm"
                            : "Thêm sản phẩm mới"}
                    </h2>

                    <input
                        type="text"
                        placeholder="Tên sản phẩm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                    />

                    <input
                        type="number"
                        placeholder="Giá"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                    />

                    <textarea
                        placeholder="Mô tả"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        rows={4}
                    />

                    <input
                        type="text"
                        placeholder="URL hình ảnh"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <input
                        type="number"
                        placeholder="Số lượng trong kho"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-black text-white px-5 py-3 rounded-lg"
                    >
                        {editingId
                            ? "Cập nhật sản phẩm"
                            : "Thêm sản phẩm"}
                    </button>
                </form>
            )}

            <div className="border rounded-xl overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-4">
                                ID
                            </th>

                            <th className="text-left p-4">
                                Sản phẩm
                            </th>

                            <th className="text-left p-4">
                                Brand
                            </th>

                            <th className="text-left p-4">
                                Giá
                            </th>

                            <th className="text-left p-4">
                                Kho
                            </th>

                            <th className="text-left p-4">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.id}
                                className="border-t"
                            >
                                <td className="p-4">
                                    {product.id}
                                </td>

                                <td className="p-4">
                                    {product.name}
                                </td>

                                <td className="p-4">
                                    {product.brand}
                                </td>

                                <td className="p-4">
                                    {Number(
                                        product.price
                                    ).toLocaleString("vi-VN")} ₫
                                </td>

                                <td className="p-4">
                                    {product.stock}
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-2">

                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="border px-3 py-1 rounded"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Xóa
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>

        </div>
    );
}