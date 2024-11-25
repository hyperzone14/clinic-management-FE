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
import { RootState, useAppDispatch } from "../../../redux/store";
import { updateDoctor } from "../../../redux/slices/doctorManageSlice";
import { useSelector } from "react-redux";
import { fetchDepartments } from "../../../redux/slices/departmentSlice";

interface Data {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  departmentId: number;
  workingDays: string[];
}

interface EditModalProps {
  openEdit: boolean;
  handleClose: () => void;
  doctor: Data;
}

const dayMapping: { [key: string]: string } = {
  "1": "MONDAY",
  "2": "TUESDAY",
  "3": "WEDNESDAY",
  "4": "THURSDAY",
  "5": "FRIDAY",
};

const EditDoctorModal: React.FC<EditModalProps> = ({
  openEdit,
  handleClose,
  doctor,
}) => {
  const dispatch = useAppDispatch();
  const departments = useSelector(
    (state: RootState) => state.department.departments
  );
  const [formData, setFormData] = useState<Data>(doctor);

  useEffect(() => {
    // Ensure departmentId is a valid option when the doctor prop changes
    const validDepartmentId = departments.some(
      (dep) => dep.id === doctor.departmentId
    )
      ? doctor.departmentId
      : departments[0]?.id || 0;

    setFormData({
      ...doctor,
      departmentId: validDepartmentId,
    });
  }, [doctor, departments]);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | string[]>
  ) => {
    const { name, value } = e.target as {
      name: string;
      value: string | string[];
    };
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      birthDate: formData.birthDate.split("/").reverse().join("-"),
    };

    dispatch(updateDoctor(updatedData));
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
        <DialogTitle>Edit Doctor</DialogTitle>
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
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                name="departmentId"
                value={formData.departmentId.toString()}
                onChange={handleChange}
                label="Department"
              >
                {departments.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Working Days</InputLabel>
              <Select
                name="workingDays"
                multiple
                value={formData.workingDays}
                onChange={handleChange}
                renderValue={(selected) =>
                  (selected as string[])
                    .map((day) => dayMapping[day])
                    .join(", ")
                }
                label="Working Days"
              >
                {Object.entries(dayMapping).map(([value, day]) => (
                  <MenuItem key={value} value={value}>
                    {day}
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

export default EditDoctorModal;
