import { api, setBearerToken } from '@/api';
import { IUser } from '@/types/patient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface UsersState {
    user?: IUser;
    error?: string;
    response?: string;
}

const initialState: UsersState = {
    user: undefined,
    error: '',
    response: '',
};

interface UpdatePayload {
    name?: string;
    healthcareType?: string;
    organizationName?: string;
}

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
