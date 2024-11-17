import React, { useEffect, useState } from "react";
import { RootState, useAppDispatch } from "../../redux/store";
import { useSelector } from "react-redux";
import AdminTable, { Column } from "../../components/admin/AdminTable";
import { fetchDrugs } from "../../redux/slices/drugManageSlice";
import { TextField } from "@mui/material";
import AddDrugModal from "../../components/admin/DrugModals/AddDrugModal";
import EditDrugModal from "../../components/admin/DrugModals/EditDrugModal";
import DeleteDrugModal from "../../components/admin/DrugModals/DeleteDrugModal";

interface Drug {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
  status: string | null;
}

type TableData = Omit<Drug, "status"> & {
  status: string;
};

const transformDrug = (drug: Drug): TableData => ({
  ...drug,
  status: drug.status || "-",
});

const DrugManagement: React.FC = () => {
  const drugManage = useSelector((state: RootState) => state.drugManage.drugs);
  const loading = useSelector((state: RootState) => state.drugManage.loading);
  const error = useSelector((state: RootState) => state.drugManage.error);
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  const columns: Column<TableData>[] = [
    {
      id: "id",
      label: "ID",
      render: (drug) => drug.id,
    },
    {
      id: "name",
      label: "Name",
      render: (drug) => drug.name,
    },
    {
      id: "standardDosage",
      label: "Standard Dosage",
      render: (drug) => drug.standardDosage,
    },
    {
      id: "drugFunction",
      label: "Drug Function",
      render: (drug) => drug.drugFunction,
    },
    {
      id: "unit",
      label: "Unit",
      render: (drug) => drug.unit,
    },
    {
      id: "sideEffect",
      label: "Side Effect",
      render: (drug) => drug.sideEffect,
    },
    {
      id: "status",
      label: "Status",
      render: (drug) => drug.status,
    },
  ];

  useEffect(() => {
    dispatch(fetchDrugs());
  }, [dispatch]);

  useEffect(() => {
    const filterDrug = () => {
      const filterDrug = search?.toLowerCase() || "";
      const filtered = Array.isArray(drugManage)
        ? drugManage
            .filter((item): item is Drug => {
              if (!item) return false;

              return item.name.toLowerCase().includes(filterDrug);
            })
            .map(transformDrug)
        : [];

      setFilteredData(filtered);
    };
    filterDrug();
  }, [search, drugManage]);

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleOpenEdit = (drug: TableData) => {
    const originalDrug: Drug = {
      ...drug,
      status: drug.status === "-" ? null : drug.status,
    };
    setSelectedDrug(originalDrug);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedDrug(null);
  };

  const handleOpenDelete = (drug: TableData) => {
    const originalDrug: Drug = {
      ...drug,
      status: drug.status === "-" ? null : drug.status,
    };
    setSelectedDrug(originalDrug);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedDrug(null);
  };

  return (
    <>
      <div className="p-4">
        <h1 className="text-3xl font-bold my-5">Drug Management</h1>
        {error && (
          <div className="text-red-500 mb-4">Error loading drugs: {error}</div>
        )}
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
                + Add Drug
              </button>
            </div>

            <AdminTable<TableData>
              data={filteredData}
              columns={columns}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              statusField="status"
              isUserManage={false}
            />
          </>
        )}
        <AddDrugModal openAdd={openAdd} handleClose={handleCloseAdd} />
        {selectedDrug && (
          <>
            <EditDrugModal
              openEdit={openEdit}
              handleClose={handleCloseEdit}
              drug={selectedDrug}
            />
            <DeleteDrugModal
              openDelete={openDelete}
              handleClose={handleCloseDelete}
              drug={selectedDrug}
            />
          </>
        )}
      </div>
    </>
  );
};

export default DrugManagement;
