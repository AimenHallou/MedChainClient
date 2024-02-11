import { api, setBearerToken } from '@/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type User = {
    username: string;
    address?: string;
    name?: string;
    healthcareType?: string;
    organizationName?: string;
};

export interface UsersState {
    user?: User;
    error?: string;
    response?: string;
}

const initialState: UsersState = {
    user: undefined,
    error: '',
    response: '',
};

interface AuthPayload {
    username: string;
    password: string;
}

interface UpdatePayload {
    name?: string;
    healthcareType?: string;
    organizationName?: string;
}

export const register = createAsyncThunk('users/register', async (payload: AuthPayload, { rejectWithValue }) => {
    try {
        const response = await api({
            method: 'POST',
            url: '/users/register',
            data: payload,
        });

        setBearerToken(response.data.token);
        localStorage.setItem('token', JSON.stringify(response.data.token));

        console.log(response);
        return response.data.user;
    } catch (error: any) {
        console.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
    }
});

export const login = createAsyncThunk('users/login', async (payload: AuthPayload, { rejectWithValue }) => {
    try {
        const response = await api({
            method: 'POST',
            url: '/users/login',
            data: payload,
        });

        setBearerToken(response.data.token);
        localStorage.setItem('token', JSON.stringify(response.data.token));

        return response.data.user;
    } catch (error: any) {
        console.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
    }
});

export const getMe = createAsyncThunk('users/me', async (_, { rejectWithValue }) => {
    try {
        const token = JSON.parse(localStorage.getItem('token') || '{}');

        setBearerToken(token);

        const response = await api({
            method: 'GET',
            url: '/users/me',
        });

        return response.data.user;
    } catch (error: any) {
        console.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
    }
});

export const updateDetails = createAsyncThunk('users/updateDetails', async (payload: UpdatePayload, { rejectWithValue }) => {
    try {
        const response = await api({
            method: 'PATCH',
            url: '/users/updateDetails',
            data: payload,
        });

        return response.data.user;
    } catch (error: any) {
        console.error(error.response?.data?.message);
        return rejectWithValue(error.response.data.message);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = undefined;
            localStorage.removeItem('token');
            setBearerToken('');
        },
        setAuthError: (state, action) => {
            state.error = action.payload;
            state.response = '';
        },

        updateUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(register.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.error = (action.payload as string) || '';
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.error = (action.payload as string) || '';
        });
        builder.addCase(getMe.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(updateDetails.fulfilled, (state, action) => {
            state.response = 'Profile updated successfully';
            state.user = action.payload;
        });
        builder.addCase(updateDetails.rejected, (state, action) => {
            state.error = (action.payload as string) || '';
        });
    },
});

export const { logout, setAuthError, updateUser } = userSlice.actions;

export default userSlice.reducer;
