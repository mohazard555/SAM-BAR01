import { Item, ItemStatus } from './types';

export const STATUS_CONFIG: { [key in ItemStatus]: { label: string; color: string; bgColor: string } } = {
    [ItemStatus.New]: { label: 'جديد', color: 'text-blue-800 dark:text-blue-200', bgColor: 'bg-blue-100 dark:bg-blue-900' },
    [ItemStatus.InProgress]: { label: 'قيد المعالجة', color: 'text-yellow-800 dark:text-yellow-200', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
    [ItemStatus.Delivered]: { label: 'تم التسليم', color: 'text-green-800 dark:text-green-200', bgColor: 'bg-green-100 dark:bg-green-900' },
    [ItemStatus.Cancelled]: { label: 'ملغي', color: 'text-red-800 dark:text-red-200', bgColor: 'bg-red-100 dark:bg-red-900' },
};

export const INITIAL_ITEMS: Item[] = [];
