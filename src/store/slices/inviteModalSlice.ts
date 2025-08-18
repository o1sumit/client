import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { authAPI } from "../../services/api";

interface InviteModalState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  inviteCode: string;
}

const initialState: InviteModalState = {
  isOpen: false,
  isLoading: false,
  error: null,
  inviteCode: "",
};

// Async thunk for submitting invite code
export const submitInviteCode = createAsyncThunk(
  "inviteModal/submitInviteCode",
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({
        invite_code: inviteCode,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Invalid invite code. Please check your code and try again.";

      return rejectWithValue(errorMessage);
    }
  },
);

const inviteModalSlice = createSlice({
  name: "inviteModal",
  initialState,
  reducers: {
    openInviteModal: (state) => {
      state.isOpen = true;
      state.error = null;
      state.inviteCode = "";
    },
    closeInviteModal: (state) => {
      state.isOpen = false;
      state.error = null;
      state.inviteCode = "";
    },
    setInviteCode: (state, action: PayloadAction<string>) => {
      state.inviteCode = action.payload;
      // Clear error when user starts typing
      if (state.error) {
        state.error = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitInviteCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitInviteCode.fulfilled, (state) => {
        state.isLoading = false;
        state.isOpen = false;
        state.error = null;
        state.inviteCode = "";
        // Refresh the page to re-fetch user data
        window.location.reload();
      })
      .addCase(submitInviteCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { openInviteModal, closeInviteModal, setInviteCode, clearError } =
  inviteModalSlice.actions;

export default inviteModalSlice.reducer;
