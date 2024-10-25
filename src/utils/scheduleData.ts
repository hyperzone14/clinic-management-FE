export const sampleScheduleData = {
    currentDoctor: "Dr.John Doe",
    appointments: [
      {
        patientName: "John F. Kennedy",
        patientImage: "/images/patient1.jpg", // You'll need to add actual image paths
        gender: "Male",
        appointmentType: "Appointment type: By doctor",
        status: "completed" as const
      },
      {
        patientName: "John F. Kennedy",
        patientImage: "/images/patient2.jpg",
        gender: "Male",
        appointmentType: "Appointment type: By doctor",
        status: "pending" as const
      },
      {
        patientName: "John F. Kennedy",
        patientImage: "/images/patient3.jpg",
        gender: "Male",
        appointmentType: "Appointment type: By doctor",
        status: "cancelled" as const
      },
      {
        patientName: "John F. Kennedy",
        patientImage: "/images/patient4.jpg",
        gender: "Male",
        appointmentType: "Appointment type: By doctor",
        status: "cancelled" as const
      }
    ]
  };