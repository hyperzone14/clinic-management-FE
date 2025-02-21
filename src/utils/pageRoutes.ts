import { AuthService } from "./security/services/AuthService";

export interface Routes {
  id: number;
  path: string;
  location: string;
  children?: Routes[];
  roles?: string[];
}

export const getHeaderRoutes = (role: string): Routes[] => {
  // First check if user is authenticated
  if (!AuthService.isAuthenticated()) {
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/booking", location: "Booking" },
    ];
  }
  if (role === "ROLE_PATIENT") {
    // /, /booking
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/booking", location: "Booking" },
      { id: 3, path: "/doctors", location: "Doctors" },
      { id: 4, path: "/feedback", location: "Feedback" },
    ];
  } else if (role === "ROLE_DOCTOR") {
    // /, /schedule, /examination
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/schedule", location: "Schedule" },
      { id: 3, path: "/examination", location: "Examination" },
      // { id: 4, path: "/booking-bill", location: "BookingBill" },
    ];
  } else {
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/booking", location: "Booking" },
    ];
  }
};

export const pageRoutes: Routes[] = [
  {
    id: 1,
    path: "/",
    location: "Home",
  },
  // {
  //   id: 2,
  //   path: "/feedback",
  //   location: "Feedback",
  // },
  {
    id: 2,
    path: "/booking",
    location: "Booking",
    roles: ["ROLE_PATIENT"],
  },
  {
    id: 3,
    path: "/schedule",
    location: "Schedule",
    roles: ["ROLE_DOCTOR"],
    children: [
      {
        id: 31,
        path: "medical-service",
        location: "MedicalService",
      },
    ],
  },
  {
    id: 4,
    path: "/profile",
    location: "Profile",
  },
  // {
  //   id: 7,
  //   path: "/prescription",
  //   location: "Prescription",
  // },
  // {
  //   id: 8,
  //   path: "/roll-call",
  //   location: "Rollcall",
  // },
  {
    id: 5,
    path: "/medical-history",
    location: "MedicHistory",
    roles: ["ROLE_PATIENT, ROLE_DOCTOR"],
    children: [
      {
        id: 51,
        path: "/medical-detail",
        location: "MedicDetail",
      },
    ],
  },
  {
    id: 6,
    path: "/admin",
    location: "Admin",
    roles: ["ROLE_ADMIN, ROLE_CLIENT_OWNER"],
  },
  {
    id: 7,
    path: "/booking-bill",
    location: "BookingBill",
    roles: ["ROLE_PATIENT, ROLE_DOCTOR"],
    children: [
      {
        id: 71,
        path: "/booking-detail",
        location: "BookingDetail",
      },
    ],
  },
  // {
  //   id: 12,
  //   path: "/treatment-history",
  //   location: "TreatmentHistory",
  //   children: [
  //     {
  //       id: 121,
  //       path: "/medical-detail",
  //       location: "MedicDetail",
  //     },
  //   ],
  // },
  {
    id: 8,
    path: "/manual-checkin",
    location: "ManualCheckin",
    roles: ["ROLE_DOCTOR"],
  },
  {
    id: 9,
    path: "/payment-success",
    location: "PaymentSuccess",
    roles: ["ROLE_PATIENT"],
  },
  {
    id: 10,
    path: "/examination",
    location: "Examination",
    roles: ["ROLE_DOCTOR"],
    children: [
      {
        id: 257,
        path: "/appointmentId",
        location: "ExaminationDetail",
      },
    ],
  },
  {
    id: 11,
    path: "/medical-bill-final",
    location: "MedicalBillFinal",
    roles: ["ROLE_DOCTOR"],
  },
  {
    id: 12,
    path: "/user-information",
    location: "UserInfo",
  },
  {
    id: 13,
    path: "/doctors",
    location: "Doctors",
    children: [
      {
        id: 131,
        path: "/doctor-detail",
        location: "DoctorDetail",
      },
    ],
  },
  {
    id: 14,
    path: "/feedback",
    location: "Feedback",
  },
];

export const bookingRoutes: Routes[] = [
  {
    id: 1,
    path: "service", // relative path
    location: "Service",
  },
  {
    id: 2,
    path: "choose-datetime",
    location: "ChooseDateTime",
  },
  {
    id: 3,
    path: "payment",
    location: "Payment",
  },
  {
    id: 4,
    path: "finish",
    location: "Finish",
  },
];

export const prescriptionRoutes: Routes[] = [
  {
    id: 1,
    path: "prescription-list",
    location: "PrescriptionList",
  },
  {
    id: 2,
    path: "create-prescribe",
    location: "CreatePrescribe",
  },
];

export const adminRoutes: Routes[] = [
  {
    id: 1,
    path: "",
    location: "Dashboard",
    roles: ["ROLE_ADMIN, ROLE_CLIENT_OWNER"],
    // roles: ["ROLE_DOCTOR"],
  },
  {
    id: 2,
    path: "patient",
    location: "PatientManagement",
    // roles: ["ROLE_DOCTOR"],
    roles: ["ROLE_CLIENT_OWNER"],
  },
  {
    id: 3,
    path: "drug",
    location: "DrugManagement",
    roles: ["ROLE_CLIENT_OWNER"],
  },
  {
    id: 4,
    path: "doctor",
    location: "DoctorManagement",
    roles: ["ROLE_CLIENT_OWNER"],
  },
  {
    id: 5,
    path: "appointment",
    location: "AppointmentManagement",
    roles: ["ROLE_CLIENT_OWNER"],
  },
];
