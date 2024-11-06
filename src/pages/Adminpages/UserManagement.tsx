import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AddUserModal from "../../components/admin/AddUserModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import EditUserModal from "../../components/admin/EditUserModal";
import { fetchUsers } from "../../redux/slices/userManageSlide";

interface User {
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

const UserManagement: React.FC = () => {
  const userManage = useSelector((state: RootState) => state.userManage.users);
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Define columns for the user table
  const columns: Column<User>[] = [
    {
      id: "id",
      label: "ID",
      render: (user) => user.id,
    },
    {
      id: "name",
      label: "Full Name",
      render: (user) => user.name,
    },
    {
      id: "citizenID",
      label: "Citizen ID",
      render: (user) => user.citizenID,
    },
    {
      id: "email",
      label: "Email",
      render: (user) => user.email,
    },
    {
      id: "gender",
      label: "Gender",
      render: (user) => user.gender,
    },
    {
      id: "address",
      label: "Address",
      render: (user) => user.address,
    },
    {
      id: "DoB",
      label: "Date of Birth",
      render: (user) => user.DoB?.split("-").reverse().join("/"),
    },
    {
      id: "role",
      label: "Role",
      render: (user) => user.role,
    },
    {
      id: "status",
      label: "Status",
      render: (user) => user.status,
    },
  ];

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // console.log(dispatch);

  useEffect(() => {
    const value = search.toLowerCase();
    const filtered = userManage.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.citizenID.includes(value)
    );
    setFilteredData(filtered);
  }, [userManage, search]);

  // const handleOpenAdd = () => {
  //   setOpenAdd(true);
  // };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedUser(null);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedUser(null);
  };

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearch(event.target.value.toLowerCase());
  // };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold my-5">User Management</h1>
      <div className="flex mt-10 mb-5 gap-x-7 justify-between">
        <div className="w-10/12 h-1/2">
          <TextField
            label="Search"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            fullWidth
            className="mb-4"
          />
        </div>
        <button
          className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-2 rounded-lg transition duration-300 ease-in-out text-lg"
          onClick={() => setOpenAdd(true)}
        >
          + Add User
        </button>
      </div>

      <AdminTable<User>
        data={filteredData}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        statusField="status"
        isUserManage={true}
      />

      <AddUserModal openAdd={openAdd} handleClose={handleCloseAdd} />
      {selectedUser && (
        <>
          <EditUserModal
            openEdit={openEdit}
            handleClose={handleCloseEdit}
            user={selectedUser}
          />
          <DeleteUserModal
            openDelete={openDelete}
            handleClose={handleCloseDelete}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
