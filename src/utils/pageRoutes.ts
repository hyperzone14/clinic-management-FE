export interface Routes {
  id: number;
  path: string;
  location: string;
}

export const headerRoutes: Routes[] = [
  {
    id: 1,
    path: "/",
    location: "Home",
  },
  {
    id: 2,
    path: "/booking",
    location: "Booking",
  },
  {
    id: 3,
    path: "/dashboard",
    location: "Dashboard",
  },
  {
    id: 4,
    path: "/prescription",
    location: "Prescription",
  },
];

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
    path: "/dashboard",
    location: "Dashboard",
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
];

export const dashboardRoutes: Routes[] = [
  {
    id: 1,
    path: "schedule",
    location: "Schedule",
  },
  {
    id: 2,
    path: "medical-service",
    location: "MedicalService",
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
    path: "bookinfo",
    location: "BookInfo",
  },
  {
    id: 4,
    path: "payment",
    location: "Payment",
  },
  {
    id: 5,
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
