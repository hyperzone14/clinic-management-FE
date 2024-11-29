// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   SelectChangeEvent,
//   FormHelperText,
// } from "@mui/material";
// import { useAppDispatch } from "../../../redux/store";
// import { updateDoctor } from "../../../redux/slices/doctorManageSlice";
// // import { useSelector } from "react-redux";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// interface doctorData {
//   id: number;
//   fullName: string;
//   citizenId: string;
//   email: string;
//   password: string;
//   gender: string;
//   address: string;
//   birthDate: string;
//   departmentId: string;
//   workingDays: string[];
// }

// interface EditModalProps {
//   openEdit: boolean;
//   handleClose: () => void;
//   doctor: doctorData;
// }

// const dayMapping: { [key: string]: string } = {
//   "1": "MONDAY",
//   "2": "TUESDAY",
//   "3": "WEDNESDAY",
//   "4": "THURSDAY",
//   "5": "FRIDAY",
// };

// const EditDoctorModal: React.FC<EditModalProps> = ({
//   openEdit,
//   handleClose,
//   doctor,
// }) => {
//   const dispatch = useAppDispatch();
//   const [formData, setFormData] = useState<doctorData>({
//     ...doctor,
//     departmentId: String(doctor.departmentId), // Ensure it's always a string
//   });
//   const [errors, setErrors] = useState<
//     Partial<Record<keyof doctorData, string>>
//   >({});

//   const handleChange = (
//     e:
//       | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//       | SelectChangeEvent<string | string[]>
//   ) => {
//     const { name, value } = e.target as {
//       name: string;
//       value: string | string[];
//     };

//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "departmentId" ? String(value) : value || null,
//     }));
//   };

//   const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     handleClose();
//   };

//   const validateEmail = (email: string): boolean => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<Record<keyof doctorData, string>> = {};

//     if (!formData.fullName) {
//       newErrors.fullName = "Full name is required";
//     }

//     if (!formData.citizenId) {
//       newErrors.citizenId = "Citizen ID is required";
//     }

//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!validateEmail(formData.email)) {
//       newErrors.email = "Invalid email";
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     }

//     if (!formData.address) {
//       newErrors.address = "Address is required";
//     }

//     if (!formData.birthDate) {
//       newErrors.birthDate = "Birth date is required";
//     }

//     if (!formData.departmentId) {
//       newErrors.departmentId = "Department is required";
//     } else {
//       const departmentId = Number(formData.departmentId);
//       if (isNaN(departmentId) || departmentId < 1 || departmentId > 11) {
//         newErrors.departmentId = "Department ID must be between 1 and 11";
//       }
//     }

//     if (formData.workingDays.length === 0) {
//       newErrors.workingDays = "Working days are required";
//     }

//     if (!/^\d{10}$/.test(formData.citizenId)) {
//       newErrors.citizenId = "Citizen ID must be exactly 10 digits";
//     }

//     if (!validateEmail(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       toast.error("Invalid input, please check again");
//     }

//     const updatedData = {
//       ...formData,
//       birthDate: formData.birthDate.split("/").reverse().join("-"),
//       departmentId: Number(formData.departmentId),
//     };

//     dispatch(updateDoctor(updatedData));
//     handleClose();
//   };

