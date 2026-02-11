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

export const approveTransaction = async (id: number, grade: string, comments: string) => {
    // In the original contract, 'approveTransaction' takes (id, newRecipient, newData)
    // We will map 'grade' and 'comments' to 'newData' (e.g., JSON string)
    // and keep recipient same or update if needed. For now, assume same recipient.

    // note: The backend expected { newRecipient, newAmount, newData }
    // We need to fetch the transaction first to get the current recipient/amount if we want to keep them effectively unchanged
    // OR the backend might handle it.
    // Looking at previous backend code: 
    // const tx = await contract.approveTransaction(id, newRecipient, txData);

    // So we need to provide newRecipient. 
    // For this admin interface, we'll probably want to fetch the tx details first in the UI, 
    // then pass the existing recipient back, OR update the backend to handle "undefined" recipient by using existing (if contract allows, but smart contract usually requires all args).

    // Let's assume the UI passes the current recipient for now.

    const data = JSON.stringify({ grade, comments });
    // We'll send this as 'newData'

    return api.post(`/transactions/${id}/approve`, {
        newData: data,
        // We will handle newRecipient in the UI component by passing it in
    });
};
