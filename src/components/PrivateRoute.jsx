import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ publicPage = false, adminOnly = false }) => {
    const { user, loading } = useSelector((state) => state.auth);
    const [isInitializing, setIsInitializing] = useState(true);
    const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
    const isSeller = user && user?.roles?.includes("ROLE_SELLER");
    const location = useLocation();

    // Check if we have stored auth data that's being loaded
    useEffect(() => {
        const checkAuth = () => {
            const storedAuth = localStorage.getItem('auth');
            if (storedAuth || user) {
                // Give some time for auth state to initialize
                setTimeout(() => setIsInitializing(false), 100);
            } else {
                setIsInitializing(false);
            }
        };

        checkAuth();
    }, [user]);

    // Show loading state during initialization
    if (isInitializing || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (publicPage) {
        return user ? <Navigate to="/" /> : <Outlet />
    }

    if (!user) {
        console.log('PrivateRoute: No user found, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (adminOnly) {
        if (!isAdmin && !isSeller) {
            return <Navigate to="/" replace />;
        }

        if (isSeller && !isAdmin) {
            const sellerAllowedPaths = ["/admin/orders", "/admin/products"];
            const sellerAllowed = sellerAllowedPaths.some(path => 
                location.pathname.startsWith(path)
            );
            if (!sellerAllowed) {
                return <Navigate to="/" replace />
            }
        }
    }
    
    return <Outlet />;
}

export default PrivateRoute

