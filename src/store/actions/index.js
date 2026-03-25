import api from "../../api/api"

const buildUrlWithQuery = (path, queryString) => {
    const safeQuery = typeof queryString === "string" ? queryString.trim() : "";
    return safeQuery ? `${path}?${safeQuery}` : path;
};

const tryPostWithFallbackEndpoints = async (endpoints, payload) => {
    let lastError;

    for (const endpoint of endpoints) {
        try {
            return await api.post(endpoint, payload);
        } catch (error) {
            lastError = error;
            const status = error?.response?.status;
            if (status !== 403 && status !== 404) {
                throw error;
            }
        }
    }

    throw lastError;
};

const extractAuthErrorMessage = (error) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;

    return (
        data?.message ||
        data?.error ||
        data?.description ||
        data?.password ||
        "Internal Server Error"
    );
};

const extractApiErrorMessage = (error, fallbackMessage) => {
    const data = error?.response?.data;
    if (typeof data === "string") {
        return data;
    }

    return (
        data?.message ||
        data?.error ||
        data?.description ||
        fallbackMessage
    );
};

const normalizeAddressPayload = (sendData = {}) => {
    const normalizedPincode = String(sendData?.pincode ?? "")
        .trim()
        .replace(/\s+/g, "");

    return {
        buildingName: String(sendData?.buildingName ?? "").trim(),
        city: String(sendData?.city ?? "").trim(),
        street: String(sendData?.street ?? "").trim(),
        state: String(sendData?.state ?? "").trim(),
        pincode: normalizedPincode,
        country: String(sendData?.country ?? "").trim(),
    };
};

const getAddressPayloadCandidates = (sendData) => {
    const normalizedPayload = normalizeAddressPayload(sendData);

    return [
        normalizedPayload,
        {
            ...normalizedPayload,
            zipCode: normalizedPayload.pincode,
            pincode: undefined,
        },
    ];
};

const getAuthRequestConfig = (getState) => {
    const { user } = getState().auth || {};
    const token =
        user?.jwtToken ||
        user?.token ||
        user?.accessToken ||
        user?.jwt ||
        null;

    if (!token) {
        return undefined;
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const fetchProducts = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(buildUrlWithQuery("/public/products", queryString));
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch products",
         });
    }
};


export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_LOADER" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_ERROR" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch categories",
         });
    }
};


export const addToCart = (data, qty = 1, toast) => 
    (dispatch, getState) => {
        // Find the product
        const { products } = getState().products;
        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        // Check for stocks
        const isQuantityExist = getProduct.quantity >= qty;

        // If in stock -> add
        if (isQuantityExist) {
            dispatch({ type: "ADD_CART", payload: {...data, quantity: qty}});
            toast.success(`${data?.productName} added to the cart`);
            localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
        } else {
            // error
            toast.error("Out of stock");
        }
};


export const increaseCartQuantity = 
    (data, toast, currentQuantity, setCurrentQuantity) =>
    (dispatch, getState) => {
        // Find the product
        const { products } = getState().products;
        
        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        const isQuantityExist = getProduct.quantity >= currentQuantity + 1;

        if (isQuantityExist) {
            const newQuantity = currentQuantity + 1;
            setCurrentQuantity(newQuantity);

            dispatch({
                type: "ADD_CART",
                payload: {...data, quantity: newQuantity + 1 },
            });
            localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
        } else {
            toast.error("Quantity Reached to Limit");
        }

    };



export const decreaseCartQuantity = 
    (data, newQuantity) => (dispatch, getState) => {
        dispatch({
            type: "ADD_CART",
            payload: {...data, quantity: newQuantity},
        });
        localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
    }

export const removeFromCart =  (data, toast) => (dispatch, getState) => {
    dispatch({type: "REMOVE_CART", payload: data });
    toast.success(`${data.productName} removed from cart`);
    localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
}



export const authenticateSignInUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const rawUsername = String(sendData?.username || "").trim();
            const isEmailLogin = rawUsername.includes("@");
            const signinPayload = {
                username: rawUsername,
                userName: rawUsername,
                password: sendData?.password,
            };

            if (isEmailLogin) {
                signinPayload.email = rawUsername;
                signinPayload.usernameOrEmail = rawUsername;
            }

            let response;
            try {
                // Use the canonical endpoint first to avoid multiple failed attempts per submit.
                response = await api.post("/auth/signin", signinPayload);
            } catch (error) {
                if (error?.response?.status === 404) {
                    // Fallback only when backend exposes /auth/login instead of /auth/signin.
                    response = await api.post("/auth/login", signinPayload);
                } else {
                    throw error;
                }
            }

            const { data } = response;
            dispatch({ type: "LOGIN_USER", payload: data });
            localStorage.setItem("auth", JSON.stringify(data));
            reset();
            toast.success("Login Success");
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error(extractAuthErrorMessage(error));
        } finally {
            setLoader(false);
        }
}


