import React, { useState } from 'react';
import { Item, ItemStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { EditIcon, SortAscIcon, SortDescIcon, DeleteIcon } from './Icons';

interface ItemTableProps {
    items: Item[];
    onEditItem: (item: Item) => void;
    onDeleteItem: (itemId: number) => void;
    lastScannedBarcode: string | null;
}

type SortKey = keyof Item;

export const ItemTable: React.FC<ItemTableProps> = ({ items, onEditItem, onDeleteItem, lastScannedBarcode }) => {
    const [sortKey, setSortKey] = useState<SortKey>('receivedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;
            
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            
            return 0;
        });
    }, [items, sortKey, sortOrder]);
    
    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key) return null;
        return sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
    };
    
    const headers: { key: SortKey; label: string; className?: string }[] = [
        { key: 'receivedAt', label: 'تاريخ الاستلام', className: 'w-1/12' },
        { key: 'barcode', label: 'الباركود', className: 'w-1/12' },
        { key: 'customerName', label: 'العميل', className: 'w-2/12' },
        { key: 'specs', label: 'المواصفات', className: 'w-3/12' },
        { key: 'quantity', label: 'الكمية', className: 'w-1/12' },
        { key: 'totalPrice', label: 'الإجمالي', className: 'w-1/12' },
        { key: 'deliveryDate', label: 'تاريخ التسليم', className: 'w-1/12' },
        { key: 'status', label: 'الحالة', className: 'w-1/12 text-center' },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {headers.map(header => (
                             <th key={header.key} scope="col" onClick={() => handleSort(header.key)} className={`px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${header.className}`}>
                                <div className="flex items-center gap-2 justify-end">
                                    {renderSortIcon(header.key)}
                                    <span>{header.label}</span>
                                </div>
                            </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                           إجراءات
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedItems.map((item) => {
                        const config = STATUS_CONFIG[item.status];
                        const isHighlighted = lastScannedBarcode === item.barcode;
                        const rowClass = `transition-colors duration-2000 ${isHighlighted ? 'bg-blue-200 dark:bg-blue-900' : ''}`;
                        return (
                            <tr key={item.id} className={rowClass}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{new Date(item.receivedAt).toLocaleString('ar-EG')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300 text-right">{item.barcode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{item.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs text-right">{item.specs}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{item.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('ar-EG') : 'غير محدد'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bgColor} ${config.color} status-badge-print`}>
                                        {config.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center gap-4">
                                        <button onClick={() => onEditItem(item)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 print-hide" title="تعديل">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => onDeleteItem(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 print-hide" title="حذف">
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
             {items.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد أصناف.</p>}
        </div>
    );
};