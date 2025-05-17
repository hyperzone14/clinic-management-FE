import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchAdminRecords } from "../../redux/slices/medicHistorySlice";
import { TextField } from "@mui/material";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface MedicalRecord {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  syndrome: string;
  finalDiagnosis: string;
  weight: number;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  note: string;
  nextAppointmentDate: string | null;
  prescribedDrugs: any[];
  examinationDetails: any[];
}

const MedicalBillManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector(
    (state) => state.medicHistory
  );
  const { currentPage, rowsPerPage } = useAppSelector((state) => state.table);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  // Gọi fetchAdminRecords mỗi khi đổi trang hoặc số dòng
  useEffect(() => {
    dispatch(fetchAdminRecords());
  }, [dispatch, currentPage, rowsPerPage]);

  useEffect(() => {
    const searchValue = search?.toLowerCase() || "";
    const filtered = records.filter(
      (record) =>
        record.patientName.toLowerCase().includes(searchValue) ||
        record.doctorName.toLowerCase().includes(searchValue)
    );
    setFilteredData(filtered);
  }, [records, search]);

  const handleViewDetail = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedRecord(null);
  };

  // Xử lý đổi trang

  // Xử lý đổi số dòng/trang

  const columns: Column<MedicalRecord>[] = [
    {
      id: "patientName",
      label: "Patient Name",
      render: (record) => record.patientName,
    },
    {
      id: "doctorName",
      label: "Doctor Name",
      render: (record) => record.doctorName,
    },
    {
      id: "date",
      label: "Date",
      render: (record) => format(new Date(record.date), "dd/MM/yyyy"),
    },
    {
      id: "syndrome",
      label: "Syndrome",
      render: (record) => record.syndrome,
    },
    {
      id: "finalDiagnosis",
      label: "Final Diagnosis",
      render: (record) => record.finalDiagnosis || "N/A",
    },
    {
      id: "actions",
      label: "Actions",
      render: (record) => (
        <button
          onClick={() => handleViewDetail(record)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold my-5">Medical Bill Management</h1>
      
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
      </div>

      <AdminTable<MedicalRecord>
        data={filteredData}
        columns={columns}
        statusField="finalDiagnosis"
        isUserManage={false}
        showActions={false}
      />

      {/* Detail Modal */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <span>Medical Record Details</span>
          <IconButton onClick={handleCloseDetail}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <div className="p-4 w-full">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-bold">Patient Information</h3>
                  <p>Name: {selectedRecord.patientName}</p>
                  <p>Weight: {selectedRecord.weight} kg</p>
                  <p>Heart Rate: {selectedRecord.heartRate} bpm</p>
                  <p>Blood Pressure: {selectedRecord.bloodPressure}</p>
                  <p>Temperature: {selectedRecord.temperature}°C</p>
                </div>
                <div>
                  <h3 className="font-bold">Doctor Information</h3>
                  <p>Name: {selectedRecord.doctorName}</p>
                  <p>Date: {format(new Date(selectedRecord.date), "dd/MM/yyyy")}</p>
                  <p>Next Appointment: {selectedRecord.nextAppointmentDate ? format(new Date(selectedRecord.nextAppointmentDate), "dd/MM/yyyy") : "N/A"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Diagnosis</h3>
                <p>Syndrome: {selectedRecord.syndrome}</p>
                <p>Final Diagnosis: {selectedRecord.finalDiagnosis || "N/A"}</p>
                {selectedRecord.note && (
                  <div className="mt-2">
                    <h4 className="font-bold">Notes:</h4>
                    <p>{selectedRecord.note}</p>
                  </div>
                )}
              </div>

              {selectedRecord.prescribedDrugs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Prescribed Drugs</h3>
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left">Drug Name</th>
                          <th className="px-4 py-2 text-left">Dosage</th>
                          <th className="px-4 py-2 text-left">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.prescribedDrugs.map((drug: any) => (
                          <tr key={drug.id}>
                            <td className="px-4 py-2">{drug.drugName}</td>
                            <td className="px-4 py-2">{drug.dosage}</td>
                            <td className="px-4 py-2">{drug.specialInstructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRecord.examinationDetails.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Examination Details</h3>
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Result</th>
                          <th className="px-4 py-2 text-left">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.examinationDetails.map((exam: any) => (
                          <tr key={exam.id}>
                            <td className="px-4 py-2">{exam.examinationType}</td>
                            <td className="px-4 py-2">{exam.examinationResult}</td>
                            <td className="px-4 py-2">${exam.labPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalBillManagement; 