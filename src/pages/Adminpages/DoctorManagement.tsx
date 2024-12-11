import { useEffect, useState } from "react";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchDoctors } from "../../redux/slices/doctorManageSlice";
import { TextField } from "@mui/material";
import AddDoctorModal from "../../components/admin/DoctorModals/AddDoctorModal";
import EditDoctorModal from "../../components/admin/DoctorModals/EditDoctorModal";
import DeleteDoctorModal from "../../components/admin/DoctorModals/DeleteDoctorModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Doctor {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
  departmentId: number;
  workingDays: string[];
  status: string | null;
}

type TableData = Omit<Doctor, "status"> & {
  status: string;
};

const transformDoctor = (doctor: Doctor): TableData => ({
  ...doctor,
  status: doctor.status || "-",
});

const DoctorManagement = () => {
  const doctorManage = useSelector(
    (state: RootState) => state.doctorManage.doctors || []
  );
  const loading = useSelector((state: RootState) => state.doctorManage.loading);
  // const error = useSelector((state: RootState) => state.doctorManage.error);
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const columns: Column<TableData>[] = [
    {
      id: "id",
      label: "ID",
      render: (doctor) => doctor.id,
    },
    {
      id: "name",
      label: "Full Name",
      render: (doctor) => doctor.fullName,
    },
    {
      id: "citizenID",
      label: "Citizen ID",
      render: (doctor) => doctor.citizenId,
    },
    {
      id: "email",
      label: "Email",
      render: (doctor) => doctor.email,
    },
    {
      id: "gender",
      label: "Gender",
      render: (doctor) => doctor.gender,
    },
    {
      id: "address",
      label: "Address",
      render: (doctor) => doctor.address,
    },
    {
      id: "birthDate",
      label: "Birth Date",
      render: (doctor) => doctor.birthDate,
    },
    {
      id: "departmentId",
      label: "Department ID",
      render: (doctor) => doctor.departmentId,
    },
    {
      id: "workingDays",
      label: "Working Days",
      render: (doctor) => doctor.workingDays.join(", "),
    },
    {
      id: "status",
      label: "Status",
      render: (doctor) => doctor.status,
    },
  ];

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch, shouldRefresh]);

  useEffect(() => {
    const filterDoctors = () => {
      const searchValue = search?.toLowerCase() || "";

      const filtered = Array.isArray(doctorManage)
        ? doctorManage
            .filter((item): item is Doctor => {
              if (!item) return false;
              // Add null/undefined checks
              const fullName = item.fullName || "";
              const email = item.email || "";
              const departmentId = item.departmentId || "";

              return (
                fullName.toLowerCase().trim().includes(searchValue) ||
                email.toLowerCase().includes(searchValue) ||
                departmentId.toString().includes(searchValue)
              );
            })
            .map(transformDoctor)
        : [];

      setFilteredData(filtered);
    };

    filterDoctors();
  }, [doctorManage, search]);

  const handleCloseAdd = (success?: boolean) => {
    setOpenAdd(false);
    if (success) {
      setShouldRefresh((prev) => !prev);
    }
  };

  const handleOpenEdit = (user: TableData) => {
    // Convert back to User format with potentially null fields
    const originalDoctor: Doctor = {
      ...user,
      departmentId: user.departmentId,
      status: user.status === "-" ? null : user.status,
    };
    setSelectedDoctor(originalDoctor);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedDoctor(null);
  };

  const handleOpenDelete = (user: TableData) => {
    // Convert back to User format with potentially null fields
    const originalDoctor: Doctor = {
      ...user,
      status: user.status === "-" ? null : user.status,
    };
    setSelectedDoctor(originalDoctor);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedDoctor(null);
  };
  return (
    <>
      <ToastContainer />
      <div className="p-4">
        <h1 className="text-3xl font-bold my-5">Doctor Management</h1>
        {/* {error && (
          <div className="text-red-500 mb-4">Error loading doctor: {error}</div>
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
                + Add Doctor
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
        <AddDoctorModal openAdd={openAdd} handleClose={handleCloseAdd} />
        {selectedDoctor && (
          <>
            <EditDoctorModal
              openEdit={openEdit}
              handleClose={handleCloseEdit}
              doctor={selectedDoctor}
            />
            <DeleteDoctorModal
              openDelete={openDelete}
              handleClose={handleCloseDelete}
              doctor={selectedDoctor}
            />
          </>
        )}
      </div>
    </>
  );
};

export default DoctorManagement;
