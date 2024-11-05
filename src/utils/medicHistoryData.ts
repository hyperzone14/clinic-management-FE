// utils/medicHistoryData.ts
import { MedicalRecord } from '../redux/slices/medicHistorySlide';

export const medicalHistoryData: MedicalRecord[] = [
  {
    id: '1',
    patientInfo: {
      name: 'John Smith',
      dateOfBirth: '1990-01-15',
      gender: 'Male'
    },
    symptoms: 'Headache and fever',
    doctorName: 'Dr. JFK',
    date: '2024-09-11',
    image: '/images/acupuncture.jpg',
    treatment_medicine: [
      {
        medicine_name: 'Paracetamol 500mg',
        quantity: 14,
        note: '1 pill morning and evening',
        price: 100
      },
      {
        medicine_name: 'Vitamin C',
        quantity: 14,
        note: '1 pill after meal',
        price: 100
      }
    ],
    examination: {
      lab_test: 'Blood Test',
      test_result: 'Normal'
    },
    doctor_feedback: 'Patient should rest and drink plenty of water'
  },
  {
    id: '2',
    patientInfo: {
      name: 'Emily Johnson',
      dateOfBirth: '1985-03-22',
      gender: 'Female'
    },
    symptoms: 'Sore throat and cough',
    doctorName: 'Dr. Smith',
    date: '2024-09-15',
    image: '/images/acupuncture.jpg',
    treatment_medicine: [
      {
        medicine_name: 'Strepsils',
        quantity: 10,
        note: 'Dissolve in mouth every 4 hours',
        price: 150
      }
    ],
    examination: {
      lab_test: 'Throat Swab',
      test_result: 'Negative for strep'
    },
    doctor_feedback: 'Gargle with warm salt water'
  },
  {
    id: '3',
    patientInfo: {
      name: 'Michael Brown',
      dateOfBirth: '1978-11-30',
      gender: 'Male'
    },
    symptoms: 'Back pain',
    doctorName: 'Dr. Johnson',
    date: '2024-09-20',
    image: '/images/acupuncture.jpg',
    treatment_medicine: [
      {
        medicine_name: 'Ibuprofen 400mg',
        quantity: 10,
        note: 'Take after meals',
        price: 120
      }
    ],
    examination: {
      lab_test: 'X-Ray',
      test_result: 'Mild muscle strain'
    },
    doctor_feedback: 'Apply heat therapy and avoid heavy lifting'
  },
  {
    id: '4',
    patientInfo: {
      name: 'Sarah Wilson',
      dateOfBirth: '1995-07-08',
      gender: 'Female'
    },
    symptoms: 'Allergic reaction',
    doctorName: 'Dr. JFK',
    date: '2024-09-25',
    image: '/images/acupuncture.jpg',
    treatment_medicine: [
      {
        medicine_name: 'Antihistamine',
        quantity: 7,
        note: 'Take one daily',
        price: 90
      }
    ],
    examination: {
      lab_test: 'Allergy Test',
      test_result: 'Positive for pollen'
    },
    doctor_feedback: 'Avoid outdoor activities during high pollen count'
  }
];

export const doctorsList = [...new Set(medicalHistoryData.map(record => record.doctorName))];