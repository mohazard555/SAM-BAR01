
export enum ItemStatus {
    New = 'new',
    InProgress = 'in_progress',
    Delivered = 'delivered',
    Cancelled = 'cancelled',
}

export interface Item {
    id: number;
    barcode: string;
    receivedAt: string;
    customerName: string;
    specs: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string;
    deliveryDate: string | null;
    status: ItemStatus;
}
