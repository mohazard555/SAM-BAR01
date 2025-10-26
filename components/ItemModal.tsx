import React, { useState, useEffect } from 'react';
import { Item, ItemStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface ItemModalProps {
    item: Item;
    onSave: (item: Item) => void;
    onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onSave, onClose }) => {
    const [formData, setFormData] = useState<Item>(item);

    useEffect(() => {
        const total = formData.quantity * formData.unitPrice;
        setFormData(prev => ({ ...prev, totalPrice: total }));
    }, [formData.quantity, formData.unitPrice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value ? new Date(value).toISOString() : null
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleSaveAndPrint = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        // This is a simplified print. For a real app, a dedicated print component/view is better.
        setTimeout(() => window.print(), 500);
    };
    
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    }
    
    const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 py-2.5 px-3";
    const readOnlyInputClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2.5 px-3";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            تفاصيل الصنف - {item.barcode}
                        </h3>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        {/* Form Fields */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الباركود</label>
                            <input type="text" value={formData.barcode} readOnly className={readOnlyInputClasses} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ الاستلام</label>
                            <input type="date" name="receivedAt" value={formatDateForInput(formData.receivedAt)} onChange={handleDateChange} className={inputClasses} />
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم العميل</label>
                            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">المواصفات</label>
                            <textarea name="specs" value={formData.specs} onChange={handleChange} rows={3} className={inputClasses}></textarea>
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الكمية</label>
                             <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" className={inputClasses} />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">سعر الوحدة</label>
                             <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} min="0" step="0.01" className={inputClasses} />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">السعر الإجمالي</label>
                             <input type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange} className={readOnlyInputClasses} readOnly />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                {Object.values(ItemStatus).map(status => (
                                    <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ التسليم (المتوقع)</label>
                            <input type="date" name="deliveryDate" value={formatDateForInput(formData.deliveryDate)} onChange={handleDateChange} className={inputClasses} />
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className={inputClasses}></textarea>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-start space-x-3 space-x-reverse">
                        <button type="button" onClick={handleSaveAndPrint} className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">
                            حفظ وطباعة
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700">
                            حفظ
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