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

function formatDateToDisplay(date: string) {
  if (!date) return ""; // Return an empty string if the date is undefined or empty
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateToInput(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

const AddUserModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useAppDispatch();

  const [newUser, setNewUser] = useState({
    // id: Date.now(),
    fullName: "",
    citizenId: "",
    email: "",
    gender: "",
    address: "",
    birthDate: "",
    role: "Patient",
    status: "Inactive",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For the 'DoB' field, convert from DD/MM/YYYY to YYYY-MM-DD for storing
    const formattedValue =
      name === "birthDate" ? formatDateToInput(value) : value;

    setNewUser((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!newUser.fullName || !newUser.citizenId || !newUser.email) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate Citizen ID to be exactly 10 digits
    if (!/^\d{10}$/.test(newUser.citizenId)) {
      alert("Citizen ID must be exactly 10 digits");
      return;
    }

    // Create a new user with a unique ID
    const userToAdd = {
      ...newUser,
      id: Date.now(), // Ensure unique ID
    };

    // Dispatch the action to add the user
    dispatch(addUserAsync(userToAdd));

    // Reset form and close modal
    setNewUser({
      // id: Date.now(),
      fullName: "",
      citizenId: "",
      email: "",
      gender: "",
      address: "",
      birthDate: "",
      role: "",
      status: "",
    });
    handleClose();
  };

  return (
    <>
      <Dialog open={openAdd} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="fullName"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.fullName}
            onChange={handleChange}
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
            required
          >
            <MenuItem value="MALE">MALE</MenuItem>
            <MenuItem value="FEMALE">FEMALE</MenuItem>
            <MenuItem value="OTHER">OTHER</MenuItem>
          </TextField>
          <TextField
            label="Address"
            name="address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.address}
            onChange={handleChange}
            required
          />
          <TextField
            label="Date of Birth"
            name="birthDate"
            variant="outlined"
            fullWidth
            margin="normal"
            // Format value for display as DD/MM/YYYY
            value={
              newUser.birthDate ? formatDateToDisplay(newUser.birthDate) : ""
            }
            onChange={handleChange}
            type="text" // Use "text" type to allow custom date format
            placeholder="DD/MM/YYYY" // Placeholder to show expected format
            required
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
            // required
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Clinic Owner">Clinic Owner</MenuItem>
            <MenuItem value="Doctor">Doctor</MenuItem>
            <MenuItem value="User">Patient</MenuItem>
            <MenuItem value="Receptionist">Receptionist</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            name="status"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.status || ""}
            onChange={handleChange}
            // required
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
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

export default AddUserModal;
