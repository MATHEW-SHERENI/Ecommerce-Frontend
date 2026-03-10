const initialState = {
    products: null,
    filteredProducts: null,
    categories: null,
    pagination: {},
    loading: false,
    error: null,
};

export const ProductReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                filteredProducts: action.payload, // Reset filtered when fetching
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