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
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { addDrug } from "../../../redux/slices/drugManageSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const existingDrugs = useAppSelector((state) => state.drugManage.drugs);

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

  // Function to validate name format (letters, numbers, and spaces only)
  const isValidNameFormat = (name: string): boolean => {
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    return nameRegex.test(name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;

    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Special handling for the name field
    if (name === "name") {
      // Only allow letters, numbers, and spaces
      if (value && !isValidNameFormat(value)) {
        setErrors((prev) => ({
          ...prev,
          name: "Name can only contain letters, numbers, and spaces",
        }));
        return; // Don't update the state if invalid characters are entered
      }

      // Check for duplicate name
      const isDuplicate = existingDrugs.some(
        (drug) => drug.name.toLowerCase() === value.toLowerCase()
      );
      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          name: "A drug with this name already exists",
        }));
      }
    }

    setNewDrug({ ...newDrug, [name]: value });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DrugData, string>> = {};

    // Name validation
    if (!newDrug.name) {
      newErrors.name = "Name is required";
    } else {
      // Check name format
      if (!isValidNameFormat(newDrug.name)) {
        newErrors.name = "Name can only contain letters, numbers, and spaces";
      }
      // Check for duplicate name
      const isDuplicate = existingDrugs.some(
        (drug) => drug.name.toLowerCase() === newDrug.name.toLowerCase()
      );
      if (isDuplicate) {
        newErrors.name = "A drug with this name already exists";
      }
    }

    // Other validations
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

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      const drugToAdd = {
        ...newDrug,
        // Trim any extra spaces from the name
        name: newDrug.name.trim(),
      };

      await dispatch(addDrug(drugToAdd)).unwrap();
      toast.success("Drug added successfully");
      setNewDrug(initialDrugState);
      handleClose();
    } catch {
      toast.error("Failed to add drug");
    }
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewDrug(initialDrugState);
    setErrors({});
    handleClose();
  };

  return (
    <>
      <ToastContainer />
      <Dialog open={openAdd} onClose={handleModalClose} maxWidth="sm" fullWidth>
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
              helperText={
                errors.name || "Only letters, numbers, and spaces are allowed"
              }
              required
              inputProps={{
                pattern: "[A-Za-z0-9\\s]*",
                title: "Only letters, numbers, and spaces are allowed",
              }}
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
              helperText={errors.standardDosage}
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
              helperText={errors.drugFunction}
              required
            />
            <TextField
              label="Unit"
              name="unit"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDrug.unit}
              onChange={handleChange}
              error={!!errors.unit}
              helperText={errors.unit}
              required
              inputProps={{ min: 1 }}
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
              helperText={errors.sideEffect}
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
