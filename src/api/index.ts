// axiosInstance.ts
import { IPatient, IUser } from '@/types/patient';
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
    console.error(errorResponse);
    throw new Error(errorResponse);
};

export const setBearerToken = (token: string) => {
    api.defaults.headers.common = { Authorization: `Bearer ${token}` };
};

export const getBearerToken = () => {
    return api.defaults.headers.common.Authorization;
};

export const getMe = async () => {
    const token = JSON.parse(localStorage.getItem('token') || '{}');

    setBearerToken(token);

    return api
        .get('/users/me')
        .then((res) => res.data.user as IUser)
        .catch((err) => handleErrorResponse(err));
};

export const getPatients = async (page = 1, limit = 15, filter: string | null = null, sortBy: string | null = null, sortOrder: string | null = null) => {
    return api
        .get('/patients', { params: { page, limit, filter, sortBy, sortOrder } })
        .then((res) => {
            return {
                patients: res.data.patients as IPatient[],
                totalCount: res.data.totalCount as number,
            };
        })
        .catch((err) => handleErrorResponse(err));
};

export const getPatient = async (id: string) => {
    return api
        .get(`/patients/${id}`)
        .then((res) => {
            return { patient: res.data.patient as IPatient, owner: res.data.owner as IUser };
        })
        .catch((err) => handleErrorResponse(err));
};

export const getPatientCount = async () => {
    return api
        .get('/patients/count')
        .then((res) => res.data.count as number)
        .catch((err) => handleErrorResponse(err));
};

export const getRecentPatients = async (number = 3) => {
    return api
        .get(`/patients/recent/${number}`)
        .then((res) => res.data.patients as IPatient[])
        .catch((err) => handleErrorResponse(err));
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

export const addFilesFormSchema = z.object({
    patient_id: z.string(),
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

export const addFiles = async (form: z.infer<typeof addFilesFormSchema>) => {
    return api
        .post(`/patients/${form.patient_id}/add-files`, { files: form.content })
        .then((res) => res.data.patient as IPatient)
        .catch((err) => handleErrorResponse(err));
};

export const deleteFilesFormSchema = z.object({
    patient_id: z.string(),
    fileIds: z.array(z.string()),
});

export const deleteFiles = async (form: z.infer<typeof deleteFilesFormSchema>) => {
    return api
        .delete(`/patients/${form.patient_id}/delete-files`, { data: { fileIds: form.fileIds } })
        .then((res) => res.data.patient as IPatient)
        .catch((err) => handleErrorResponse(err));
};

export const shareFilesFormSchema = z.object({
    patient_id: z.string(),
    fileIds: z.array(z.string()),
    address: z.string().min(42, {
        message: 'Enter a valid address',
    }),
});

export const shareFiles = async (form: z.infer<typeof shareFilesFormSchema>) => {
    return api
        .post(`/patients/${form.patient_id}/share-files`, { fileIds: form.fileIds, address: form.address })
        .then((res) => res.data.patient as IPatient)
        .catch((err) => handleErrorResponse(err));
};

export const linkAddress = async (address: string) => {
    return api
        .post(`/users/linkAddress`, { address })
        .then((res) => res.data.user as IUser)
        .catch((err) => handleErrorResponse(err));
};

export const unlinkAddress = async () => {
    return api
        .post(`/users/unlinkAddress`)
        .then((res) => res.data.user as IUser)
        .catch((err) => handleErrorResponse(err));
};
