import React from 'react';
import { Item } from '../types';
import { AlertIcon } from './Icons';

interface AlertsPanelProps {
    undeliveredItems: Item[];
    onAlertClick: (barcode: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ undeliveredItems, onAlertClick }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-4">
                <AlertIcon /> أصناف لم تسلم
            </h3>
            {undeliveredItems.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {undeliveredItems.map(item => (
                        <li key={item.id}
                            onClick={() => onAlertClick(item.barcode)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.customerName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">الباركود: {item.barcode}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">تم تسليم جميع الأصناف.</p>
            )}
        </div>
    );
};