//   return (
//     <>
//       <ToastContainer />
//       <Dialog
//         open={openEdit}
//         onClose={(_e, reason: string) => {
//           if (reason !== "backdropClick") {
//             handleClose();
//           }
//         }}
//         maxWidth="sm"
//         fullWidth
//       >
//         <form onSubmit={handleSubmit}>
//           <DialogTitle>Edit Doctor</DialogTitle>
//           <DialogContent>
//             <div className="grid grid-cols-2 gap-4 mt-4">
//               <TextField
//                 name="fullName"
//                 type="text"
//                 label="Full Name"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//                 error={!!errors.fullName}
//                 helperText={errors.fullName}
//               />
//               <TextField
//                 name="email"
//                 type="email"
//                 label="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 fullWidth
//                 disabled
//               />
//               <TextField
//                 name="password"
//                 type="password"
//                 label="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//                 error={!!errors.password}
//                 helperText={errors.password}
//               />
//               <TextField
//                 name="citizenId"
//                 type="text"
//                 label="Citizen ID"
//                 value={formData.citizenId}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//                 error={!!errors.citizenId}
//                 helperText={errors.citizenId}
//               />
//               <FormControl fullWidth error={!!errors.gender}>
//                 <InputLabel>Gender</InputLabel>
//                 <Select
//                   name="gender"
//                   value={formData.gender}
//                   onChange={handleChange}
//                   label="Gender"
//                 >
//                   <MenuItem value="MALE">MALE</MenuItem>
//                   <MenuItem value="FEMALE">FEMALE</MenuItem>
//                   <MenuItem value="OTHER">OTHER</MenuItem>
//                 </Select>
//               </FormControl>
//               <TextField
//                 name="address"
//                 type="text"
//                 label="Address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//                 error={!!errors.address}
//                 helperText={errors.address}
//               />
//               <TextField
//                 label="Date of Birth"
//                 name="birthDate"
//                 variant="outlined"
//                 fullWidth
//                 value={formData.birthDate?.split("-").reverse().join("/")}
//                 onChange={handleChange}
//                 type="text"
//                 placeholder="DD/MM/YYYY"
//                 required
//                 error={!!errors.birthDate}
//                 helperText={errors.birthDate}
//               />
//               {/* <FormControl fullWidth error={!!errors.departmentId}>
//                 <InputLabel>DepartmentId</InputLabel>
//                 <TextField
//                   name="departmentId"
//                   value={formData.departmentId || ""}
//                   onChange={handleChange}
//                   label="Department Id"
//                   fullWidth
//                   type="text"
//                   inputProps={{
//                     min: 1,
//                     max: 11,
//                   }}
//                 ></TextField>
//               </FormControl> */}
//               <FormControl fullWidth error={!!errors.departmentId}>
//                 <InputLabel id="department-label">Department</InputLabel>
//                 <Select
//                   labelId="department-label"
//                   name="departmentId"
//                   value={formData.departmentId || ""}
//                   onChange={handleChange}
//                   label="Department"
//                 >
//                   <MenuItem value="">Select Department</MenuItem>
//                   <MenuItem value="1">1</MenuItem>
//                   <MenuItem value="2">2</MenuItem>
//                   <MenuItem value="3">3</MenuItem>
//                   <MenuItem value="4">4</MenuItem>
//                   <MenuItem value="5">5</MenuItem>
//                   <MenuItem value="6">6</MenuItem>
//                   <MenuItem value="7">7</MenuItem>
//                   <MenuItem value="8">8</MenuItem>
//                   <MenuItem value="9">9</MenuItem>
//                   <MenuItem value="10">10</MenuItem>
//                   <MenuItem value="11">11</MenuItem>
//                 </Select>
//                 {errors.departmentId && (
//                   <FormHelperText>{errors.departmentId}</FormHelperText>
//                 )}
//               </FormControl>
//               <FormControl fullWidth error={!!errors.workingDays}>
//                 <InputLabel>Working Days</InputLabel>
//                 <Select
//                   name="workingDays"
//                   multiple
//                   value={formData.workingDays}
//                   onChange={handleChange}
//                   renderValue={(selected) =>
//                     (selected as string[])
//                       .map((day) => dayMapping[day])
//                       .join(", ")
//                   }
//                   label="Working Days"
//                 >
//                   {Object.entries(dayMapping).map(([value, day]) => (
//                     <MenuItem key={value} value={value}>
//                       {day}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </div>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCancel}>Cancel</Button>
//             <Button type="submit" variant="contained" color="primary">
//               Save Changes
//             </Button>
//           </DialogActions>
//         </form>
//       </Dialog>
//     </>
//   );
// };

// export default EditDoctorModal;

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
import { updateDoctor } from "../../../redux/slices/doctorManageSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DoctorData {
  id: number;
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

interface EditModalProps {
  openEdit: boolean;
  handleClose: () => void;
  doctor: DoctorData;
}

const dayMapping: { [key: string]: string } = {
  MONDAY: "1",
  TUESDAY: "2",
  WEDNESDAY: "3",
  THURSDAY: "4",
  FRIDAY: "5",
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  // If the date is already in DD/MM/YYYY format, return it
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateForSubmission = (dateString: string): string => {
  if (!dateString) return "";

  // If the date is already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

  // Convert DD/MM/YYYY to YYYY-MM-DD
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};

const EditDoctorModal: React.FC<EditModalProps> = ({
  openEdit,
  handleClose,
  doctor,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<DoctorData>({
    ...doctor,
    departmentId: String(doctor.departmentId),
    birthDate: formatDateForDisplay(doctor.birthDate),
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof DoctorData, string>>
  >({});

  // Ensure the birthDate is properly formatted when the doctor prop changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      departmentId: String(doctor.departmentId),
      birthDate: formatDateForDisplay(doctor.birthDate),
    }));
  }, [doctor]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | string[]>
  ) => {
    const { name, value } = e.target as {
      name: string;
      value: string | string[];
    };

    // Special handling for birthDate to ensure consistent formatting
    const processedValue =
      name === "birthDate" ? formatDateForDisplay(value as string) : value;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "departmentId" || name === "workingDays"
          ? Array.isArray(value)
            ? value.map(String)
            : String(value)
          : processedValue || null,
    }));
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
    const newErrors: Partial<Record<keyof DoctorData, string>> = {};

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

    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
    } else {
      const departmentId = Number(formData.departmentId);
      if (isNaN(departmentId) || departmentId < 1 || departmentId > 11) {
        newErrors.departmentId = "Department ID must be between 1 and 11";
      }
    }

    if (formData.workingDays.length === 0) {
      newErrors.workingDays = "Working days are required";
    }

    if (!/^\d{10}$/.test(formData.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Invalid input, please check again");
      return;
    }

    const updatedData = {
      ...formData,
      birthDate: formatDateForSubmission(formData.birthDate),
      departmentId: Number(formData.departmentId),
    };

    dispatch(updateDoctor(updatedData));
    handleClose();
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
          <DialogTitle>Edit Doctor</DialogTitle>
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
                value={formData.birthDate}
                onChange={handleChange}
                type="text"
                placeholder="DD/MM/YYYY"
                required
                error={!!errors.birthDate}
                helperText={errors.birthDate}
              />
              <TextField
                name="departmentId"
                label="Department"
                variant="outlined"
                fullWidth
                value={formData.departmentId}
                onChange={handleChange}
                required
                error={!!errors.departmentId}
                helperText={errors.departmentId}
                inputProps={{
                  min: 0,
                  max: 11,
                }}
              />
              <TextField
                select
                required
                label="Working Days"
                name="workingDays"
                variant="outlined"
                fullWidth
                SelectProps={{
                  multiple: true,
                  value: formData.workingDays,
                  onChange: handleChange,
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

export default EditDoctorModal;
