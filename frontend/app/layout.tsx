import "./globals.css";
import React from "react";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <Navbar />
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}