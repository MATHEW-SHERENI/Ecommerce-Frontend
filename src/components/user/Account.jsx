import React from 'react';
import useAuth from '../../hooks/useAuth';

const Account = () => {
    const { user } = useAuth();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h1>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {user?.username || 'N/A'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {user?.email || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User ID
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {user?.id || 'N/A'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {user?.roles?.join(', ') || 'User'}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-3">
                        <button className="w-full md:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors">
                            Edit Profile
                        </button>
                        <button className="w-full md:w-auto px-4 py-2 ml-0 md:ml-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
