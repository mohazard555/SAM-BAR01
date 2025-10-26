import React, { useRef, useEffect } from 'react';
import { ScanIcon } from './Icons';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const barcode = inputRef.current?.value;
        if (barcode) {
            onScan(barcode);
            inputRef.current.value = '';
            inputRef.current.select();
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">مسح / إدخال الباركود</h2>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ScanIcon className="text-gray-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        placeholder="امسح الباركود أو أدخله واضغط Enter"
                        className="w-full pr-10 pl-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 text-lg"
                    />
                </div>
            </form>
        </div>
    );
};