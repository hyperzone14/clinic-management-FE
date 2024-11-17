import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useAppDispatch } from "../../../redux/store";
import { updateDrug } from "../../../redux/slices/drugManageSlice";

const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

interface Data {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
  status: string | null;
}

interface EditModalProps {
  openEdit: boolean;
  handleClose: () => void;
  drug: Data;
}

const EditDrugModal: React.FC<EditModalProps> = ({
  openEdit,
  handleClose,
  drug,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Data>(drug);

  useEffect(() => {
    setFormData({ ...drug });
  }, [drug]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? toTitleCase(value) : value || null,
    }));
  };

  const toTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateDrug(formData));
    handleClose();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleClose();
  };

  return (
    <>
      <Dialog
        open={openEdit}
        onClose={(_e, reason: string) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Drug</DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Dosage"
                name="standardDosage"
                value={formData.standardDosage}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Function"
                name="drugFunction"
                value={formData.drugFunction}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Side Effect"
                name="sideEffect"
                value={formData.sideEffect}
                onChange={handleChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  label="Status"
                >
                  {VALID_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default EditDrugModal;
