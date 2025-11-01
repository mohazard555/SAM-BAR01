import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Item, ItemStatus } from './types';
import { INITIAL_ITEMS, STATUS_CONFIG } from './constants';
import { Header } from './components/Header';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ItemTable } from './components/ItemTable';
import { ItemModal } from './components/ItemModal';
import { FilterPanel } from './components/FilterPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { LoginModal } from './components/LoginModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { CompanyInfoPanel } from './components/CompanyInfoPanel';
import { ExportIcon, ImportIcon, PrintIcon } from './components/Icons';

declare const XLSX: any; // For SheetJS library

const App: React.FC = () => {
    const [items, setItems] = useState<Item[]>(() => {
        const savedItems = localStorage.getItem('inventoryItems');
        return savedItems ? JSON.parse(savedItems) : INITIAL_ITEMS;
    });
    const [filteredItems, setFilteredItems] = useState<Item[]>(items);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isPrintMode, setIsPrintMode] = useState(false);

    // Admin Credentials State
    const [adminUsername, setAdminUsername] = useState('admin');
    const [adminPassword, setAdminPassword] = useState('admin123');

    // App Customization State
    const [appName, setAppName] = useState('مراقبة حركة الأصناف');
    const [appLogo, setAppLogo] = useState<string | null>(null);
    const [managerName, setManagerName] = useState('المدير العام');
    const [companyInfo, setCompanyInfo] = useState('العنوان: شارع المثال، المدينة | هاتف: 123-456-789');

    const [filters, setFilters] = useState({
        status: '',
        customer: '',
        dateFrom: '',
        dateTo: '',
    });

    // Load settings from localStorage on initial load
    useEffect(() => {
        const savedAppName = localStorage.getItem('appName');
        const savedAppLogo = localStorage.getItem('appLogo');
        const savedManagerName = localStorage.getItem('managerName');
        const savedCompanyInfo = localStorage.getItem('companyInfo');
        const savedAdminUsername = localStorage.getItem('adminUsername');
        const savedAdminPassword = localStorage.getItem('adminPassword');
        
        if (savedAppName) setAppName(savedAppName);
        if (savedAppLogo) setAppLogo(savedAppLogo);
        if (savedManagerName) setManagerName(savedManagerName);
        if (savedCompanyInfo) setCompanyInfo(savedCompanyInfo);
        if (savedAdminUsername) setAdminUsername(savedAdminUsername);
        if (savedAdminPassword) setAdminPassword(savedAdminPassword);

        document.title = savedAppName || 'نظام مراقبة حركة الأصناف';
    }, []);
    
    // Save items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('inventoryItems', JSON.stringify(items));
    }, [items]);

    const applyFilters = useCallback(() => {
        let tempItems = [...items];
        if (filters.status) {
            tempItems = tempItems.filter(item => item.status === filters.status);
        }
        if (filters.customer !== '') {
            tempItems = tempItems.filter(item => item.customerName === filters.customer);
        }
        if (filters.dateFrom) {
            tempItems = tempItems.filter(item => new Date(item.receivedAt) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            tempItems = tempItems.filter(item => new Date(item.receivedAt).setHours(0,0,0,0) <= new Date(filters.dateTo).setHours(0,0,0,0));
        }
        setFilteredItems(tempItems);
    }, [items, filters]);

    useEffect(() => {
        applyFilters();
    }, [items, filters, applyFilters]);

    const handleScan = (barcode: string) => {
        const existingItem = items.find(item => item.barcode === barcode);
        if (existingItem) {
            setEditingItem(existingItem);
        } else {
            setEditingItem({
                id: Date.now(),
                barcode: barcode,
                receivedAt: new Date().toISOString(),
                customerName: '',
                specs: '',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                notes: '',
                deliveryDate: null,
                status: ItemStatus.New,
            });
        }
        setLastScannedBarcode(barcode);
        setIsModalOpen(true);
    };

    const handleSaveItem = (itemToSave: Item) => {
        const index = items.findIndex(i => i.id === itemToSave.id);
        if (index > -1) {
            setItems(items.map(i => i.id === itemToSave.id ? itemToSave : i));
        } else {
            setItems([itemToSave, ...items]);
        }
        handleCloseModal();

        // Flash highlight
        setTimeout(() => setLastScannedBarcode(null), 2000);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setIsPreviewMode(false);
        setIsPrintMode(false);
    };

    const handleDeleteItem = (itemId: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.')) {
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    };
    
    const handlePreviewItem = (item: Item) => {
        setEditingItem(item);
        setIsPreviewMode(true);
        setIsModalOpen(true);
    };

    const handlePrintItem = (item: Item) => {
        setEditingItem(item);
        setIsPrintMode(true);
        setIsModalOpen(true);
    };

    const handleLogin = (username: string, password: string) => {
        if (username === adminUsername && password === adminPassword) {
            setIsAdmin(true);
            setIsLoginModalOpen(false);
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
    };

    const handleSaveSettings = (settings: { 
        appName: string; 
        appLogo: string | null; 
        managerName: string; 
        companyInfo: string;
        adminUsername: string;
        adminPassword: string;
    }) => {
        setAppName(settings.appName);
        localStorage.setItem('appName', settings.appName);
        document.title = settings.appName;

        setManagerName(settings.managerName);
        localStorage.setItem('managerName', settings.managerName);
        
        setCompanyInfo(settings.companyInfo);
        localStorage.setItem('companyInfo', settings.companyInfo);

        if (settings.appLogo) {
            setAppLogo(settings.appLogo);
            localStorage.setItem('appLogo', settings.appLogo);
        }
        
        if (settings.adminUsername) {
            setAdminUsername(settings.adminUsername);
            localStorage.setItem('adminUsername', settings.adminUsername);
        }
        if (settings.adminPassword) {
            setAdminPassword(settings.adminPassword);
            localStorage.setItem('adminPassword', settings.adminPassword);
        }
    };

    const exportToXLSX = () => {
        const dataToExport = filteredItems.map(item => ({
            'المعرف': item.id,
            'الباركود': item.barcode,
            'تاريخ الاستلام': new Date(item.receivedAt).toLocaleDateString('ar-EG'),
            'اسم العميل': item.customerName,
            'المواصفات': item.specs,
            'الكمية': item.quantity,
            'سعر الوحدة': item.unitPrice,
            'السعر الإجمالي': item.totalPrice,
            'ملاحظات': item.notes,
            'تاريخ التسليم': item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('ar-EG') : '',
            'الحالة': STATUS_CONFIG[item.status].label,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "الأصناف");
        XLSX.writeFile(workbook, "تصدير_المخزون.xlsx");
    };

    const importFromXLSX = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];

            const statusReverseMap = Object.fromEntries(
                Object.entries(STATUS_CONFIG).map(([key, val]) => [val.label, key])
            );

            const newItems: Item[] = json.map(row => {
                 const statusKey = statusReverseMap[row['الحالة']] as ItemStatus | undefined;
                 const receivedDate = row['تاريخ الاستلام'];
                 const deliveryDate = row['تاريخ التسليم'];

                return {
                    id: row['المعرف'] || Date.now() + Math.random(),
                    barcode: row['الباركود'],
                    receivedAt: receivedDate instanceof Date ? receivedDate.toISOString() : new Date().toISOString(),
                    customerName: row['اسم العميل'] || '',
                    specs: row['المواصفات'] || '',
                    quantity: Number(row['الكمية']) || 0,
                    unitPrice: Number(row['سعر الوحدة']) || 0,
                    totalPrice: Number(row['السعر الإجمالي']) || 0,
                    notes: row['ملاحظات'] || '',
                    deliveryDate: deliveryDate instanceof Date ? deliveryDate.toISOString() : null,
                    status: statusKey || ItemStatus.New,
                };
            }).filter(item => item && item.barcode);

            if (newItems.length > 0) {
                if (window.confirm(`سيؤدي هذا إلى استبدال جميع البيانات الحالية بـ ${newItems.length} صنفًا من الملف. هل تريد المتابعة؟`)) {
                    setItems(newItems);
                    alert(`تم استيراد ${newItems.length} صنف بنجاح.`);
                }
            } else {
                alert("لم يتم العثور على أصناف صالحة في الملف.");
            }
        };
        reader.readAsBinaryString(file);
        event.target.value = '';
    };

    const exportJSON = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "بيانات_النظام.json";
        link.click();
    };

    const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("سيتم استبدال جميع البيانات الحالية. هل أنت متأكد من المتابعة؟")) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const newItems = JSON.parse(text);
                if (Array.isArray(newItems)) { // Basic validation
                    setItems(newItems);
                    alert("تم استيراد البيانات بنجاح.");
                } else {
                    throw new Error("Invalid file format");
                }
            } catch (error) {
                alert("فشل استيراد الملف. يرجى التأكد من أن الملف بصيغة JSON صحيحة.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handlePrint = () => {
        window.print();
    };

    const getPrintTitle = () => {
        if (filters.status && STATUS_CONFIG[filters.status as ItemStatus]) {
            return `تقرير حركة الأصناف - ${STATUS_CONFIG[filters.status as ItemStatus].label}`;
        }
        return 'تقرير حركة الأصناف';
    };

    const undeliveredItems = items.filter(item => item.status !== ItemStatus.Delivered);
    
    const uniqueCustomers = useMemo(() => {
        const customerNames = items.map(item => item.customerName.trim()).filter(Boolean);
        return [...new Set(customerNames)].sort();
    }, [items]);

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col">
            <Header 
                appName={appName}
                appLogo={appLogo}
                isAdmin={isAdmin} 
                onLoginClick={() => setIsLoginModalOpen(true)} 
                onLogoutClick={handleLogout}
                onSettingsClick={() => setIsSettingsModalOpen(true)}
            />
            
            <div className="print-show hidden my-4">
                 <div className="print-header">
                    <div className="print-header-info">
                        <h1>{appName}</h1>
                        <p>{companyInfo}</p>
                    </div>
                    {appLogo && <img src={appLogo} alt="Company Logo" />}
                </div>
                <h2 className="text-xl font-bold text-center my-4">{getPrintTitle()}</h2>
                <div className="flex justify-between text-sm mt-2 mb-4">
                    <p><strong>اسم المدير:</strong> {managerName}</p>
                    <p><strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                 {(filters.status || filters.customer || filters.dateFrom || filters.dateTo) && (
                    <div className="text-sm mt-2 border-t pt-2 mb-4">
                        <p className="font-semibold">الفلاتر المطبقة:</p>
                        <ul className="list-none p-0 mr-4">
                            {filters.status && <li>- الحالة: {STATUS_CONFIG[filters.status as ItemStatus]?.label}</li>}
                            {filters.customer && <li>- العميل: {filters.customer}</li>}
                            {filters.dateFrom && <li>- من تاريخ: {new Date(filters.dateFrom).toLocaleDateString('ar-EG')}</li>}
                            {filters.dateTo && <li>- إلى تاريخ: {new Date(filters.dateTo).toLocaleDateString('ar-EG')}</li>}
                        </ul>
                    </div>
                 )}
            </div>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print-as-block">
                    <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 print-hide">
                           <BarcodeScanner onScan={handleScan} />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 print-hide">
                             <input type="file" id="import-file" className="hidden" onChange={importFromXLSX} accept=".xlsx, .xls" />
                             <label htmlFor="import-file" className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                                <ImportIcon /> استيراد XLSX
                             </label>

                            <button onClick={exportToXLSX} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                                <ExportIcon /> تصدير XLSX
                            </button>
                             <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                                <PrintIcon /> طباعة التقرير
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white print-hide">قائمة الأصناف</h2>
                            <ItemTable
                                items={filteredItems}
                                onEditItem={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                                onDeleteItem={handleDeleteItem}
                                onPreviewItem={handlePreviewItem}
                                onPrintItem={handlePrintItem}
                                lastScannedBarcode={lastScannedBarcode}
                                isAdmin={isAdmin}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col gap-6 print-hide">
                         <FilterPanel
                            items={items}
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearFilters={() => setFilters({ status: '', customer: '', dateFrom: '', dateTo: '' })}
                        />
                        <AlertsPanel undeliveredItems={undeliveredItems} onAlertClick={handleScan} />
                        <CompanyInfoPanel info={companyInfo} />
                    </div>
                </div>
            </main>

            {isModalOpen && editingItem && (
                <ItemModal 
                    item={editingItem} 
                    onSave={handleSaveItem} 
                    onClose={handleCloseModal}
                    uniqueCustomers={uniqueCustomers}
                    isPreview={isPreviewMode}
                    isPrintMode={isPrintMode}
                    appName={appName}
                    appLogo={appLogo}
                    companyInfo={companyInfo}
                />
            )}
            
            {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />}
            
            {isSettingsModalOpen && <SettingsModal 
                onClose={() => setIsSettingsModalOpen(false)} 
                onSave={handleSaveSettings}
                currentSettings={{ appName, appLogo, managerName, companyInfo, adminUsername, adminPassword }}
                onExportJSON={exportJSON}
                onImportJSON={importJSON}
            />}

            <Footer />
        </div>
    );
};

export default App;
