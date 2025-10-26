import React from 'react';
import { InfoIcon } from './Icons';

interface CompanyInfoPanelProps {
    info: string;
}

export const CompanyInfoPanel: React.FC<CompanyInfoPanelProps> = ({ info }) => {
    if (!info) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white mb-4">
                <InfoIcon /> معلومات عن الشركة
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {info}
            </p>
        </div>
    );
};
