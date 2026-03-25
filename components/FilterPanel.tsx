import React from 'react';
import { Item, ItemStatus } from '../types';
import { FilterIcon } from './Icons';
import { STATUS_CONFIG } from '../constants';

interface FilterPanelProps {
    items: Item[];
    filters: { status: string; customer: string; dateFrom: string; dateTo: string; };
    searchQuery: string;
    onFilterChange: (filters: { status: string; customer: string; dateFrom: string; dateTo: string; }) => void;
    onSearchChange: (query: string) => void;
    onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
    items, 
    filters, 
    searchQuery,
    onFilterChange, 
    onSearchChange,
    onClearFilters 
}) => {

    const uniqueCustomers = React.useMemo(() => {
        const customerNames = items.map(item => item.customerName.trim()).filter(Boolean);
        return [...new Set(customerNames)].sort();
    }, [items]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    const inputClass = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 px-3 py-2 h-10";
    const selectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 h-10";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 print-hide">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
                        <FilterIcon /> فلاتر البحث والتحكم
                    </h3>
                    <button onClick={onClearFilters} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        مسح الفلاتر
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">بحث سريع (اسم، باركود، عميل)</label>
                        <input 
                            type="text" 
                            placeholder="ابحث هنا..." 
                            value={searchQuery} 
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">الحالة</label>
                        <select name="status" value={filters.status} onChange={handleChange} className={selectClass}>
                            <option value="">كل الحالات</option>
                            {Object.values(ItemStatus).map(status => (
                                <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">اسم العميل</label>
                        <select name="customer" value={filters.customer} onChange={handleChange} className={selectClass}>
                            <option value="">كل العملاء</option>
                            {uniqueCustomers.map(customer => (
                                <option key={customer} value={customer}>{customer}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">من تاريخ</label>
                        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">إلى تاريخ</label>
                        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
            </div>
        </div>
    );
};