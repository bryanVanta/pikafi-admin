import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Transaction {
    id: number;
    sender: string;
    recipient: string;
    amount: string;
    data: string;
    timestamp: number;
    status: number; // 0=Pending, 1=Approved, 2=Rejected
}

export const getTransactions = async () => {
    const response = await api.get('/transactions');
    return response.data;
};

export const approveTransaction = (id: number, newRecipient: string, newAmount: string, newData: string, extraData?: any) => {
    return api.post(`/transactions/${id}/approve`, {
        newRecipient,
        newAmount,
        newData,
        ...extraData
    });
};

export const getGradingDetails = async (uid: number) => {
    try {
        const res = await api.get(`/transactions/${uid}/grading`);
        return res.data;
    } catch (error) {
        return { success: false };
    }
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
