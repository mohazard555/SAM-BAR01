import React, { useState } from 'react';
import { UserIcon } from './Icons';

interface LoginModalProps {
    onLogin: (username: string, password: string) => void;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex flex-col items-center mb-4">
                            <UserIcon className="w-12 h-12 text-primary-600 mb-2"/>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">دخول المدير</h3>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">كلمة المرور</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    autoFocus
                                    required
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
                                />
                             </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-start space-x-3">
                        <button type="submit" className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700">
                            دخول
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};