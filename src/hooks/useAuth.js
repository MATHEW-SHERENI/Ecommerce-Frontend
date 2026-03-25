import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector(state => state.auth);

    // Auto-validate auth on app load if user exists in localStorage but not in Redux
    useEffect(() => {
        const initAuth = async () => {
            const storedAuth = localStorage.getItem('auth');
            console.log('useAuth: Initializing auth. StoredAuth:', !!storedAuth, 'User in Redux:', !!user);
            
            if (storedAuth && !user) {
                try {
                    const parsedAuth = JSON.parse(storedAuth);
                    console.log('useAuth: Parsed auth data:', { hasToken: !!(parsedAuth?.jwtToken || parsedAuth?.token), username: parsedAuth?.username });
                    
                    if (parsedAuth?.jwtToken || parsedAuth?.token) {
                        // Set user in Redux from localStorage
                        console.log('useAuth: Setting user in Redux from localStorage');
                        dispatch({ type: "LOGIN_USER", payload: parsedAuth });
                        
                        // Don't validate token immediately on every page load to avoid auth loops
                        // Let the API interceptor handle token validation when making requests
                    }
                } catch (error) {
                    console.error('useAuth: Auth initialization failed:', error);
                    // Clear invalid auth data
                    localStorage.removeItem('auth');
                    dispatch({ type: "LOG_OUT" });
                }
            }
        };

        // Only run on mount, not on every user change
        if (!user && localStorage.getItem('auth')) {
            initAuth();
        }
    }, []); // Empty dependency array to only run on mount

    const isAuthenticated = !!user;
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ADMIN';
    const isSeller = user?.roles?.includes('ROLE_SELLER') || user?.role === 'SELLER';
    const isUser = user?.roles?.includes('ROLE_USER') || user?.role === 'USER';

    return {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSeller,
        isUser,
    };
};

export default useAuth;


