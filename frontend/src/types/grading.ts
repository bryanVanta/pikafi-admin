export interface Grading {
    id: number;
    uid: number;
    blockchain_uid: number;
    card_name: string;
    card_set: string;
    card_year: string;
    condition: string;
    image_url: string;
    status: string;
    grade?: number;
    grade_corners?: number;
    grade_edges?: number;
    grade_surface?: number;
    grade_centering?: number;
    tx_hash: string;
    submitted_at: string;
    customer_name: string;
    customer_id_type: string;
    customer_id_number: string;
    customer_contact: string;
    customer_email: string;
    authentication_result?: string;
}

export interface StageProps {
    grading: Grading;
    onUpdateStatus: (status: string, authResult?: 'Authentic' | 'Fake', data?: any) => Promise<boolean>;
    isUpdating: boolean;
}
