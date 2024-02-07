export enum EventType {
    CREATED = 'created',
    UPDATED = 'updated',
    TRANSFERRED_OWNERSHIP = 'transferred_ownership',
    REQUESTED_ACCESS = 'requested_access',
    CANCELLED_REQUEST = 'cancelled_request',
    REJECTED_REQUEST = 'rejected_request',
    GRANTED_ACCESS = 'granted_access',
    REVOKED_ACCESS = 'revoked_access',
    CANCELLED_ACCESS_REQUEST = 'cancelled_access_request',
    SHARED_WITH = 'shared_with',
    UN_SHARED_WITH = 'unshared_with',
    FILE_ADDED = 'file_added',
    FILE_REMOVED = 'file_removed',
    FILE_UPDATED = 'file_updated',
}

export interface IHistoryEvent {
    eventType: EventType;
    timestamp: Date;
    by?: string;
    to?: string;
    for?: string;
    fileName?: string;
    with?: string;
}

export interface IPatient {
    patient_id: string;
    owner: string;
    createdAt: Date;
    content: any[];
    sharedWith: Map<string, string[]>;
    history: IHistoryEvent[];
    accessRequests: string[];
}
