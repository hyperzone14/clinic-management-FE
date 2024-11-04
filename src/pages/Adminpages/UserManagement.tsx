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

interface Data {
  id: number;
  name: string;
  age: number;
  job: string;
}

const data: Data[] = [
  { id: 1, name: "John Doe", age: 28, job: "Developer" },
  { id: 2, name: "Jane Smith", age: 34, job: "Designer" },
  { id: 3, name: "Alice Johnson", age: 45, job: "Manager" },
  { id: 4, name: "Bob Brown", age: 23, job: "Intern" },
];

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<Data[]>(data);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    setFilteredData(
      data.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.job.toLowerCase().includes(value)
      )
    );
  };

  return (
    <>
      <div className=" p-4">
        <h1 className="text-3xl font-bold my-5">User Management</h1>
        <div className="flex mt-10 mb-5">
          <TextField
            label="Search"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            className="mb-4"
          />
          <button className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-2  rounded-lg transition duration-300 ease-in-out text-xl">
            Add User
          </button>
        </div>
        <TableContainer component={Paper} className="shadow-lg">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-200">
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Job</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-100">
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.job}</TableCell>
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
      </div>
    </>
  );
};

export default UserManagement;
