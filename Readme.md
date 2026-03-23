# Ecommerce Frontend

## Project Overview
This repository contains the frontend application for an ecommerce platform built with React and Vite. It includes:

- Public storefront pages (home, products, about, contact)
- Authentication (login and registration)
- Cart and checkout flow
- Stripe payment confirmation flow
- Role-aware admin/seller dashboard areas

The app communicates with a backend API and supports running locally with Vite or as a containerized static app via Nginx.

## Technology Stack
- React 19
- Vite 7
- React Router 7
- Redux Toolkit + React Redux
- Axios
- Tailwind CSS v4
- Material UI
- Headless UI
- Stripe React SDK

## Key Application Areas
### Storefront
- Home page
- Product listing and product detail modal interactions
- About and contact pages

### User Flow
- Login and registration
- Cart management
- Checkout and payment confirmation

### Admin/Seller Flow
- Dashboard metrics
- Product management
- Order management
- Category management (admin)
- Seller management (admin)

## Access Control
Routing guards are implemented through `src/components/PrivateRoute.jsx`:

- Unauthenticated users are redirected to `/login` for protected routes.
- Authenticated users cannot access public auth pages (`/login`, `/register`).
- Admin-only routes are mounted under `/admin`.
- Seller users are allowed only a subset of admin paths:
	- `/admin/orders`
	- `/admin/products`

## Routes
Defined in `src/App.jsx`.

Public routes:
- `/`
- `/products`
- `/about`
- `/contact`
- `/cart`
- `/login`
- `/register`

Authenticated routes:
- `/checkout`
- `/order-confirm`

Admin/Seller routes:
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/categories`
- `/admin/sellers`

## State Management
Redux store is configured in `src/store/reducers/store.js`.

Primary slices:
- `products`
- `errors`
- `carts`
- `auth`
- `payment`
- `admin`
- `order`
- `seller`

The app preloads user, cart, and selected checkout address from local storage.

## API and Environment Configuration
API client:
- `src/api/api.js`
- Uses Axios with `withCredentials: true`
- Base URL is resolved from environment utilities in `src/utils/env.js`

Environment variables (create a local `.env` file):

```env
VITE_BACK_END_URL=http://localhost:5000
VITE_BACK_END_API_PREFIX=/api
VITE_API_AUTH_BASE_URL=http://localhost:5000/api/auth
VITE_API_PUBLIC_BASE_URL=http://localhost:5000/api/public
VITE_FRONTEND_URL=http://localhost:5173
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_SKIP_BACKEND_IMAGES=false
```

Notes:
- In development, Vite proxies `/api` and `/images` to `VITE_BACK_END_URL`.
- In production builds, backend URL resolution is handled by `src/utils/env.js`.
- `.env` is intentionally git-ignored and should not be committed.

## Getting Started
### Prerequisites
- Node.js 20+ (Node 22 recommended)
- npm
- Running backend API compatible with the frontend contract

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Default Vite URL:
- `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build Locally
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## Docker
This repository includes a multi-stage Docker build and a Compose file.

### Build and Run with Docker Compose
```bash
docker compose up --build
```

Container details:
- Service name: `frontend`
- Container name: `ecommerce-frontend`
- Exposed host port: `8080`
- Served by Nginx on container port `80`

Access URL:
- `http://localhost:8080`

## Project Structure
High-level structure:

```text
src/
	api/
	components/
		admin/
		auth/
		cart/
		checkout/
		home/
		products/
		shared/
	hooks/
	store/
		actions/
		reducers/
	utils/
public/
Dockerfile
compose.yaml
vite.config.js
```

## Common Troubleshooting
### Login Request Errors (403/401/500)
- Confirm backend is running and reachable at `VITE_BACK_END_URL`.
- Verify backend auth endpoints expected by frontend:
	- Primary: `/api/auth/signin`
	- Fallback: `/api/auth/login` (used only when primary is not found)
- Check backend CORS and credential settings if using cookies/sessions.
- Validate user credentials and account status in backend.

### Missing Images
- Ensure backend serves images under `/images`.
- Verify `VITE_SKIP_BACKEND_IMAGES=false` for normal backend image loading.

### Port Conflicts
- If `5173` is in use, stop conflicting process or run Vite with another port.
- For Docker, ensure host port `8080` is free.

## Development Notes
- Keep `.env` local and never commit secrets.
- Prefer feature branches for all changes.
- Run `npm run build` before pushing to catch integration issues early.

## License
No license file is currently defined in this repository.
