import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AddUserModal from "../../components/admin/UserModals/AddUserModal";
import DeleteUserModal from "../../components/admin/UserModals/DeleteUserModal";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import EditUserModal from "../../components/admin/UserModals/EditUserModal";
import { fetchUsers } from "../../redux/slices/userManageSlice";

interface User {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
  status: string | null;
}

type TableData = Omit<User, "status"> & {
  status: string;
};

const transformUser = (user: User): TableData => ({
  ...user,
  status: user.status || "-",
});

const UserManagement: React.FC = () => {
  const userManage = useSelector(
    (state: RootState) => state.userManage.users || []
  );
  const loading = useSelector((state: RootState) => state.userManage.loading);
  // const error = useSelector((state: RootState) => state.userManage.error);
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Define columns for the user table
  const columns: Column<TableData>[] = [
    {
      id: "id",
      label: "ID",
      render: (user) => user.id,
    },
    {
      id: "name",
      label: "Full Name",
      render: (user) => user.fullName,
    },
    {
      id: "citizenID",
      label: "Citizen ID",
      render: (user) => user.citizenId,
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
      render: (user) => user.birthDate?.split("-").reverse().join("/"),
    },
    {
      id: "status",
      label: "Status",
      render: (user) => user.status,
    },
  ];

  useEffect(() => {
    dispatch(fetchUsers()); // Or whatever default values you want to use
  }, [dispatch, shouldRefresh]);

  useEffect(() => {
    const filterUsers = () => {
      const searchValue = search?.toLowerCase() || "";

      const filtered = Array.isArray(userManage)
        ? userManage
            .filter((item): item is User => {
              if (!item) return false;

              return (
                item.fullName.includes(searchValue) ||
                item.email.includes(searchValue)
              );
            })
            .map(transformUser)
        : [];

      setFilteredData(filtered);
    };

    filterUsers();
  }, [userManage, search]);

  const handleCloseAdd = (success?: boolean) => {
    setOpenAdd(false);
    if (success) {
      setShouldRefresh((prev) => !prev);
    }
  };

  const handleOpenEdit = (user: TableData) => {
    // Convert back to User format with potentially null fields
    const originalUser: User = {
      ...user,
      status: user.status === "-" ? null : user.status,
    };
    setSelectedUser(originalUser);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedUser(null);
  };

  const handleOpenDelete = (user: TableData) => {
    // Convert back to User format with potentially null fields
    const originalUser: User = {
      ...user,
      status: user.status === "-" ? null : user.status,
    };
    setSelectedUser(originalUser);
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
      <h1 className="text-3xl font-bold my-5">Patients Management</h1>
      {/* {error && (
        <div className="text-red-500 mb-4">Error loading patients: {error}</div>
      )} */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
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
              + Add Patient
            </button>
          </div>

          <AdminTable<TableData>
            data={filteredData}
            columns={columns}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            statusField="status"
            isUserManage={true}
          />
        </>
      )}
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
