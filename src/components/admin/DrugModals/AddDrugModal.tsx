import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useAppDispatch } from "../../../redux/store";
import { addDrug } from "../../../redux/slices/drugManageSlice";
import { ToastContainer } from "react-toastify";

interface AddModalProps {
  openAdd: boolean;
  handleClose: () => void;
}

interface DrugData {
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
  status: "ACTIVE" | "INACTIVE" | "";
}

const AddDrugModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useAppDispatch();

  const initialDrugState: DrugData = {
    name: "",
    standardDosage: "",
    drugFunction: "",
    unit: 0,
    sideEffect: "",
    status: "",
  };

  const [newDrug, setNewDrug] = React.useState<DrugData>(initialDrugState);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof DrugData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNewDrug({ ...newDrug, [name]: value });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DrugData, string>> = {};

    if (!newDrug.name) newErrors.name = "Name is required";
    if (!newDrug.standardDosage)
      newErrors.standardDosage = "Standard Dosage is required";
    if (!newDrug.drugFunction)
      newErrors.drugFunction = "Drug Function is required";
    if (!newDrug.unit) newErrors.unit = "Unit is required";
    if (!newDrug.sideEffect) newErrors.sideEffect = "Side Effect is required";
    if (!newDrug.status) newErrors.status = "Status is required";
    if (newDrug.unit < 1) newErrors.unit = "Unit must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const drugToAdd = {
      ...newDrug,
    };

    dispatch(addDrug(drugToAdd));
    setNewDrug(initialDrugState);
    handleClose();
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
  };

  return (
    <>
      <ToastContainer />
      <Dialog open={openAdd} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className="text-lg font-semibold mb-4">
          Add New Drug
        </DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Name"
              name="name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              label="Dosage"
              name="standardDosage"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.standardDosage}
              onChange={handleChange}
              error={!!errors.standardDosage}
              helperText={errors.name}
              required
            />
            <TextField
              label="Function"
              name="drugFunction"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.drugFunction}
              onChange={handleChange}
              error={!!errors.drugFunction}
              helperText={errors.name}
              required
            />
            <TextField
              label="Unit"
              name="unit"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.unit}
              onChange={handleChange}
              error={!!errors.unit}
              helperText={errors.name}
              required
            />
            <TextField
              label="Side Effect"
              name="sideEffect"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.sideEffect}
              onChange={handleChange}
              error={!!errors.sideEffect}
              helperText={errors.name}
              required
            />
            <TextField
              select
              label="Status"
              name="status"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={errors.status}
              required
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddDrugModal;
