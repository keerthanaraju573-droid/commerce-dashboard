# E-commerce Admin Dashboard

A complete, submission-ready Next.js App Router admin dashboard for managing users and products. The UI never talks to Fake Store API directly. All browser traffic goes through a service layer, Axios, and internal Next.js API routes.

## 1. Project overview

ShopAdmin is a responsive e-commerce admin console. It includes:

- Admin login with a signed authentication token stored in an HTTP-only cookie
- Next.js Middleware protection for dashboard, users, and products
- User and product CRUD, search, sorting, pagination, and detail pages
- Dashboard KPI cards for products, categories, users, and active users
- Consistent loading, empty, and error states

The external catalog source is [Fake Store API](https://fakestoreapi.com). No database is used.

## 2. Technologies used

- Next.js (App Router)
- React
- JavaScript ES6+
- Axios
- Next.js Middleware
- Next.js Route Handlers (`app/api`)
- Tailwind CSS
- Lucide React

## 3. Installation

```bash
npm install
```

## 4. Environment setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Environment variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://fakestoreapi.com
AUTH_SECRET=replace-this-with-a-long-random-string
```

`NEXT_PUBLIC_API_BASE_URL` is used **only by internal API routes** to reach Fake Store. React components and services never call Fake Store URLs.

## 5. Commands

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## 6. Project folder structure

```text
ecommerce-admin-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   └── logout/route.js
│   │   ├── users/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   └── products/
│   │       ├── route.js
│   │       └── [id]/route.js
│   ├── login/page.js
│   ├── (admin)/
│   │   ├── layout.js
│   │   ├── dashboard/page.js
│   │   ├── users/
│   │   └── products/
│   ├── layout.js
│   ├── page.js
│   └── not-found.js
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── users/
│   ├── products/
│   └── ui/
├── services/
│   ├── authService.js
│   ├── userService.js
│   └── productService.js
├── lib/
│   ├── axios.js
│   ├── auth.js
│   ├── fakestore.js
│   ├── overlayStore.js
│   ├── apiAuth.js
│   ├── errors.js
│   └── utils.js
├── public/
├── middleware.js
├── .env.example
├── package.json
└── README.md
```

## 7. Features implemented

- Admin login and logout
- HTTP-only auth cookie and signed token
- Middleware protection for `/dashboard`, `/users`, and `/products`
- Dashboard KPIs: Total Products, Total Categories, Total Users, Active Users
- Users: list, search, sort, pagination, create, edit, delete, details
- Products: list, search, pagination, create, edit, delete, details
- Confirmation dialogs for delete actions
- Loading skeletons/spinners and disabled submit buttons
- HTTP 200, 201, 400, 401, 403, 404, and 500 handling
- Mobile drawer navigation, usable tables, and single-column forms

### Demo credentials

```text
Email: admin@example.com
Password: admin123
```

## 8. API architecture

```text
Frontend
    ↓
Service Layer (services/*.js)
    ↓
Axios instance (lib/axios.js)
    ↓
Next.js Internal API Routes (app/api/*)
    ↓
Fake Store API (https://fakestoreapi.com)
```

Frontend pages never import Fake Store URLs. They call `authService`, `userService`, and `productService`. Those services use the shared Axios instance to call:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|POST /api/users`
- `GET|PUT|DELETE /api/users/[id]`
- `GET|POST /api/products`
- `GET|PUT|DELETE /api/products/[id]`

Internal route handlers use `lib/fakestore.js` to talk to Fake Store. Axios request and response interceptors handle credentials, 200/201 success processing, and consistent error messages for 400, 401, 403, 404, and 500. A 401 response redirects the browser to `/login`.

### Authentication

1. Login validates `admin@example.com` / `admin123` in `/api/auth/login`.
2. A signed HMAC token is generated and stored in the HTTP-only `admin_session` cookie.
3. Logout clears that cookie.
4. API routes require a valid admin session.

No database is used for authentication.

### Middleware

`middleware.js` inspects the auth cookie and:

- Redirects `/` to `/dashboard` or `/login`
- Redirects unauthenticated users away from `/dashboard`, `/users`, and `/products` to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`

This is server-side protection, not client-only routing.

### Fake Store write behavior

Fake Store simulates POST/PUT/DELETE and does not persist writes. This project still performs those API calls, then keeps a **server memory overlay** (not a database) so the current Node process can show created, updated, and deleted records in subsequent GETs. Restarting the server resets overlay data back to Fake Store’s original catalog.

## Screenshot routes

These screens exist and are ready to capture:

1. Login: `/login`
2. Dashboard: `/dashboard`
3. User listing: `/users`
4. User details: `/users/1`
5. Create user: `/users/create`
6. Edit user: `/users/1/edit`
7. Product listing: `/products`
8. Product details: `/products/1`
9. Create product: `/products/create`
10. Edit product: `/products/1/edit`
11. Mobile: resize to ~375px and open the menu
12. Tablet: resize to ~768px
