// redux/slices/tableSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TableState {
  currentPage: number;
  rowsPerPage: number;
  roleFilter: string; // Add this to store the selected role filter
}

const initialState: TableState = {
  currentPage: 1,
  rowsPerPage: 5,
  roleFilter: "All", // Default to "All" for showing all roles
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
    setRoleFilter(state, action: PayloadAction<string>) {
      state.roleFilter = action.payload; // Update role filter
    },
  },
});

export const { setCurrentPage, setRowsPerPage, setRoleFilter } =
  tableSlice.actions;
export default tableSlice.reducer;
