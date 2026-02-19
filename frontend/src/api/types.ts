export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ field: string; message: string }>;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    phoneNumber?: string;
    userType: 'patient' | 'hospital';
    fullName?: string;
}

export interface AuthResponse {
    admin: {
        admin_id: number;
        email: string;
        user_type: string;
        phone_number?: string;
        email_verified: boolean;
    };
    accessToken: string;
    refreshToken: string;
}

export interface AdminProfile {
    admin_id: number;
    email: string;
    phone_number?: string;
    user_type: string;
    email_verified: boolean;
    account_status: string;
    created_at: string;
    last_login?: string;
}

// Patient Types
export interface Patient {
    patient_id: number;
    admin_id: number;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    profile_picture?: string;
    allergies?: string;
    chronic_conditions?: string;
    current_medications?: string;
    relationship: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePatientRequest {
    fullName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
    relationship: string;
    isPrimary?: boolean;
}

// Medical Record Types
export interface MedicalRecord {
    record_id: number;
    patient_id: number;
    category: string;
    title: string;
    description?: string;
    record_date: string;
    physician_name?: string;
    facility_name?: string;
    file_path: string;
    file_type: string;
    file_size_bytes?: number;
    is_critical: boolean;
    created_at: string;
    updated_at: string;
}

export interface UploadRecordRequest {
    file: File;
    recordType: string;
    title: string;
    description?: string;
    recordDate: string;
    doctorName?: string;
    hospitalName?: string;
    medicalCondition?: string;
    isCritical?: boolean;
    tags?: string;
}

export interface RecordFilters {
    recordType?: string;
    startDate?: string;
    endDate?: string;
    doctorName?: string;
    hospitalName?: string;
    medicalCondition?: string;
    isCritical?: boolean;
    search?: string;
}

// Emergency Types
export interface EmergencyContact {
    contact_id: number;
    patient_id: number;
    admin_id: number;
    name: string;
    relationship: string;
    phone_number: string;
    email?: string;
    priority: number;
    is_active: boolean;
    created_at: string;
}

export interface CreateContactRequest {
    patientId: number;
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    priority?: number;
}

export interface EmergencyAlert {
    alert_id: number;
    patient_id: number;
    hospital_id?: number;
    patient_location?: string;
    critical_summary?: string;
    alert_message: string;
    status: 'sent' | 'acknowledge' | 'resolve';
    sent_to_hospital: boolean;
    sent_to_contacts: boolean;
    contact_ids_notified?: string;
    sent_at?: string;
    acknowledged_at?: string;
    resolved_at?: string;
    created_at: string;
}

export interface CreateAlertRequest {
    patientId: number;
    hospitalId?: number;
    patientLocation?: string;
    criticalSummary?: string;
    alertMessage: string;
}

// Hospital Types
export interface Hospital {
    hospital_id: number;
    hospital_name: string;
    address: string;
    city: string;
    state: string;
    phone_number: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    hospital_type: string;
    rating?: number;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    distance?: number;
}

export interface HospitalFilters {
    city?: string;
    hospitalType?: string;
    search?: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
}
