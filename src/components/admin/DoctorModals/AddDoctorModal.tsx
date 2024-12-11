import React, { useState } from "react";
import { useAppDispatch } from "../../../redux/store";
import { addDoctor } from "../../../redux/slices/doctorManageSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useSelector } from "react-redux";
// import { fetchDepartments } from "../../../redux/slices/departmentSlice";

interface AddModalProps {
  openAdd: boolean;
  handleClose: (success?: boolean) => void;
}

interface DoctorData {
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
  departmentId: string;
  workingDays: string[];
}

const AddDoctorModal: React.FC<AddModalProps> = ({ openAdd, handleClose }) => {
  const dispatch = useAppDispatch();
  // const department = useSelector(
  //   (state: RootState) => state.department.departments
  // );

  // React.useEffect(() => {
  //   if (openAdd) {
  //     dispatch(fetchDepartments());
  //   }
  // }, [openAdd, dispatch]);

  const initialDoctorState: DoctorData = {
    fullName: "",
    citizenId: "",
    email: "",
    password: "",
    gender: "",
    address: "",
    birthDate: "",
    departmentId: "",
    workingDays: [],
  };

  const [newDoctor, setNewDoctor] = useState<DoctorData>(initialDoctorState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DoctorData, string>>
  >({});

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DoctorData, string>> = {};

    if (!newDoctor.fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!newDoctor.citizenId) {
      newErrors.citizenId = "Citizen ID is required";
    }

    if (!newDoctor.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(newDoctor.email)) {
      newErrors.email = "Invalid email";
    }

    if (!newDoctor.password) {
      newErrors.password = "Password is required";
    }

    if (!newDoctor.address) {
      newErrors.address = "Address is required";
    }

    if (!newDoctor.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    if (!newDoctor.departmentId) {
      newErrors.departmentId = "Department is required";
    } else {
      const departmentId = Number(newDoctor.departmentId);
      if (isNaN(departmentId) || departmentId < 1 || departmentId > 11) {
        newErrors.departmentId = "Department ID must be between 1 and 11";
      }
    }

    if (newDoctor.workingDays.length === 0) {
      newErrors.workingDays = "Working days are required";
    }

    if (!/^\d{10}$/.test(newDoctor.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    if (!validateEmail(newDoctor.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userToAdd = {
      ...newDoctor,
      departmentId: Number(newDoctor.departmentId),
    };

    try {
      const resultAction = await dispatch(addDoctor(userToAdd));

      if (resultAction.meta.requestStatus === "rejected") {
        // const errorMessage = resultAction.payload
        //   ? (resultAction.payload as { message: string }).message
        //   : "An error occurred while saving the profile.";

        toast.error(
          "The email has already been registered, please change to another email"
        );
      }

      if (addDoctor.fulfilled.match(resultAction)) {
        resetForm();
        handleClose(true);
      } else {
        handleClose(false);
      }
    } catch {
      handleClose(false);
    }
  };

  const resetForm = () => {
    setNewDoctor(initialDoctorState);
    setErrors({});
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    resetForm();
    handleClose(false); // Pass false when modal is closed without saving
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;

    setNewDoctor((prev) => ({
      ...prev,
      birthDate: newDate,
    }));

    setErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  // Add an effect to reset form when modal is opened
  React.useEffect(() => {
    if (openAdd) {
      resetForm();
    }
  }, [openAdd]);

  const dayMapping: { [key: string]: string } = {
    MONDAY: "1",
    TUESDAY: "2",
    WEDNESDAY: "3",
    THURSDAY: "4",
    FRIDAY: "5",
  };

  const handleWorkingDaysChange = (e: SelectChangeEvent<unknown>) => {
    const selectedDays = e.target.value as string[];
    setNewDoctor((prev) => ({
      ...prev,
      workingDays: selectedDays,
    }));
  };

  return (
    <>
      <ToastContainer />
      <Dialog open={openAdd} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Name"
              name="fullName"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDoctor.fullName}
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
              value={newDoctor.citizenId}
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
              value={newDoctor.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              type="email"
              required
            />
            <TextField
              label="Password"
              name="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDoctor.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              type="password"
              required
            />
            <TextField
              select
              label="Gender"
              name="gender"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDoctor.gender}
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
              value={newDoctor.address}
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
              value={newDoctor.birthDate}
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
              label="Department"
              name="departmentId"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDoctor.departmentId}
              onChange={handleChange}
              error={!!errors.departmentId}
              helperText={errors.departmentId}
              required
              inputProps={{
                min: 0,
                max: 11,
              }}
            >
              {/* {department.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.name}
                </MenuItem>
              ))} */}
            </TextField>
            <TextField
              select
              required
              label="Working Days"
              name="workingDays"
              variant="outlined"
              fullWidth
              margin="normal"
              SelectProps={{
                multiple: true,
                value: newDoctor.workingDays,
                onChange: handleWorkingDaysChange,
              }}
              error={!!errors.workingDays}
              helperText={errors.workingDays}
            >
              {Object.entries(dayMapping).map(([day, value]) => (
                <MenuItem key={day} value={value}>
                  {day}
                </MenuItem>
              ))}
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddDoctorModal;
