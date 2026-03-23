# ─────────────────────────────────────────────────────────────────
# COMPLETA — Script de Setup
# Execute estes comandos no terminal, na ordem indicada.
# ─────────────────────────────────────────────────────────────────

# 1. Entre na pasta onde você clonou o projeto
cd "C:\Users\felip\Downloads\completa-site"

# 2. Remova todos os arquivos antigos (mantém o .git para não perder o histórico)
# No PowerShell:
Get-ChildItem -Exclude .git | Remove-Item -Recurse -Force

# 3. Copie todos os arquivos novos gerados para esta pasta
# (você vai substituir manualmente ou via script abaixo)

# 4. Instale as dependências
npm install

# 5. Crie o .env.local com suas credenciais
# Copie o .env.example e preencha:
copy .env.example .env.local

# 6. Rode localmente
vercel dev

# ─────────────────────────────────────────────────────────────────
# ESTRUTURA FINAL ESPERADA
# ─────────────────────────────────────────────────────────────────
# completa-site/
# ├── api/
# │   └── health.ts
# ├── src/
# │   ├── components/
# │   │   ├── admin/
# │   │   │   └── AdminLayout.tsx
# │   │   ├── auth/
# │   │   │   └── ProtectedRoute.tsx
# │   │   ├── cart/
# │   │   │   └── CartDrawer.tsx
# │   │   ├── layout/
# │   │   │   ├── Footer.tsx
# │   │   │   ├── Header.tsx
# │   │   │   └── Layout.tsx
# │   │   └── ui/
# │   │       └── PageLoader.tsx
# │   ├── context/
# │   │   └── AuthContext.tsx
# │   ├── lib/
# │   │   └── firebase.ts
# │   ├── pages/
# │   │   ├── admin/
# │   │   │   ├── Dashboard.tsx
# │   │   │   ├── Orders.tsx
# │   │   │   ├── ProductForm.tsx
# │   │   │   ├── Products.tsx
# │   │   │   └── Vitrines.tsx
# │   │   ├── Checkout.tsx
# │   │   ├── Contact.tsx
# │   │   ├── Home.tsx
# │   │   ├── Login.tsx
# │   │   ├── NotFound.tsx
# │   │   ├── OrderConfirm.tsx
# │   │   ├── ProductDetail.tsx
# │   │   ├── Shop.tsx
# │   │   └── Wishlist.tsx
# │   ├── store/
# │   │   └── cartStore.ts
# │   ├── types/
# │   │   └── index.ts
# │   ├── App.tsx
# │   ├── index.css
# │   └── main.tsx
# ├── .env.example
# ├── .gitignore
# ├── index.html
# ├── package.json
# ├── postcss.config.js
# ├── tailwind.config.js
# ├── tsconfig.json
# ├── tsconfig.node.json
# ├── vercel.json
# └── vite.config.ts
