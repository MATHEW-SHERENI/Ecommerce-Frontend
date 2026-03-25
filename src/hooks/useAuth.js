import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, refreshToken } from '../store/actions';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector(state => state.auth);

    // Auto-refresh token on app load if user exists
    useEffect(() => {
        const initAuth = async () => {
            const storedAuth = localStorage.getItem('auth');
            if (storedAuth && !user) {
                try {
                    const parsedAuth = JSON.parse(storedAuth);
                    if (parsedAuth?.jwtToken || parsedAuth?.token) {
                        // Try to get current user to validate token
                        await dispatch(getCurrentUser());
                    }
                } catch (error) {
                    console.log('Auth initialization failed:', error);
                    // Clear invalid auth data
                    localStorage.removeItem('auth');
                }
            }
        };

        initAuth();
    }, [dispatch, user]);

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
        refreshToken: () => dispatch(refreshToken()),
    };
};

export default useAuth;
