import React from "react";
import {
  Table,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import {
  setCurrentPage,
  setRowsPerPage,
  setRoleFilter,
} from "../../redux/slices/tableSlide";

// Define a generic column configuration type
export interface Column<T> {
  id: string;
  label: string;
  render: (item: T) => React.ReactNode;
}

// Define the generic table props
export interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  showActions?: boolean;
  getRowClassName?: (item: T) => string;
  statusField?: keyof T;
  isUserManage?: boolean;
}

const AdminTable = <T extends { id: number | string; role?: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  showActions = true,
  getRowClassName,
  statusField,
  isUserManage = false,
}: AdminTableProps<T>) => {
  const dispatch = useDispatch();
  const { currentPage, rowsPerPage, roleFilter } = useSelector(
    (state: RootState) => state.table
  );
  // Filter data based on selected role if UserManage is true
  const filteredData =
    isUserManage && roleFilter !== "All"
      ? data.filter((item) => item.role === roleFilter)
      : data;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleRoleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setRoleFilter(event.target.value));
    dispatch(setCurrentPage(1)); // Reset to page 1 when filter changes
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setRowsPerPage(Number(event.target.value)));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div>
      {isUserManage && (
        <div className="flex items-center mb-4">
          <label htmlFor="role-filter" className="mr-2">
            Filter by Role:
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="border rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="ADMIN">Admin</option>
            <option value="CLINIC_OWNER">Clinic Owner</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PATIENT">Patient</option>
            {/* <option value="Receptionist">Receptionist</option> */}
          </select>
        </div>
      )}
      <TableContainer
        component={Paper}
        className="shadow-lg max-h-96 overflow-auto"
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#a85e1f" }}>
              {columns.map((column) => (
                <TableCell key={column.id} sx={{ fontWeight: "bold" }}>
                  {column.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row) => (
              <TableRow
                key={row.id}
                className={getRowClassName?.(row)}
                sx={{ "&:hover": { backgroundColor: "#d7d7d7" } }}
              >
                {columns.map((column) => (
                  <TableCell key={`${row.id}-${column.id}`}>
                    {statusField && column.id === statusField ? (
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          row[statusField] === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {column.render(row)}
                      </span>
                    ) : (
                      column.render(row)
                    )}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <div className="flex items-center">
                      {onEdit && (
                        <FaRegEdit
                          size={20}
                          onClick={() => onEdit(row)}
                          className="cursor-pointer hover:text-[#34a85a] transition duration-300 ease-in-out"
                        />
                      )}
                      {onDelete && (
                        <FaRegTrashCan
                          size={20}
                          onClick={() => onDelete(row)}
                          className="ms-2 cursor-pointer hover:text-[#FF312E] transition duration-300 ease-in-out"
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {currentData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  align="center"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="flex items-center">
          <div className="flex items-center">
            <span className="mr-2">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border rounded px-2 py-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
          <span className="text-sm text-gray-700 ms-5">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
            {data.length} entries
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1 rounded ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
