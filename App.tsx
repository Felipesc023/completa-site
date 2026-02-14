import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Shop } from './components/Shop';
import { ProductDetail } from './components/ProductDetail';
import { Wishlist } from './components/Wishlist';
import { Contact } from './components/Contact';
import { Cart } from './components/Cart';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/Dashboard';
import { AdminProductList } from './components/admin/ProductList';
import { AdminProductForm } from './components/admin/ProductForm';
import { AdminVitrines } from './components/admin/Vitrines';
import { AdminOrderList } from './components/admin/OrderList';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <HashRouter>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProductList />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="vitrines" element={<AdminVitrines />} />
                  <Route path="orders" element={<AdminOrderList />} />
                  <Route path="settings" element={<div className="p-8">Em construção</div>} />
                </Route>
              </Routes>
            </HashRouter>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;