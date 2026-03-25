
import React, { useState, useEffect } from 'react';
import { Item, ItemStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { PrintIcon, WhatsAppIcon, TelegramIcon, EditIcon } from './Icons';

interface ItemModalProps {
    item: Item;
    onSave: (item: Item) => void;
    onClose: () => void;
    uniqueCustomers: string[];
    isPreview?: boolean;
    isPrintMode?: boolean;
    appName: string;
    appLogo: string | null;
    companyInfo: string;
    onSwitchToEdit?: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ 
    item, 
    onSave, 
    onClose, 
    uniqueCustomers, 
    isPreview = false, 
    isPrintMode = false,
    appName,
    appLogo,
    companyInfo,
    onSwitchToEdit
}) => {
    const [formData, setFormData] = useState<Item>(item);

    useEffect(() => {
        const total = formData.quantity * formData.unitPrice;
        setFormData(prev => ({ ...prev, totalPrice: total }));
    }, [formData.quantity, formData.unitPrice]);

    const handlePrint = () => {
        document.body.classList.add('printing-modal-item');
        // Small delay to ensure CSS is applied before print dialog
        setTimeout(() => {
            window.print();
            // We remove the class after print. 
            // Note: some browsers might need this in afterprint listener
            document.body.classList.remove('printing-modal-item');
        }, 100);
    };

    useEffect(() => {
        if (isPrintMode) {
            handlePrint();
            // Close after a delay to allow print dialog to open
            const timer = setTimeout(() => {
                onClose();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPrintMode, onClose]);

    useEffect(() => {
        const afterPrint = () => {
            document.body.classList.remove('printing-modal-item');
        };
        window.addEventListener('afterprint', afterPrint);
        return () => window.removeEventListener('afterprint', afterPrint);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; // value is "YYYY-MM-DD"
        if (value) {
            // To avoid timezone issues, parse the date string manually and create a UTC date.
            const [year, month, day] = value.split('-').map(Number);
            // Date.UTC month is 0-indexed.
            const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            setFormData(prev => ({
                ...prev,
                [name]: utcDate.toISOString()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleWhatsAppShare = () => {
        const text = `
*تفاصيل الصنف*
الباركود: ${item.barcode}
العميل: ${item.customerName}
تاريخ الاستلام: ${new Date(item.receivedAt).toLocaleDateString('ar-EG')}
الكمية: ${item.quantity}
السعر الإجمالي: ${item.totalPrice.toFixed(2)}
الحالة: ${STATUS_CONFIG[item.status].label}
المواصفات: ${item.specs || 'لا يوجد'}
ملاحظات: ${item.notes || 'لا يوجد'}
        `.trim();
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleTelegramShare = () => {
        const text = `
تفاصيل الصنف
الباركود: ${item.barcode}
العميل: ${item.customerName}
تاريخ الاستلام: ${new Date(item.receivedAt).toLocaleDateString('ar-EG')}
الكمية: ${item.quantity}
السعر الإجمالي: ${item.totalPrice.toFixed(2)}
الحالة: ${STATUS_CONFIG[item.status].label}
المواصفات: ${item.specs || 'لا يوجد'}
ملاحظات: ${item.notes || 'لا يوجد'}
        `.trim();
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
    };
    
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        // Create a date object from the UTC ISO string
        const date = new Date(dateString);
        // Extract year, month, and day in UTC to avoid timezone shifts
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 py-2.5 px-3";
    const disabledInputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 py-2.5 px-3 cursor-not-allowed";
    const readOnlyInputClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2.5 px-3";

    if (isPrintMode) {
        return (
            <div className="fixed inset-0 bg-white z-50 p-4 modal-print-container" onClick={onClose}>
                <div className="bg-white w-full max-w-2xl mx-auto p-8 print:p-0" onClick={(e) => e.stopPropagation()}>
                    {/* Company Header */}
                    <div className="print-header flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                        <div className="print-header-info text-right">
                            <h1 className="text-2xl font-bold text-primary-700 m-0">{appName}</h1>
                            <p className="text-sm whitespace-pre-wrap m-0">{companyInfo}</p>
                        </div>
                        {appLogo && <img src={appLogo} alt="Company Logo" className="max-h-20 w-auto" />}
                    </div>

                    {/* Report Title */}
                    <div className="text-center mb-6 pb-4">
                        <h2 className="text-xl font-bold">إيصال استلام صنف</h2>
                        <p className="text-sm text-gray-500 mt-1">تاريخ الطباعة: {new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>

                    {/* Item Details */}
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">بيانات الصنف</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                        <div className="col-span-2 flex justify-between"><strong>الباركود:</strong> <span className="font-mono">{item.barcode}</span></div>
                        <div className="col-span-2 flex justify-between"><strong>اسم العميل:</strong> <span>{item.customerName}</span></div>
                        <div className="col-span-2 flex justify-between"><strong>تاريخ الاستلام:</strong> <span>{new Date(item.receivedAt).toLocaleString('ar-EG')}</span></div>
                        
                        <div className="col-span-2 mt-2">
                            <p><strong>المواصفات:</strong></p>
                            <p className="mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap border min-h-[40px]">{item.specs || 'لا يوجد'}</p>
                        </div>
                        
                        {item.notes && (
                            <div className="col-span-2">
                                <p><strong>ملاحظات:</strong></p>
                                <p className="mt-1 p-2 bg-gray-50 rounded border min-h-[40px]">{item.notes}</p>
                            </div>
                        )}
                        
                        <div className="col-span-2 border-t my-2"></div>
                        
                        <div className="flex justify-between"><strong>الكمية:</strong> <span>{item.quantity}</span></div>
                        <div className="flex justify-between"><strong>سعر الوحدة:</strong> <span>{item.unitPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between"><strong>الإجمالي:</strong> <span className="font-bold">{item.totalPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between"><strong>الحالة:</strong> <span>{STATUS_CONFIG[item.status].label}</span></div>

                        {item.deliveryDate && <div className="col-span-2 flex justify-between mt-2"><strong>تاريخ التسليم:</strong> <span>{new Date(item.deliveryDate).toLocaleDateString('ar-EG')}</span></div>}
                    </div>

                    {/* Footer/Signature */}
                    <div className="mt-20 pt-8 border-t text-center text-sm text-gray-600">
                        <p>التوقيع: _________________________</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isPreview && !isPrintMode) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">بطاقة الصنف</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{item.barcode}</p>
                            </div>
                            {appLogo && <img src={appLogo} alt="Logo" className="h-12 w-auto object-contain" />}
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">العميل:</span>
                                <span className="font-medium">{item.customerName}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">تاريخ الاستلام:</span>
                                <span>{new Date(item.receivedAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">الحالة:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[item.status].bgColor} ${STATUS_CONFIG[item.status].color}`}>
                                    {STATUS_CONFIG[item.status].label}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">الكمية:</span>
                                <span>{item.quantity}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">السعر الإجمالي:</span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">{item.totalPrice.toFixed(2)}</span>
                            </div>
                            {item.deliveryDate && (
                                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <span className="text-gray-500 dark:text-gray-400">تاريخ التسليم:</span>
                                    <span>{new Date(item.deliveryDate).toLocaleDateString('ar-EG')}</span>
                                </div>
                            )}
                            <div className="pt-2">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">المواصفات:</span>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs min-h-[40px]">
                                    {item.specs || 'لا يوجد'}
                                </p>
                            </div>
                            {item.notes && (
                                <div className="pt-2">
                                    <span className="text-gray-500 dark:text-gray-400 block mb-1">ملاحظات:</span>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs min-h-[40px]">
                                        {item.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-6">
                            <button 
                                onClick={handlePrint} 
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                <PrintIcon className="w-4 h-4" /> طباعة
                            </button>
                            <button 
                                onClick={handleWhatsAppShare} 
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            >
                                <WhatsAppIcon className="w-4 h-4" /> واتساب
                            </button>
                            <button 
                                onClick={handleTelegramShare} 
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                                <TelegramIcon className="w-4 h-4" /> تلغرام
                            </button>
                            <button 
                                onClick={onSwitchToEdit} 
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                            >
                                <EditIcon className="w-4 h-4" /> تعديل
                            </button>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 bg-primary-600 text-white rounded-t-lg">
                        <h3 className="text-lg font-medium leading-6">
                           {isPreview ? 'معاينة الصنف' : 'تفاصيل الصنف'} - {item.barcode}
                        </h3>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الباركود</label>
                            <input type="text" value={formData.barcode} readOnly className={readOnlyInputClasses} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ الاستلام</label>
                            <input type="date" name="receivedAt" value={formatDateForInput(formData.receivedAt)} onChange={handleDateChange} className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}/>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم العميل</label>
                            <input type="text" list="customers-datalist" name="customerName" value={formData.customerName} onChange={handleChange} required className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}/>
                             <datalist id="customers-datalist">
                                {uniqueCustomers.map(customer => <option key={customer} value={customer} />)}
                             </datalist>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">المواصفات</label>
                            <textarea name="specs" value={formData.specs} onChange={handleChange} rows={3} className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}></textarea>
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الكمية</label>
                             <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}/>
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">سعر الوحدة</label>
                             <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} min="0" step="0.01" className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}/>
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">السعر الإجمالي</label>
                             <input type="number" name="totalPrice" value={formData.totalPrice} className={readOnlyInputClasses} readOnly />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}>
                                {Object.values(ItemStatus).map(status => (
                                    <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ التسليم (المتوقع)</label>
                            <input type="date" name="deliveryDate" value={formatDateForInput(formData.deliveryDate)} onChange={handleDateChange} className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}/>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className={isPreview ? disabledInputClasses : inputClasses} disabled={isPreview}></textarea>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-start space-x-3 space-x-reverse print-hide-in-modal">
                        {!isPreview && (
                             <>
                                <button type="submit" className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700">
                                    حفظ
                                </button>
                             </>
                        )}
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">
                            {isPreview ? 'إغلاق' : 'إلغاء'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
