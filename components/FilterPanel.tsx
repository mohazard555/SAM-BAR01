import React from 'react';
import { Item, ItemStatus } from '../types';
import { FilterIcon } from './Icons';
import { STATUS_CONFIG } from '../constants';

interface FilterPanelProps {
    items: Item[];
    filters: { status: string; customer: string; dateFrom: string; dateTo: string; };
    onFilterChange: (filters: { status: string; customer: string; dateFrom: string; dateTo: string; }) => void;
    onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ items, filters, onFilterChange, onClearFilters }) => {

    const uniqueCustomers = React.useMemo(() => {
        const customerNames = items.map(item => item.customerName.trim()).filter(Boolean);
        return [...new Set(customerNames)].sort();
    }, [items]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    const inputClass = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 px-3 py-2";
    const selectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white mb-4">
                <FilterIcon /> فلاتر البحث
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</label>
                    <select name="status" value={filters.status} onChange={handleChange} className={selectClass}>
                        <option value="">كل الحالات</option>
                        {Object.values(ItemStatus).map(status => (
                            <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم العميل</label>
                    <select name="customer" value={filters.customer} onChange={handleChange} className={selectClass}>
                        <option value="">كل العملاء</option>
                        {uniqueCustomers.map(customer => (
                            <option key={customer} value={customer}>{customer}</option>
                        ))}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</label>
                        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</label>
                        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
                <div>
                    <button onClick={onClearFilters} className="w-full mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        مسح الفلاتر
                    </button>
                </div>
            </div>
        </div>
    );
};