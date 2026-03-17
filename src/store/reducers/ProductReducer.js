const initialState = {
    products: null,
    filteredProducts: null,
    categories: null,
    pagination: {
        pageNumber: 0,
        pageSize: 50,
        totalElements: 0,
        totalPages: 1,
        lastPage: true,
    },
    isServerPaginated: false,
    loading: false,
    error: null,
};

const applyDeductionMap = (products, deductionMap) => {
    if (!Array.isArray(products) || products.length === 0) return products;

    return products.map((product) => {
        const key = String(product?.productId ?? '');
        if (!key || !Object.prototype.hasOwnProperty.call(deductionMap, key)) {
            return product;
        }

        const nextQuantity = Number(deductionMap[key]);
        if (!Number.isFinite(nextQuantity)) return product;
        return {
            ...product,
            quantity: Math.max(0, nextQuantity),
        };
    });
};

export const ProductReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                filteredProducts: action.payload, // Reset filtered when fetching
                isServerPaginated: action.isServerPaginated ?? state.isServerPaginated,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "SET_FILTERED_PRODUCTS":
            return {
                ...state,
                filteredProducts: action.payload,
            };
        case "FETCH_CATEGORIES":
            return {
                ...state,
                categories: action.payload,
            };
        case "DEDUCT_PRODUCT_STOCK":
            return {
                ...state,
                products: applyDeductionMap(state.products, action.payload || {}),
                filteredProducts: applyDeductionMap(state.filteredProducts, action.payload || {}),
            };
        case "IS_FETCHING":
            return {
                ...state,
                loading: true,
                error: null,
            };
        case "IS_SUCCESS":
            return {
                ...state,
                loading: false,
                error: null,
            };
        case "IS_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }   
};
