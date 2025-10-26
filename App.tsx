import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Item, ItemStatus } from './types';
import { INITIAL_ITEMS, STATUS_CONFIG } from './constants';
import { Header } from './components/Header';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ItemTable } from './components/ItemTable';
import { ItemModal } from './components/ItemModal';
import { FilterPanel } from './components/FilterPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { LoginModal } from './components/LoginModal';
import { ExportIcon, ImportIcon, PrintIcon } from './components/Icons';

const App: React.FC = () => {
    const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
    const [filteredItems, setFilteredItems] = useState<Item[]>(INITIAL_ITEMS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        status: '',
        customer: '',
        dateFrom: '',
        dateTo: '',
    });

    const applyFilters = useCallback(() => {
        let tempItems = [...items];
        if (filters.status) {
            tempItems = tempItems.filter(item => item.status === filters.status);
        }
        if (filters.customer) {
            tempItems = tempItems.filter(item => item.customerName === filters.customer);
        }
        if (filters.dateFrom) {
            tempItems = tempItems.filter(item => new Date(item.receivedAt) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            tempItems = tempItems.filter(item => new Date(item.receivedAt) <= new Date(filters.dateTo));
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
                status: ItemStatus.InProgress,
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
        setIsModalOpen(false);
        setEditingItem(null);

        // Flash highlight
        setTimeout(() => setLastScannedBarcode(null), 2000);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.')) {
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    };

    const handleLogin = (password: string) => {
        if (password === 'admin123') { // Hardcoded password for demo
            setIsAdmin(true);
            setIsLoginModalOpen(false);
        } else {
            alert('كلمة المرور غير صحيحة');
        }
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
    };

    const exportToCSV = () => {
        const headers = ['المعرف', 'الباركود', 'تاريخ الاستلام', 'اسم العميل', 'المواصفات', 'الكمية', 'سعر الوحدة', 'السعر الإجمالي', 'ملاحظات', 'تاريخ التسليم', 'الحالة'];
        const rows = filteredItems.map(item => 
            [
                item.id,
                item.barcode,
                item.receivedAt,
                item.customerName,
                `"${item.specs.replace(/"/g, '""')}"`,
                item.quantity,
                item.unitPrice,
                item.totalPrice,
                `"${item.notes.replace(/"/g, '""')}"`,
                item.deliveryDate || '',
                STATUS_CONFIG[item.status].label
            ].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "تصدير_المخزون.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1);
            const newItems: Item[] = rows.map(row => {
                const columns = row.split(',');
                if (columns.length < 11) return null;
                // Basic validation for column mapping
                 const statusKey = Object.keys(STATUS_CONFIG).find(key => STATUS_CONFIG[key as ItemStatus].label === columns[10].trim()) as ItemStatus | undefined;

                return {
                    id: parseInt(columns[0]) || Date.now() + Math.random(),
                    barcode: columns[1],
                    receivedAt: columns[2] || new Date().toISOString(),
                    customerName: columns[3],
                    specs: columns[4].replace(/""/g, '"').slice(1, -1),
                    quantity: parseInt(columns[5]) || 0,
                    unitPrice: parseFloat(columns[6]) || 0,
                    totalPrice: parseFloat(columns[7]) || 0,
                    notes: columns[8].replace(/""/g, '"').slice(1, -1),
                    deliveryDate: columns[9] || null,
                    status: statusKey || ItemStatus.New,
                };
            }).filter((item): item is Item => item !== null);

            // A simple merge strategy: update existing by barcode, add new ones.
            const updatedItems = [...items];
            newItems.forEach(newItem => {
                const existingIndex = updatedItems.findIndex(i => i.barcode === newItem.barcode);
                if (existingIndex > -1) {
                    updatedItems[existingIndex] = { ...updatedItems[existingIndex], ...newItem };
                } else {
                    updatedItems.unshift(newItem);
                }
            });
            setItems(updatedItems);
            alert(`تم استيراد ${newItems.length} صنف بنجاح.`);
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };
    
    const handlePrint = () => {
        window.print();
    };

    const undeliveredItems = items.filter(item => item.status !== ItemStatus.Delivered);

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200">
            <Header isAdmin={isAdmin} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} />
            
            <div className="print-show hidden my-4 px-8">
                <h1 className="text-2xl font-bold">تقرير حركة الأصناف</h1>
                <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
                 {(filters.status || filters.customer || filters.dateFrom || filters.dateTo) && (
                    <div className="text-sm mt-2 border-t pt-2">
                        <p className="font-semibold">الفلاتر المطبقة:</p>
                        <ul className="list-none p-0">
                            {filters.status && <li>- الحالة: {STATUS_CONFIG[filters.status as ItemStatus]?.label}</li>}
                            {filters.customer && <li>- العميل: {filters.customer}</li>}
                            {filters.dateFrom && <li>- من تاريخ: {new Date(filters.dateFrom).toLocaleDateString('ar-EG')}</li>}
                            {filters.dateTo && <li>- إلى تاريخ: {new Date(filters.dateTo).toLocaleDateString('ar-EG')}</li>}
                        </ul>
                    </div>
                )}
            </div>

            <main className="p-4 sm:p-6 lg:p-8 print-hide">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Right Panel (was Left) */}
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                           <FilterPanel items={items} filters={filters} onFilterChange={setFilters} onClearFilters={() => setFilters({ status: '', customer: '', dateFrom: '', dateTo: '' })} />
                           <AlertsPanel undeliveredItems={undeliveredItems} onAlertClick={(barcode) => handleScan(barcode)} />
                        </div>
                    </div>

                    {/* Center Panel */}
                    <div className="lg:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <BarcodeScanner onScan={handleScan} />
                            {isAdmin && (
                                <div className="mt-4 flex flex-col sm:flex-row gap-2 flex-wrap">
                                    <button onClick={exportToCSV} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                        <ExportIcon /> تصدير إلى Excel
                                    </button>
                                    <label className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                                        <ImportIcon /> استيراد من Excel
                                        <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                                    </label>
                                     <button onClick={handlePrint} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                                        <PrintIcon /> طباعة التقرير
                                    </button>
                                </div>
                            )}
                            <div className="mt-6">
                               <ItemTable 
                                items={filteredItems} 
                                onEditItem={(item) => { setEditingItem(item); setIsModalOpen(true); }} 
                                onDeleteItem={handleDeleteItem}
                                lastScannedBarcode={lastScannedBarcode} 
                               />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && editingItem && (
                <ItemModal item={editingItem} onSave={handleSaveItem} onClose={handleCloseModal} />
            )}

            {isLoginModalOpen && (
                <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />
            )}
        </div>
    );
};

export default App;