# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_BACK_END_URL` to your backend host (or backend folder host), for example: `http://localhost:8080`.
3. If your API is served under a different prefix, change `VITE_BACK_END_API_PREFIX` (default is `/api`).
