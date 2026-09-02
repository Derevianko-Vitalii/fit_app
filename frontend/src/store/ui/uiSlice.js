import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  /** Глобальний пошуковий запит із хедера. */
  searchQuery: '',
  /** Активна вкладка пошуку: 'posts' | 'users'. */
  searchScope: 'posts',
  isSidebarOpen: false,
  /** Сповіщення-тости: { id, type, message }. */
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSearchScope(state, action) {
      state.searchScope = action.payload;
    },
    resetSearch(state) {
      state.searchQuery = '';
    },
    toggleSidebar(state, action) {
      state.isSidebarOpen = action.payload ?? !state.isSidebarOpen;
    },
    showToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(message, type = 'info') {
        return { payload: { id: nanoid(), message, type } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const {
  setSearchQuery,
  setSearchScope,
  resetSearch,
  toggleSidebar,
  showToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