export const registerNewUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const registerPayload = {
                ...sendData,
                userName: sendData?.username,
            };

            const { data } = await tryPostWithFallbackEndpoints([
                "/auth/signup",
                "/auth/register",
            ], registerPayload);
            reset();
            toast.success(data?.message || "User Registered Successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error(extractAuthErrorMessage(error));
        } finally {
            setLoader(false);
        }
};


export const logOutUser = (navigate) => (dispatch) => {
    dispatch({ type:"LOG_OUT" });
    localStorage.removeItem("auth");
    navigate("/login");
};

export const addUpdateUserAddress =
     (sendData, toast, addressId, setOpenAddressModal) => async (dispatch, getState) => {
    /*
    const { user } = getState().auth;
    await api.post(`/addresses`, sendData, {
          headers: { Authorization: "Bearer " + user.jwtToken },
        });
    */
    dispatch({ type:"BUTTON_LOADER" });
    let isAddressSaved = false;

    try {
        const payloadCandidates = getAddressPayloadCandidates(sendData);
        const requestConfig = getAuthRequestConfig(getState);
        let lastError;

        for (const payload of payloadCandidates) {
            try {
                if (!addressId) {
                    await api.post("/addresses", payload, requestConfig);
                } else {
                    await api.put(`/addresses/${addressId}`, payload, requestConfig);
                }

                isAddressSaved = true;
                break;
            } catch (error) {
                lastError = error;
                const statusCode = error?.response?.status;
                if (statusCode !== 400 && statusCode !== 422) {
                    throw error;
                }
            }
        }

        if (!isAddressSaved) {
            throw lastError;
        }

        dispatch(getUserAddresses());
        toast.success("Address saved successfully");
        dispatch({ type:"IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        toast.error(extractApiErrorMessage(error, "Failed to save address"));
        dispatch({ type:"IS_ERROR", payload: null });
    } finally {
        if (isAddressSaved) {
            setOpenAddressModal(false);
        }
    }
};


export const deleteUserAddress = 
    (toast, addressId, setOpenDeleteModal) => async (dispatch, getState) => {
    try {
        dispatch({ type: "BUTTON_LOADER" });
        const requestConfig = getAuthRequestConfig(getState);
        await api.delete(`/addresses/${addressId}`, requestConfig);
        dispatch({ type: "IS_SUCCESS" });
        dispatch(getUserAddresses());
        dispatch(clearCheckoutAddress());
        toast.success("Address deleted successfully");
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Some Error Occured",
         });
    } finally {
        setOpenDeleteModal(false);
    }
};

export const clearCheckoutAddress = () => {
    return {
        type: "REMOVE_CHECKOUT_ADDRESS",
    }
};

export const getUserAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const requestConfig = getAuthRequestConfig(getState);
        const { data } = await api.get(`/addresses`, requestConfig);
        dispatch({type: "USER_ADDRESS", payload: data});
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        if (error?.response?.status === 401) {
            dispatch({ type: "LOG_OUT" });
            localStorage.removeItem("auth");
            localStorage.removeItem("CHECKOUT_ADDRESS");
            dispatch({
                type: "IS_ERROR",
                payload: "Session expired. Please login again.",
            });
            return;
        }

        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch user addresses",
         });
    }
};

export const selectUserCheckoutAddress = (address) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    
    return {
        type: "SELECT_CHECKOUT_ADDRESS",
        payload: address,
    }
};


export const addPaymentMethod = (method) => {
    return {
        type: "ADD_PAYMENT_METHOD",
        payload: method,
    }
};


export const createUserCart = (sendCartItems) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const requestConfig = getAuthRequestConfig(getState);
        if (!requestConfig) {
            dispatch({
                type: "IS_ERROR",
                payload: "Please login again to sync your cart.",
            });
            return;
        }

        const normalizedCartItems = (Array.isArray(sendCartItems) ? sendCartItems : [])
            .map((item) => ({
                productId: item?.productId ?? item?.id,
                quantity: Number(item?.quantity || 0),
            }))
            .filter((item) => item.productId != null && item.quantity > 0);

        if (normalizedCartItems.length === 0) {
            dispatch({ type: "IS_SUCCESS" });
            return;
        }

        // Backend expects one cart item per request body: { productId, quantity }.
        for (const item of normalizedCartItems) {
            await api.post('/cart/create', item, requestConfig);
        }

        await dispatch(getUserCart());
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: extractApiErrorMessage(error, "Failed to create cart items"),
         });
    }
};


export const getUserCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const requestConfig = getAuthRequestConfig(getState);
        const { data } = await api.get('/carts/users/cart', requestConfig);
        
        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: data.products,
            totalPrice: data.totalPrice,
            cartId: data.cartId
        })
        localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch cart items",
         });
    }
};


