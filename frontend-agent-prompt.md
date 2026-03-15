# Frontend Agent Prompt — SmartCart React Integration

I am working on a React + Vite frontend that connects to a Spring Boot backend API.

## Backend Details
- **Base URL:** `http://localhost:5000`
- **Auth:** Cookie-based JWT. Cookie name is `springBootEcom`, set on `/api` path. It is `httpOnly: false`.
- **CORS:** Backend allows `http://localhost:3000` and `http://localhost:5173`. To avoid CORS issues entirely, I am using a **Vite proxy** instead of hitting the backend directly.

---

## Task 1 — Vite Proxy (if not already configured)

In `vite.config.js` (or `vite.config.ts`), add a proxy so all `/api` and `/images` requests are forwarded to the backend:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
    '/images': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

All API calls in the app must use a **relative base URL** (`/api`), NOT `http://localhost:5000/api`.

---

## Task 2 — Image URL Utility

The backend `GET /api/public/products` returns the `image` field as a full URL like `http://localhost:5000/images/abc.jpg`.
But `GET /api/public/categories/{id}/products` and `GET /api/public/products/keyword/{keyword}` return `image` as just a filename like `abc.jpg`.
Products without an uploaded image have `image: "default.png"` which does not exist on the server.

Create a utility function (e.g. `src/utils/imageUtils.js`) to normalise all cases:

```js
export const getImageUrl = (image) => {
  if (!image || image === 'default.png') {
    return 'https://placehold.co/300x200?text=No+Image';
  }
  // Strip host so Vite proxy handles the request
  if (image.startsWith('http://localhost:5000')) {
    return image.replace('http://localhost:5000', '');
  }
  // Bare filename — prepend images path
  if (!image.startsWith('http')) {
    return `/images/${image}`;
  }
  return image;
};
```

Use `getImageUrl(product.image)` as the `src` for every product image `<img>` tag in the app.

---

## API Endpoint Reference

### Auth (`/api/auth`)
| Method | Endpoint | Auth required | Body |
|--------|----------|---------------|------|
| POST | `/api/auth/signup` | No | `{ username, email, password, role: ["user"\|"seller"\|"admin"] }` |
| POST | `/api/auth/signin` | No | `{ username, password }` |
| POST | `/api/auth/signout` | No | — |
| GET | `/api/auth/user` | Yes | — |
| GET | `/api/auth/username` | Yes | — |

Signin response sets the JWT cookie automatically. All subsequent requests send it automatically (no manual token handling needed) as long as `withCredentials: true` is set on your HTTP client.

### Categories (`/api`)
| Method | Endpoint | Auth required |
|--------|----------|---------------|
| GET | `/api/public/categories` | No |
| POST | `/api/public/categories` | No |
| PUT | `/api/public/categories/{categoryId}` | No |
| DELETE | `/api/admin/categories/{categoryId}` | No |

Query params (GET): `pageNumber` (default 0), `pageSize` (default 50), `sortBy` (default `categoryId`), `sortOrder` (`asc`/`desc`)

Category body: `{ categoryName: string }`

### Products (`/api`)
| Method | Endpoint | Auth required |
|--------|----------|---------------|
| GET | `/api/public/products` | No |
| GET | `/api/public/categories/{categoryId}/products` | No |
| GET | `/api/public/products/keyword/{keyword}` | No |
| POST | `/api/admin/categories/{categoryId}/products` | No |
| PUT | `/api/admin/products/{productId}` | No |
| DELETE | `/api/admin/products/{productId}` | No |
| PUT | `/api/products/{productId}/image` | Yes (multipart/form-data, field: `image`) |

Query params (GET lists): `pageNumber`, `pageSize`, `sortBy` (default `productId`), `sortOrder`

Product body: `{ productName, description, quantity, price, discount }`

Product response includes: `{ productId, productName, image, description, quantity, price, discount, specialPrice }`
> **Note:** Always use `getImageUrl(product.image)` when rendering the image — see Task 2.

### Cart (`/api`)
| Method | Endpoint | Auth required |
|--------|----------|---------------|
| GET | `/api/carts/users/cart` | Yes |
| GET | `/api/carts` | Yes |
| POST | `/api/carts/products/{productId}/quantity/{quantity}` | Yes |
| PUT | `/api/cart/products/{productId}/quantity/{operation}` | Yes (`operation`: `"delete"` = decrement, anything else = increment) |
| DELETE | `/api/carts/{cartId}/product/{productId}` | Yes |

### Orders (`/api`)
| Method | Endpoint | Auth required |
|--------|----------|---------------|
| POST | `/api/order/users/payments/{paymentMethod}` | Yes |

Order body: `{ addressId, pgName, pgPaymentId, pgStatus, pgResponseMessage }`

---

## Seeded Test Users
| Username | Password | Role |
|----------|----------|------|
| `user1` | `password1` | ROLE_USER |
| `seller1` | `password2` | ROLE_SELLER |
| `admin` | `adminPass` | ROLE_USER, ROLE_SELLER, ROLE_ADMIN |

---

## Error Response Shapes
```json
// Validation error
{ "fieldName": "validation message" }

// Business/resource error
{ "message": "Readable error message", "status": false }
```

