import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../services/supabaseClient';

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (userId, { rejectWithValue }) => {
  try {
    const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();
    if (error) return rejectWithValue(error.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateUserProfile = createAsyncThunk('user/updateProfile', async ({ userId, updates }, { rejectWithValue }) => {
  try {
    const { data, error } = await db.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) return rejectWithValue(error.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createUserProfile = createAsyncThunk('user/createProfile', async ({ userId, profileData }, { rejectWithValue }) => {
  try {
    const { data, error } = await db.from('profiles').insert({ id: userId, ...profileData }).select().single();
    if (error) return rejectWithValue(error.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => { state.error = null; },
    setProfile: (state, action) => { state.profile = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateUserProfile.pending, (state) => { state.loading = true; })
      .addCase(updateUserProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(updateUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createUserProfile.pending, (state) => { state.loading = true; })
      .addCase(createUserProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(createUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearUserError, setProfile } = userSlice.actions;
export default userSlice.reducer;