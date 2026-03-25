const initialState = {
    user: null,
    address: [],
    clientSecret: null,
    selectedUserCheckoutAddress: null,
    loading: false,
    error: null,
}

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case "AUTH_LOADING":
            return { ...state, loading: true, error: null };
        case "LOGIN_USER":
            return { 
                ...state, 
                user: action.payload, 
                loading: false, 
                error: null 
            };
        case "AUTH_ERROR":
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };
        case "USER_ADDRESS":
            return { ...state, address: action.payload };
        case "SELECT_CHECKOUT_ADDRESS":
            return { ...state, selectedUserCheckoutAddress: action.payload };
        case "REMOVE_CHECKOUT_ADDRESS":
            return { ...state, selectedUserCheckoutAddress: null };
        case "CLIENT_SECRET":
            return { ...state, clientSecret: action.payload };
        case "REMOVE_CLIENT_SECRET_ADDRESS":
            return { ...state, clientSecret: null, selectedUserCheckoutAddress: null };
        case "LOG_OUT":
            return { 
                user: null,
                address: [],
                selectedUserCheckoutAddress: null,
                clientSecret: null,
                loading: false,
                error: null,
             };
        case "FETCH_SELLERS":
            return { ...state, sellers: action.payload };
             
        default:
            return state;
    }
};