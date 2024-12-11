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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const VALID_STATUSES = ["ACTIVE", "INACTIVE"];
// const VALID_ROLES = ["ADMIN", "CLINIC_OWNER", "DOCTOR", "PATIENT"];

interface UserData {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
  // role: string | null;
  // status: string | null;
}

interface EditModalProps {
  openEdit: boolean;
  handleClose: () => void;
  user: UserData;
}

const EditUserModal: React.FC<EditModalProps> = ({
  openEdit,
  handleClose,
  user,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<UserData>(user);
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>(
    {}
  );

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

    if (!validateForm()) {
      toast.error("Invalid input, please check again");
      return;
    }

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

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.citizenId) {
      newErrors.citizenId = "Citizen ID is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    } else {
      // Validate date format DD/MM/YYYY
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = "Invalid date format. Use DD/MM/YYYY";
      }
    }

    if (!/^\d{10}$/.test(formData.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <ToastContainer />
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
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TextField
                name="fullName"
                type="text"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
              <TextField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                disabled
              />
              <TextField
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password}
              />
              <TextField
                name="citizenId"
                type="text"
                label="Citizen ID"
                value={formData.citizenId}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.citizenId}
                helperText={errors.citizenId}
              />
              <FormControl fullWidth error={!!errors.gender}>
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
                type="text"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.address}
                helperText={errors.address}
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
                required
                error={!!errors.birthDate}
                helperText={errors.birthDate}
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
              {/* <FormControl fullWidth>
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
            </FormControl> */}
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

export default EditUserModal;
