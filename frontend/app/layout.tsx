import "./globals.css";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body>
                <CartProvider>
                    <Navbar />
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}