export const createStripePaymentSecret 
    = (sendData) => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const { data } = await api.post("/order/stripe-client-secret", sendData);
            dispatch({ type: "CLIENT_SECRET", payload: data });
              localStorage.setItem("client-secret", JSON.stringify(data));
              dispatch({ type: "IS_SUCCESS" });
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to create client secret");
        }
};


export const stripePaymentConfirmation 
    = (sendData, setErrorMesssage, setLoadng, toast) => async (dispatch, getState) => {
        try {
            const response  = await api.post("/order/users/payments/online", sendData);
            if (response.data) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("cartItems");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                toast.success("Order Accepted");
              } else {
                setErrorMesssage("Payment Failed. Please try again.");
              }
        } catch (error) {
            setErrorMesssage("Payment Failed. Please try again.");
        }
};

export const analyticsAction = () => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const requestConfig = getAuthRequestConfig(getState);
            const { data } = await api.get('/admin/app/analytics', requestConfig);
            dispatch({
                type: "FETCH_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: extractApiErrorMessage(error, "Failed to fetch analytics data"),
            });
        }
};

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const requestConfig = getAuthRequestConfig(getState);
        
        const { data } = await api.get(buildUrlWithQuery(endpoint, queryString), requestConfig);
        dispatch({
            type: "GET_ADMIN_ORDERS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch orders data",
         });
    }
};



export const updateOrderStatusFromDashboard =
     (orderId, orderStatus, toast, setLoader, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
        const requestConfig = getAuthRequestConfig(getState);
        
        const { data } = await api.put(`${endpoint}${orderId}/status`, { status: orderStatus}, requestConfig);
        toast.success(data.message || "Order updated successfully");
        await dispatch(getOrdersForDashboard());
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false)
    }
};


export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/products" : "/seller/products";
        const requestConfig = getAuthRequestConfig(getState);
        
        const { data } = await api.get(buildUrlWithQuery(endpoint, queryString), requestConfig);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch dashboard products",
         });
    }
};


export const updateProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        const requestConfig = getAuthRequestConfig(getState);
        
        await api.put(`${endpoint}${sendData.id}`, sendData, requestConfig);
        toast.success("Product update successful");
        reset();
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product update failed");
        setLoader(false);
    }
};



export const addNewProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async(dispatch, getState) => {
        try {
            setLoader(true);
            const endpoint = isAdmin ? "/admin/categories/" : "/seller/categories/";
            const requestConfig = getAuthRequestConfig(getState);
            
            await api.post(`${endpoint}${sendData.categoryId}/product`,
                sendData,
                requestConfig
            );
            toast.success("Product created successfully");
            reset();
            setOpen(false);
            await dispatch(dashboardProductsAction());
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.description || "Product creation failed");
        } finally {
            setLoader(false);
        }
    }

export const deleteProduct = 
    (setLoader, productId, toast, setOpenDeleteModal, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true)
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        const requestConfig = getAuthRequestConfig(getState);
        
        await api.delete(`${endpoint}${productId}`, requestConfig);
        toast.success("Product deleted successfully");
        setLoader(false);
        setOpenDeleteModal(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        console.log(error);
        toast.error(
            error?.response?.data?.message || "Some Error Occured"
        )
    }
};


export const updateProductImageFromDashboard = 
    (formData, productId, toast, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.put(`${endpoint}${productId}/image`, formData);
        toast.success("Image upload successful");
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product Image upload failed");
     
    }
};

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
        const { data } = await api.get(buildUrlWithQuery("/public/categories", queryString));
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data["content"],
      pageNumber: data["pageNumber"],
      pageSize: data["pageSize"],
      totalElements: data["totalElements"],
      totalPages: data["totalPages"],
      lastPage: data["lastPage"],
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);

    dispatch({
      type: "IS_ERROR",
      payload: err?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);
      
      await api.post("/admin/categories", sendData, requestConfig);
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset();
      toast.success("Category Created Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to create new category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);

      await api.put(`/admin/categories/${categoryID}`, sendData, requestConfig);

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset();
      toast.success("Category Update Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to update category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);

      await api.delete(`/admin/categories/${categoryID}`, requestConfig);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast.success("Category Delete Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };


  export const getAllSellersDashboard =
  (queryString) => async (dispatch, getState) => {
    const { user } = getState().auth;
    try {
      dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get(buildUrlWithQuery("/auth/sellers", queryString));
      dispatch({
        type: "GET_SELLERS",
        payload: data["content"],
        pageNumber: data["pageNumber"],
        pageSize: data["pageSize"],
        totalElements: data["totalElements"],
        totalPages: data["totalPages"],
        lastPage: data["lastPage"],
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Failed to fetch sellers data",
      });
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
    try {
      setLoader(true);
      await api.post("/auth/signup", sendData);
      reset();
      toast.success("Seller registered successfully!");

      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.password ||
          "Internal Server Error"
      );
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };