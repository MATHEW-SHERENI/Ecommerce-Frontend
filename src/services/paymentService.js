import api from '../api/api';

const normalizePath = (path, fallback) => {
    const basePath = path || fallback;
    if (basePath.startsWith('/')) return basePath;
    return `/${basePath}`;
};

const paymentService = {
    createStripePaymentIntent: async (payload) => {
        const endpoint = normalizePath(
            import.meta.env.VITE_STRIPE_INTENT_PATH,
            '/payments/stripe/create-intent'
        );
        const response = await api.post(endpoint, payload);
        return response.data;
    },
    getCheckoutCurrency: () => String(import.meta.env.VITE_ORDER_CURRENCY || 'USD').toUpperCase(),
};

export default paymentService;
