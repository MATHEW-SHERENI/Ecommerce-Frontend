import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/actions';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const ProfileLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuth();

    const handleLogout = () => {
        dispatch(logoutUser(navigate, toast));
    };

    // Redirect to orders if on base profile path
    useEffect(() => {
        if (location.pathname === '/profile' || location.pathname === '/profile/') {
            navigate('/profile/orders', { replace: true });
        }
    }, [location.pathname, navigate]);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const navigationItems = [
        {
            name: 'Orders',
            href: '/profile/orders',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            name: 'Account Info',
            href: '/profile/account',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            name: 'Addresses',
            href: '/profile/addresses',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            name: 'Payment Methods',
            href: '/profile/payments',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Profile Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500">
                                <div className="flex items-center">
                                    <div className="bg-white bg-opacity-20 rounded-full p-3">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-semibold text-white">
                                            {user?.username || 'User'}
                                        </h2>
                                        <p className="text-orange-100 text-sm">
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="px-0 py-2">
                                {navigationItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </NavLink>
                                ))}
                                
                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-6 py-3 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mt-8 lg:mt-0 lg:col-span-9">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
