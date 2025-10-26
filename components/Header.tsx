import React from 'react';
import { BarcodeIcon, UserIcon, LogoutIcon } from './Icons';

interface HeaderProps {
    isAdmin: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin, onLoginClick, onLogoutClick }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <BarcodeIcon className="h-8 w-8 text-primary-600" />
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            مراقبة حركة الأصناف
                        </h1>
                    </div>
                    <div>
                        {isAdmin ? (
                            <button
                                onClick={onLogoutClick}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <LogoutIcon />
                                <span>خروج المدير</span>
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                            >
                                <UserIcon />
                                <span>دخول المدير</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};