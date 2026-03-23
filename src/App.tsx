import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PageLoader } from '@/components/ui/PageLoader'

// Lazy loading — cada página só carrega quando acessada
const Home           = React.lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Shop           = React.lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })))
const ProductDetail  = React.lazy(() => import('@/pages/ProductDetail').then(m => ({ default: m.ProductDetail })))
const Wishlist       = React.lazy(() => import('@/pages/Wishlist').then(m => ({ default: m.Wishlist })))
const Checkout       = React.lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })))
const Contact        = React.lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))
const Login          = React.lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const OrderConfirm   = React.lazy(() => import('@/pages/OrderConfirm').then(m => ({ default: m.OrderConfirm })))
const MyOrders       = React.lazy(() => import('@/pages/MyOrders').then(m => ({ default: m.MyOrders })))
const NotFound       = React.lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))

// Admin
const AdminDashboard  = React.lazy(() => import('@/pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts   = React.lazy(() => import('@/pages/admin/Products').then(m => ({ default: m.AdminProducts })))
const AdminProductForm = React.lazy(() => import('@/pages/admin/ProductForm').then(m => ({ default: m.AdminProductForm })))
const AdminOrders     = React.lazy(() => import('@/pages/admin/Orders').then(m => ({ default: m.AdminOrders })))
const AdminVitrines   = React.lazy(() => import('@/pages/admin/Vitrines').then(m => ({ default: m.AdminVitrines })))

// Scroll para o topo em cada navegação
function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Rotas públicas ── */}
            <Route element={<Layout />}>
              <Route index               element={<Home />} />
              <Route path="loja"         element={<Shop />} />
              <Route path="produto/:id"  element={<ProductDetail />} />
              <Route path="wishlist"     element={<Wishlist />} />
              <Route path="checkout"     element={<Checkout />} />
              <Route path="pedido/:id"   element={<OrderConfirm />} />
              <Route path="minha-conta/pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="contato"      element={<Contact />} />
              <Route path="login"        element={<Login />} />
              <Route path="*"            element={<NotFound />} />
            </Route>

            {/* ── Rotas admin (protegidas) ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index                       element={<AdminDashboard />} />
              <Route path="produtos"             element={<AdminProducts />} />
              <Route path="produtos/novo"        element={<AdminProductForm />} />
              <Route path="produtos/:id/editar"  element={<AdminProductForm />} />
              <Route path="pedidos"              element={<AdminOrders />} />
              <Route path="vitrines"             element={<AdminVitrines />} />
            </Route>

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
