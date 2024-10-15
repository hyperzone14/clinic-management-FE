export interface Routes {
  id: number;
  path: string;
  location: string;
};

export const pageRoutes: Routes[] = [
  {
    id: 1,
    path: "/",
    location: "Home"
  },
  {
    id: 2,
    path: "/feedback",
    location: "Feedback"
  },
  {
    id: 3,
    path: "/search",
    location: "Search"
  },
  {
    id: 4,
    path: "/schedule",
    location: "Schedule"
  },
  {
    id: 5,
    path: "/booking",
    location: "Booking"
  },

]

export const bookingRoutes: Routes[] = [
  {
    id: 1,
    path: "service", // relative path
    location: "Service"
  },
  {
    id: 2,
    path: "choosedatetime",
    location: "ChooseDateTime"
  },
  {
    id: 3,
    path: "bookinfo",
    location: "BookInfo"
  },
  {
    id: 4,
    path: "payment",
    location: "Payment"
  },
  {
    id: 5,
    path: "finish",
    location: "Finish"
  }
];
