import React, { useState, useRef } from 'react';
import { ExportIcon, ImportIcon } from './Icons';

interface Settings {
    appName: string;
    appLogo: string | null;
    managerName: string;
    companyInfo: string;
    adminUsername: string;
    adminPassword: string;
}

interface SettingsModalProps {
    onClose: () => void;
    onSave: (settings: Settings) => void;
    currentSettings: Settings;
    onExportJSON: () => void;
    onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    onClose,
    onSave,
    currentSettings,
    onExportJSON,
    onImportJSON,
}) => {
    const [settings, setSettings] = useState<Settings>(currentSettings);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({...prev, [name]: value}));
    }

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSettings(prev => ({...prev, appLogo: e.target?.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings.adminUsername.trim() || !settings.adminPassword.trim()) {
            alert("اسم المستخدم وكلمة المرور لا يمكن أن تكون فارغة.");
            return;
        }
        onSave(settings);
        onClose();
    };

    const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 py-2 px-3";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            إعدادات النظام
                        </h3>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                             <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">هوية التطبيق</h4>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم البرنامج / الشركة</label>
                                <input
                                    type="text"
                                    name="appName"
                                    value={settings.appName}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className='mt-4'>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">شعار البرنامج</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {settings.appLogo && <img src={settings.appLogo} alt="Logo Preview" className="h-16 w-16 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />}
                                    <input type="file" accept="image/*" onChange={handleLogoChange} ref={fileInputRef} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">
                                        تغيير الشعار
                                    </button>
                                </div>
                            </div>
                            <div className='mt-4'>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم المدير (للطباعة)</label>
                                <input
                                    type="text"
                                    name="managerName"
                                    value={settings.managerName}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                             <div className='mt-4'>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">معلومات الشركة (للعرض والطباعة)</label>
                                <textarea
                                    name="companyInfo"
                                    value={settings.companyInfo}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={inputClasses}
                                ></textarea>
                            </div>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">بيانات الدخول</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم مستخدم المدير</label>
                                <input
                                    type="text"
                                    name="adminUsername"
                                    value={settings.adminUsername}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className='mt-4'>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">كلمة مرور المدير</label>
                                <input
                                    type="password"
                                    name="adminPassword"
                                    value={settings.adminPassword}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                             <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">النسخ الاحتياطي للبيانات</h4>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                تصدير أو استيراد كامل بيانات التطبيق (جميع الأصناف) كملف JSON.
                             </p>
                             <div className="flex gap-2">
                                <button type="button" onClick={onExportJSON} className="flex items-center justify-center gap-2 w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                                    <ExportIcon /> تصدير بيانات النظام
                                </button>
                                <label className="flex items-center justify-center gap-2 w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                                    <ImportIcon /> استيراد بيانات النظام
                                    <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
                                </label>
                             </div>
                        </div>

                    </div>


                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-start space-x-3 space-x-reverse">
                        <button type="submit" className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700">
                            حفظ الإعدادات
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">
                            إغلاق
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};