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
import { updateUserAsync } from "../../../redux/slices/userManageSlice";

const VALID_STATUSES = ["ACTIVE", "INACTIVE"];
// const VALID_ROLES = ["ADMIN", "CLINIC_OWNER", "DOCTOR", "PATIENT"];

interface Data {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  // password: string;
  gender: string;
  address: string;
  birthDate: string;
  // role: string | null;
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
    setFormData({
      ...user,
    });
  }, [user]);

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

  const toTitleCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      birthDate: formData.birthDate.split("/").reverse().join("-"),
    };

    dispatch(updateUserAsync(updatedData));
    handleClose();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleClose();
  };

  return (
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
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <TextField
              name="fullName"
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
              name="citizenId"
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
              name="birthDate"
              variant="outlined"
              fullWidth
              value={formData.birthDate?.split("-").reverse().join("/")}
              onChange={handleChange}
              type="text"
              placeholder="DD/MM/YYYY"
            />
            {/* <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                label="Role"
              >
                {VALID_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>*/}
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
  );
};

export default EditUserModal;
