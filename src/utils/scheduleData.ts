export const sampleScheduleData = {
  currentDoctor: "Dr.John Doe",
  appointments: [
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150", // Using placeholder since image paths aren't available
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "completed" as const
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "pending" as const
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "check-in" as const  // Added new status
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "confirm" as const  // Added new status
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "cancelled" as const
    }
  ]
};