// axiosInstance.ts
import { IPatient } from '@/types/patient';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Create an Axios instance with a custom config
export const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:54321/api/v1/',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const handleErrorResponse = (error: any) => {
    let errorResponse;
    if (error.response && error.response.data) {
        // I expect the API to handle error responses in valid format
        errorResponse = error.response.data;
        // JSON stringify if you need the json and use it later
    } else if (error.request) {
        // TO Handle the default error response for Network failure or 404 etc.,
        errorResponse = error.request.message || error.request.statusText;
    } else {
        errorResponse = error.message;
    }
    throw new Error(errorResponse);
};

export const setBearerToken = (token: string) => {
    api.defaults.headers.common = { Authorization: `Bearer ${token}` };
};

export const getBearerToken = () => {
    return api.defaults.headers.common;
};

export const getPatients = async (page = 1, limit = 15, filter: string | null = null, sortBy: string | null = null, sortOrder: string | null = null) => {
    await new Promise((r) => setTimeout(r, 300));
    return api.get('/patients', { params: { page, limit, filter, sortBy, sortOrder } }).then((res) => {
        return {
            patients: res.data.patients as IPatient[],
            totalCount: res.data.totalCount as number,
        };
    });
};

export const getPatientCount = async () => {
    return api.get('/patients/count').then((res) => res.data.count as number);
};

export const getRecentPatients = async (number = 3) => {
    return api
        .get(`/patients/recent/${number}`)
        .then((res) => res.data.patients as IPatient[])
        .catch((err) => {
            console.error(err);
        });
};

export const addPatientFormSchema = z.object({
    patient_id: z.string().min(2, {
        message: 'Patient ID must be at least 2 characters.',
    }),
    content: z.array(
        z
            .object({
                base64: z.string(),
                name: z.string(),
                dataType: z.string(),
                ipfsCID: z.string(),
            })
            .refine((data) => data.dataType !== '', {
                message: 'Data type is required.',
                path: ['dataType'],
            })
    ),
});

export const createPatient = async (patient: z.infer<typeof addPatientFormSchema>) => {
    return api
        .post('/patients', patient)
        .then((res) => res.data.patient as IPatient)
        .catch((err) => handleErrorResponse(err));
};
