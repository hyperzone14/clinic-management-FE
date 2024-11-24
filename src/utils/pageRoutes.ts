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
      { id: 2, path: "/medical-history", location: "MedicHistory" },
      { id: 3, path: "/feedback", location: "Feedback" },
    ];
  }
  if (role === "ROLE_PATIENT") {
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/booking", location: "Booking" },
      { id: 3, path: "/medical-history", location: "MedicHistory" },
      { id: 4, path: "/booking-bill", location: "BookingBill" },
    ];
  } else if (role === "ROLE_DOCTOR") {
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/schedule", location: "Schedule" },
      { id: 3, path: "/examination", location: "Examination" },
      // { id: 4, path: "/booking-bill", location: "BookingBill" },
    ];
  } else {
    return [
      { id: 1, path: "/", location: "Home" },
      { id: 2, path: "/medical-history", location: "MedicHistory" },
      { id: 3, path: "/feedback", location: "Feedback" },
    ];
  }
};

export const pageRoutes: Routes[] = [
  {
    id: 1,
    path: "/",
    location: "Home",
  },
  {
    id: 2,
    path: "/feedback",
    location: "Feedback",
  },
  {
    id: 3,
    path: "/search",
    location: "Search",
  },
  {
    id: 4,
    path: "/booking",
    location: "Booking",
  },
  {
    id: 5,
    path: "/schedule",
    location: "Schedule",
    roles: ["ROLE_DOCTOR"],
    children: [
      {
        id: 51,
        path: "medical-service",
        location: "MedicalService",
      },
    ],
  },
  {
    id: 6,
    path: "/profile",
    location: "Profile",
  },
  {
    id: 7,
    path: "/prescription",
    location: "Prescription",
  },
  {
    id: 8,
    path: "/roll-call",
    location: "Rollcall",
  },
  {
    id: 9,
    path: "/medical-history",
    location: "MedicHistory",
    roles: ["ROLE_PATIENT, ROLE_DOCTOR"],
    children: [
      {
        id: 91,
        path: "/medical-detail",
        location: "MedicDetail",
      },
    ],
  },
  {
    id: 10,
    path: "/admin",
    location: "Admin",
    roles: ["ROLE_PATIENT"],
  },
  {
    id: 11,
    path: "/booking-bill",
    location: "BookingBill",
    children: [
      {
        id: 111,
        path: "/booking-detail",
        location: "BookingDetail",
      },
    ],
  },
  {
    id: 12,
    path: "/treatment-history",
    location: "TreatmentHistory",
    children: [
      {
        id: 121,
        path: "/medical-detail",
        location: "MedicDetail",
      },
    ],
  },
  {
    id: 13,
    path: "/manual-checkin",
    location: "ManualCheckin",
  },
  {
    id: 14,
    path: "/payment-callback",
    location: "PaymentCallBack",
  },
  {
    id: 16,
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
    id: 17,
    path: "/medical-bill-final",
    location: "MedicalBillFinal",
    roles: ["ROLE_DOCTOR"],
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
  {
    id: 5,
    path: "payment-callback",
    location: "PaymentCallBack",
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
  },
  {
    id: 2,
    path: "patient-management",
    location: "PatientManagement",
  },
  {
    id: 3,
    path: "drug-management",
    location: "DrugManagement",
  },
];
