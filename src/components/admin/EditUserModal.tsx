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
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/userManageSlide";

interface Data {
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
  const dispatch = useDispatch();
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
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUser(formData));
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
              value={formData.name}
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
              value={formData.citizenID}
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
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
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
              value={formData.DoB?.split("-").reverse().join("/")}
              onChange={handleChange}
              type="text" // Use "text" type to allow custom date format
              placeholder="DD/MM/YYYY" // Placeholder to show expected format
              //   required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
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
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
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
