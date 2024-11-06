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
import { useDispatch } from "react-redux";
import { addUser } from "../../redux/slices/userManageSlide";

interface AddModalProps {
  openAdd: boolean;
  handleClose: () => void;
}

function formatDateToDisplay(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateToInput(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

const AddUserModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useDispatch();

  const [newUser, setNewUser] = useState({
    id: Date.now(),
    name: "",
    citizenID: "",
    email: "",
    gender: "",
    address: "",
    DoB: "",
    role: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For the 'DoB' field, convert from DD/MM/YYYY to YYYY-MM-DD for storing
    const formattedValue = name === "DoB" ? formatDateToInput(value) : value;

    setNewUser((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!newUser.name || !newUser.citizenID || !newUser.email) {
      alert("Please fill in all required fields");
      return;
    }

    // Create a new user with a unique ID
    const userToAdd = {
      ...newUser,
      id: Date.now(), // Ensure unique ID
    };

    // Dispatch the action to add the user
    dispatch(addUser(userToAdd));

    // Reset form and close modal
    setNewUser({
      id: Date.now(),
      name: "",
      citizenID: "",
      email: "",
      gender: "",
      address: "",
      DoB: "",
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
            name="name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Citizen ID"
            name="citizenID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.citizenID}
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
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
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
            name="DoB"
            variant="outlined"
            fullWidth
            margin="normal"
            // Format value for display as DD/MM/YYYY
            value={newUser.DoB ? formatDateToDisplay(newUser.DoB) : ""}
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
            required
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
            value={newUser.status}
            onChange={handleChange}
            required
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
