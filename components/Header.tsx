import React from 'react';
import { BarcodeIcon, UserIcon, LogoutIcon, SettingsIcon } from './Icons';

interface HeaderProps {
    appName: string;
    appLogo: string | null;
    isAdmin: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ appName, appLogo, isAdmin, onLoginClick, onLogoutClick, onSettingsClick }) => {
    return (
        <header className="bg-primary-600 dark:bg-primary-700 shadow-md print-hide text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {appLogo ? (
                            <img src={appLogo} alt="App Logo" className="h-10 w-10 object-contain bg-white rounded p-1"/>
                        ) : (
                            <BarcodeIcon className="h-8 w-8 text-white" />
                        )}
                        <h1 className="text-xl font-bold">
                            {appName}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                             <button
                                onClick={onSettingsClick}
                                className="p-2 text-sm font-medium text-white bg-white bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors"
                                title="الإعدادات"
                            >
                                <SettingsIcon />
                            </button>
                        )}
                        {isAdmin ? (
                            <button
                                onClick={onLogoutClick}
                                className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors"
                            >
                                <LogoutIcon />
                                <span>خروج المدير</span>
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-primary-600 bg-white rounded-md hover:bg-gray-100 transition-colors"
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
