import axios from 'axios';
import api from '../../api/api';

const PUBLIC_PRODUCTS_BASE_URL = '/api/public/products';
const DEFAULT_PAGE_SIZE = 50;
const STOCK_OVERRIDES_STORAGE_KEY = 'smartcart_stock_overrides';

const loadStockOverrides = () => {
    try {
        const raw = localStorage.getItem(STOCK_OVERRIDES_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const saveStockOverrides = (overrides) => {
    localStorage.setItem(STOCK_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
};

const applyStockOverrides = (products) => {
    const overrides = loadStockOverrides();
    if (!Array.isArray(products) || products.length === 0) return [];

    return products.map((product) => {
        const key = String(product?.productId ?? '');
        if (!key || !(key in overrides)) return product;
        const nextQuantity = Number(overrides[key]);
        if (!Number.isFinite(nextQuantity)) return product;
        return { ...product, quantity: Math.max(0, nextQuantity) };
    });
};

export const fetchProductsAction = (queryString = "") => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });

        const params = new URLSearchParams(queryString);
        const requestedPageSize = Number(params.get("pageSize") || "");
        const fallbackPageSize = Number.isFinite(requestedPageSize) && requestedPageSize > 0 ? requestedPageSize : DEFAULT_PAGE_SIZE;

        const url = queryString 
            ? `${PUBLIC_PRODUCTS_BASE_URL}?${queryString}`
            : `${PUBLIC_PRODUCTS_BASE_URL}`;
        
        const response = await axios.get(url, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        // Handle different API response formats
        let productsArray = [];
        let pagination = {};
        let isServerPaginated = false;
        
        if (Array.isArray(response.data)) {
            productsArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            productsArray = response.data.data;
        } else if (response.data?.content && Array.isArray(response.data.content)) {
            productsArray = response.data.content;
            isServerPaginated = true;
            // Extract pagination info if available
            pagination = {
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages,
                lastPage: response.data.lastPage,
            };
        } else if (response.data?.products && Array.isArray(response.data.products)) {
            productsArray = response.data.products;
        }
        
        const productsWithStockOverrides = applyStockOverrides(productsArray);

        dispatch({
            type: "FETCH_PRODUCTS",
            payload: productsWithStockOverrides,
            pageNumber: pagination.pageNumber ?? 0,
            pageSize: pagination.pageSize ?? fallbackPageSize,
            totalElements: pagination.totalElements ?? productsWithStockOverrides.length,
            totalPages: pagination.totalPages ?? 1,
            lastPage: pagination.lastPage ?? true,
            isServerPaginated,
        });
        
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch products";
        dispatch({
            type: "IS_ERROR",
            payload: errorMsg,
        });
    }
};

export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        const errorMsg = error?.response?.data?.message || "Failed to fetch categories";
        dispatch({
            type: "IS_ERROR",
            payload: errorMsg,
        });
    }
};

export const simulateLocalOrderStockDeduction = (cartItems = []) => (dispatch, getState) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return;

    const currentProducts = getState().product?.products || [];
    const overrides = loadStockOverrides();
    const deductionMap = {};

    cartItems.forEach((item) => {
        const productId = String(item?.productId ?? '');
        if (!productId) return;

        const purchasedQty = Math.max(0, Number(item?.quantity) || 0);
        if (purchasedQty <= 0) return;

        const productFromState = currentProducts.find((product) => String(product?.productId) === productId);
        const baseQuantity = Number(
            Object.prototype.hasOwnProperty.call(overrides, productId)
                ? overrides[productId]
                : (productFromState?.quantity ?? item?.stockQuantity ?? 0)
        );

        const nextQuantity = Math.max(0, (Number.isFinite(baseQuantity) ? baseQuantity : 0) - purchasedQty);
        overrides[productId] = nextQuantity;
        deductionMap[productId] = nextQuantity;
    });

    saveStockOverrides(overrides);
    dispatch({ type: 'DEDUCT_PRODUCT_STOCK', payload: deductionMap });
};
