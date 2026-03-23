import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
    loading: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setTheme: (state, action) => { state.theme = action.payload; },
    addNotification: (state, action) => { state.notifications.push(action.payload); },
    removeNotification: (state, action) => { state.notifications = state.notifications.filter(n => n.id !== action.payload); },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, addNotification, removeNotification, setLoading } = appSlice.actions;
export default appSlice.reducer;