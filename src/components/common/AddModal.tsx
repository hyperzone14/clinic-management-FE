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
import { addUser } from "../../redux/slices/userManageSlide"; // Adjust the path as needed

interface AddModalProps {
  openAdd: boolean;
  handleClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useDispatch();

  const [newUser, setNewUser] = useState({
    id: Date.now(), // Generating a unique ID for demo purposes
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
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    dispatch(addUser(newUser));
    handleClose();
  };

  return (
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
          label="Gender"
          name="gender"
          variant="outlined"
          fullWidth
          margin="normal"
          select
          value={newUser.gender}
          onChange={handleChange}
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
        />
        <TextField
          label="Date of Birth"
          name="DoB"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newUser.DoB}
          onChange={handleChange}
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Role"
          name="role"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newUser.role}
          onChange={handleChange}
        />
        <TextField
          label="Status"
          name="status"
          variant="outlined"
          fullWidth
          margin="normal"
          select
          value={newUser.status}
          onChange={handleChange}
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
  );
};

export default AddModal;
