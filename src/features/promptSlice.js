import { createSlice } from "@reduxjs/toolkit";

// Initial state with additional metadata
const initialState = {
    historyArr: [],
    newChat: false,
    chatIndex: -1,
    loading: false,
    error: null,
    lastUpdated: null
}

// Helper functions for immutable updates
const updateHistoryItem = (history, index, newContent) => {
    return history.map((item, i) => 
        i === index ? newContent : item
    );
};

export const promptSlice = createSlice({
    name: 'prompt',
    initialState,
    reducers: {
        localHistory: (state, action) => {
            state.historyArr = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        addHistory: (state, action) => {
            state.historyArr.push(action.payload);
            state.lastUpdated = new Date().toISOString();
        },
        updateHistory: (state, action) => {
            const targetIndex = state.chatIndex >= 0 ? state.chatIndex : state.historyArr.length - 1;
            if (targetIndex >= 0 && targetIndex < state.historyArr.length) {
                state.historyArr = updateHistoryItem(state.historyArr, targetIndex, action.payload);
                state.lastUpdated = new Date().toISOString();
            }
        },
        deleteHistory: (state, action) => {
            state.historyArr.splice(action.payload, 1);
            // Reset chat index if we deleted the current chat
            if (state.chatIndex === action.payload) {
                state.chatIndex = -1;
            }
            state.lastUpdated = new Date().toISOString();
        },
        toggleNewChat: (state, action) => {
            state.newChat = action.payload;
            if (action.payload) {
                state.chatIndex = -1; // Reset index when starting new chat
            }
        },
        setChatIndex: (state, action) => {
            state.chatIndex = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Additional reducer for batch updates
        importHistory: (state, action) => {
            state.historyArr = [...state.historyArr, ...action.payload];
            state.lastUpdated = new Date().toISOString();
        },
        // Reset entire state
        resetHistory: () => initialState
    }
});

// Thunk for async operations (example)
export const saveHistoryToStorage = () => (dispatch, getState) => {
    try {
        const { historyArr } = getState().prompt;
        localStorage.setItem('gemini_chat_history', JSON.stringify(historyArr));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

// Selectors
export const selectCurrentChat = (state) => {
    const { historyArr, chatIndex } = state.prompt;
    return chatIndex >= 0 ? historyArr[chatIndex] : historyArr[historyArr.length - 1];
};

export const selectChatCount = (state) => state.prompt.historyArr.length;

export const { 
    addHistory,
    updateHistory,
    deleteHistory,
    toggleNewChat,
    setChatIndex,
    localHistory,
    setLoading,
    setError,
    clearError,
    importHistory,
    resetHistory
} = promptSlice.actions;

export default promptSlice.reducer;