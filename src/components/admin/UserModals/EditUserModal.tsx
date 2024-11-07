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
import { updateUserAsync } from "../../../redux/slices/userManageSlide";

interface Data {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string | null;
  status: string | null;
}

interface EditModalProps {
  openEdit: boolean;
  handleClose: () => void;
  user: Data;
}

const EditUserModal: React.FC<EditModalProps> = ({
  openEdit,
  handleClose,
  user,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Data>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert birthDate to format expected by API if necessary
    const updatedData = {
      ...formData,
      birthDate: formData.birthDate.split("/").reverse().join("-"), // Convert back to "YYYY-MM-DD" format
    };
    dispatch(updateUserAsync(updatedData));
    handleClose();
  };

  return (
    <Dialog open={openEdit} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <TextField
              name="name"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="citizenID"
              label="Citizen ID"
              value={formData.citizenId}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="MALE">MALE</MenuItem>
                <MenuItem value="FEMALE">FEMALE</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Date of Birth"
              name="DoB"
              variant="outlined"
              fullWidth
              //   margin="normal"
              // Format value for display as DD/MM/YYYY
              value={formData.birthDate?.split("-").reverse().join("/")}
              onChange={handleChange}
              type="text" // Use "text" type to allow custom date format
              placeholder="DD/MM/YYYY" // Placeholder to show expected format
              //   required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Clinic Owner">Clinic Owner</MenuItem>
                <MenuItem value="Clinic Owner">Doctor</MenuItem>
                <MenuItem value="User">Patient</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserModal;
