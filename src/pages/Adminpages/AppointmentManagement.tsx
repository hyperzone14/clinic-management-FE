import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import { fetchAppointments } from "../../redux/slices/appointmentManageSlice"; // You'll need to create this slice

interface PatientResponseDTO {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: null;
  status: null;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  doctorId?: number;
  departmentId?: number;
  patientId: number;
  patientResponseDTO?: PatientResponseDTO;
  appointmentStatus: string;
  timeSlot: string;
  payId?: number;
}

// Time slots mapping
const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
] as const;

type TableData = Omit<Appointment, "patientResponseDTO"> & {
  patientName: string;
  formattedTimeSlot: string;
};

const transformAppointment = (appointment: Appointment): TableData => {
  // Find the corresponding time slot display
  const timeSlotObj = TIME_SLOTS.find(
    (slot) => slot.timeSlot === appointment.timeSlot
  );

  return {
    ...appointment,
    patientName: appointment.patientResponseDTO?.fullName || "N/A",
    formattedTimeSlot: timeSlotObj?.time || appointment.timeSlot,
  };
};

const AppointmentManagement: React.FC = () => {
  const appointmentManage = useSelector(
    (state: RootState) => state.appointmentManage?.appointments || []
  );
  const loading = useSelector(
    (state: RootState) => state.appointmentManage?.loading
  );
  const error = useSelector(
    (state: RootState) => state.appointmentManage?.error
  );

  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<TableData[]>([]);

  // Define columns for the appointment table
  const columns: Column<TableData>[] = [
    {
      id: "id",
      label: "ID",
      render: (appointment) => appointment.id,
    },
    {
      id: "appointmentDate",
      label: "Appointment Date",
      render: (appointment) =>
        new Date(appointment.appointmentDate).toLocaleDateString(),
    },
    {
      id: "doctorName",
      label: "Doctor Name",
      render: (appointment) => appointment.doctorName,
    },
    {
      id: "patientName",
      label: "Patient Name",
      render: (appointment) => appointment.patientName,
    },
    {
      id: "appointmentStatus",
      label: "Appointment Status",
      render: (appointment) => appointment.appointmentStatus,
    },
    {
      id: "timeSlot",
      label: "Time Slot",
      render: (appointment) => appointment.formattedTimeSlot,
    },
    {
      id: "payId",
      label: "Payment ID",
      render: (appointment) => appointment.payId,
    },
  ];

  // Fetch appointments on component mount
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Filter appointments based on search
  useEffect(() => {
    const filterAppointments = () => {
      const searchValue = search?.toLowerCase() || "";

      const filtered = Array.isArray(appointmentManage)
        ? appointmentManage
            .filter((item): item is Appointment => {
              if (!item) return false;

              const idMatch = item.id
                ?.toString()
                .toLowerCase()
                .includes(searchValue);

              const doctorNameMatch = item.doctorName
                ?.toLowerCase()
                .includes(searchValue);

              const patientNameMatch = item.patientResponseDTO?.fullName
                .toLowerCase()
                .includes(searchValue);

              return !!idMatch || !!doctorNameMatch || !!patientNameMatch;
            })
            .map(transformAppointment)
        : [];

      setFilteredData(filtered);
    };

    filterAppointments();
  }, [appointmentManage, search]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold my-5">Appointments Management</h1>

      {error && (
        <div className="text-red-500 mb-4">
          Error loading appointments: {error}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex mt-10 mb-5 gap-x-7 justify-between">
            <div className="w-full h-1/2">
              <TextField
                label="Search"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
                fullWidth
                className="mb-4"
              />
            </div>
          </div>

          <AdminTable<TableData>
            data={filteredData}
            columns={columns}
            statusField="appointmentStatus"
            isUserManage={false}
            isAppointmentManage={true}
          />
        </>
      )}
    </div>
  );
};

export default AppointmentManagement;
