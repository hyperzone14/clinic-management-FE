import {
  Table,
  Paper,
  TextField,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AddModal from "../../components/common/AddModal";

interface Data {
  id: number;
  name: string;
  citizenID: string;
  email: string;
  gender: string;
  address: string;
  DoB: string;
  role: string;
  status: string;
}

const data: Data[] = [
  {
    id: 1,
    name: "John Doe",
    citizenID: "123456789",
    email: "jZK9a@example.com",
    gender: "Male",
    address: "123 Main St",
    DoB: "1990-01-01",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Doe",
    citizenID: "987654321",
    email: "jZK9a@example.com",
    gender: "Female",
    address: "456 Elm St",
    DoB: "1985-05-15",
    role: "User",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Bob Smith",
    citizenID: "456789123",
    email: "jZK9a@example.com",
    gender: "Male",
    address: "789 Oak St",
    DoB: "1995-12-31",
    role: "Receptionist",
    status: "Active",
  },
  {
    id: 4,
    name: "Alice Johnson",
    citizenID: "789123456",
    email: "jZK9a@example.com",
    gender: "Female",
    address: "321 Pine St",
    DoB: "1980-06-20",
    role: "Receptionist",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Mike Brown",
    citizenID: "321654987",
    email: "jZK9a@example.com",
    gender: "Male",
    address: "654 Cedar St",
    DoB: "1978-03-10",
    role: "Admin",
    status: "Active",
  },
  {
    id: 6,
    name: "Emily Davis",
    citizenID: "654987321",
    email: "jZK9a@example.com",
    gender: "Female",
    address: "987 Maple St",
    DoB: "1992-09-30",
    role: "User",
    status: "Inactive",
  },
];

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filteredData, setFilteredData] = useState<Data[]>(data);
  const [openAdd, setOpenAdd] = useState(false);

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    setFilteredData(
      data.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.email.toLowerCase().includes(value) ||
          item.citizenID.includes(value)
      )
    );
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust start page if we're near the end
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
    <>
      <div className=" p-4">
        <h1 className="text-3xl font-bold my-5">User Management</h1>
        <div className="flex mt-10 mb-5 gap-x-7">
          <div className="w-[68.5rem] h-1/2">
            <TextField
              label="Search"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              fullWidth
              className="mb-4"
            />
          </div>
          <button
            className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-2  rounded-lg transition duration-300 ease-in-out text-lg"
            onClick={handleOpenAdd}
          >
            + Add User
          </button>
          <AddModal openAdd={openAdd} handleClose={handleCloseAdd} />
        </div>

        <TableContainer
          component={Paper}
          className="shadow-lg max-h-80 overflow-auto"
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#a85e1f" }}>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Full name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Citizen ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date of birth</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:hover": { backgroundColor: "#d7d7d7" } }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.citizenID}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.gender}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.DoB}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div className="flex items-center">
            {/* Rows per page selector */}
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
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              entries
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
    </>
  );
};

export default UserManagement;
