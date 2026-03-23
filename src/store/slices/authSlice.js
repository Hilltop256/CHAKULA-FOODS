import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../services/supabaseClient';

export const signUp = createAsyncThunk('auth/signUp', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data, error } = await auth.signUp(email, password);
    if (error) return rejectWithValue(error.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data, error } = await auth.signIn(email, password);
    if (error) return rejectWithValue(error.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    const { error } = await auth.signOut();
    if (error) return rejectWithValue(error.message);
    return true;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const { data: { session }, error } = await auth.getSession();
    if (error) return rejectWithValue(error.message);
    return session;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    session: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setSession: (state, action) => {
      state.session = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signUp.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(signUp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signIn.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.session = action.payload.session; state.isAuthenticated = true; })
      .addCase(signIn.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signOut.fulfilled, (state) => { state.user = null; state.session = null; state.isAuthenticated = false; })
      .addCase(checkAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.loading = false; state.session = action.payload; state.isAuthenticated = !!action.payload; state.user = action.payload?.user || null; })
      .addCase(checkAuth.rejected, (state) => { state.loading = false; state.isAuthenticated = false; });
  },
});

export const { clearError, setSession } = authSlice.actions;
export default authSlice.reducer;