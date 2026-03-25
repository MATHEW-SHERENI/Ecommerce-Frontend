import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';

const AuthDebugger = () => {
    const [storageAuth, setStorageAuth] = useState(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const { user, loading, error } = useSelector(state => state.auth);
    const { isAuthenticated, isAdmin, isSeller } = useAuth();

    useEffect(() => {
        const checkStorage = () => {
            try {
                const auth = localStorage.getItem('auth');
                setStorageAuth(auth ? JSON.parse(auth) : null);
            } catch (e) {
                setStorageAuth('INVALID JSON');
            }
        };

        checkStorage();
        // Check every 2 seconds for changes
        const interval = setInterval(() => {
            checkStorage();
            setRefreshCount(prev => prev + 1);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            fontSize: '12px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 9999
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1a365d' }}>
                🐛 Auth Debugger (Refresh: {refreshCount})
            </div>
            
            <div style={{ marginBottom: '8px' }}>
                <strong>Redux Auth State:</strong>
                <div style={{ paddingLeft: '10px', color: '#2d3748' }}>
                    • User: {user ? '✅ Loaded' : '❌ Null'}
                    • Loading: {loading ? '⏳ True' : '✅ False'}
                    • Error: {error ? `❌ ${error}` : '✅ None'}
                </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>useAuth Hook:</strong>
                <div style={{ paddingLeft: '10px', color: '#2d3748' }}>
                    • Authenticated: {isAuthenticated ? '✅ True' : '❌ False'}
                    • Admin: {isAdmin ? '✅ True' : '❌ False'}
                    • Seller: {isSeller ? '✅ True' : '❌ False'}
                </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>localStorage:</strong>
                <div style={{ paddingLeft: '10px', color: '#2d3748' }}>
                    {storageAuth ? (
                        typeof storageAuth === 'object' ? (
                            <>
                                • Username: {storageAuth.username || 'N/A'}
                                • Email: {storageAuth.email || 'N/A'}
                                • Token: {storageAuth.jwtToken ? '✅ Present' : '❌ Missing'}
                                • Roles: {storageAuth.roles ? storageAuth.roles.join(', ') : 'N/A'}
                            </>
                        ) : (
                            <span style={{ color: 'red' }}>• Invalid JSON</span>
                        )
                    ) : (
                        <span style={{ color: 'red' }}>• No auth data</span>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>Current Location:</strong>
                <div style={{ paddingLeft: '10px', color: '#2d3748' }}>
                    {window.location.pathname}
                </div>
            </div>

            <div style={{ fontSize: '10px', color: '#718096', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                Check browser console for detailed logs
            </div>
        </div>
    );
};

export default AuthDebugger;
