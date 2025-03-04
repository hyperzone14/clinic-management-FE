import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchDoctorAppointments,
  updateAppointmentStatus,
  StatusType,
  Appointment,
} from "../redux/slices/scheduleSlice";
import AppointmentCard from "../components/common/AppointmentCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthService } from "../utils/security/services/AuthService";

const PreExamination: React.FC = () => {
  // ... existing code ...
};

export default PreExamination; 