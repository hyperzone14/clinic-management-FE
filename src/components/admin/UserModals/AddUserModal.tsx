import React, { useState } from "react";
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
import { addUserAsync } from "../../../redux/slices/userManageSlide";

interface AddModalProps {
  openAdd: boolean;
  handleClose: () => void;
}

interface UserData {
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: "ADMIN" | "CLINIC_OWNER" | "DOCTOR" | "PATIENT" | "";
  status: "ACTIVE" | "INACTIVE" | "";
}

const AddUserModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useAppDispatch();

  const initialUserState: UserData = {
    fullName: "",
    citizenId: "",
    email: "",
    gender: "",
    address: "",
    birthDate: "",
    role: "",
    status: "",
  };

  const [newUser, setNewUser] = useState<UserData>(initialUserState);
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>(
    {}
  );

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};

    if (!newUser.fullName) newErrors.fullName = "Name is required";
    if (!newUser.citizenId) newErrors.citizenId = "Citizen ID is required";
    if (!newUser.email) newErrors.email = "Email is required";
    if (!newUser.gender) newErrors.gender = "Gender is required";
    if (!newUser.address) newErrors.address = "Address is required";
    if (!newUser.birthDate) newErrors.birthDate = "Date of Birth is required";
    if (!newUser.role) newErrors.role = "Role is required";
    if (!newUser.status) newErrors.status = "Status is required";

    if (!/^\d{10}$/.test(newUser.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    if (!validateEmail(newUser.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userToAdd = {
      ...newUser,
      id: Date.now(),
    };

    dispatch(addUserAsync(userToAdd));
    setNewUser(initialUserState);
    handleClose();
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;

    // Update the newUser state directly with the date value
    setNewUser((prev) => ({
      ...prev,
      birthDate: newDate, // Store as YYYY-MM-DD format internally
    }));

    // Clear any errors
    setErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  return (
    <Dialog open={openAdd} onClose={handleModalClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Name"
            name="fullName"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
          />
          <TextField
            label="Citizen ID"
            name="citizenId"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.citizenId}
            onChange={handleChange}
            error={!!errors.citizenId}
            helperText={errors.citizenId}
            required
          />
          <TextField
            label="Email"
            name="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            type="email"
            required
          />
          <TextField
            select
            label="Gender"
            name="gender"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.gender}
            onChange={handleChange}
            error={!!errors.gender}
            helperText={errors.gender}
            required
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>
          <TextField
            label="Address"
            name="address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
          <TextField
            label="Date of Birth"
            name="birthDate"
            variant="outlined"
            fullWidth
            margin="normal"
            type="date"
            value={newUser.birthDate}
            onChange={handleDateChange}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            required
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "8px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 14px",
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, -9px) scale(0.75)",
                background: "white",
                padding: "0 4px",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
            inputProps={{
              placeholder: "dd/mm/yyyy",
              min: "1900-01-01",
              max: new Date().toISOString().split("T")[0],
            }}
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                background: "white",
                px: 1,
              },
            }}
          />
          <TextField
            select
            label="Role"
            name="role"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.role}
            onChange={handleChange}
            error={!!errors.role}
            helperText={errors.role}
            required
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="CLINIC_OWNER">Clinic Owner</MenuItem>
            <MenuItem value="DOCTOR">Doctor</MenuItem>
            <MenuItem value="PATIENT">Patient</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            name="status"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.status}
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
  );
};

export default AddUserModal;
