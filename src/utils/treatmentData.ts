// src/utils/treatmentData.ts

import { Medicine } from '../redux/slices/treatmentSlice';

export interface Symptom {
  id: string;
  label: string;
  medicines: Medicine[];
}

export const symptoms: Symptom[] = [
  {
    id: "1",
    label: "Headache",
    medicines: [
      {
        id: "m1",
        name: "Paracetamol 250mg",
        quantity: 14,
        note: "1 pill/morning",
        price: 100
      },
      {
        id: "m2",
        name: "Ibuprofen 400mg",
        quantity: 14,
        note: "1 pill/evening",
        price: 120
      }
    ]
  },
  {
    id: "2",
    label: "Fever",
    medicines: [
      {
        id: "m3",
        name: "Paracetamol 500mg",
        quantity: 14,
        note: "1 pill/morning after meal",
        price: 150
      }
    ]
  },
  {
    id: "3",
    label: "Cough",
    medicines: [
      {
        id: "m4",
        name: "Bromhexine 8mg",
        quantity: 14,
        note: "1 pill/morning-evening",
        price: 80
      },
      {
        id: "m5",
        name: "Dextromethorphan 15mg",
        quantity: 14,
        note: "1 pill/evening before sleep",
        price: 90
      }
    ]
  },
  {
    id: "4",
    label: "Sore Throat",
    medicines: [
      {
        id: "m6",
        name: "Strepsils Lozenges",
        quantity: 20,
        note: "1 lozenge every 4 hours",
        price: 60
      }
    ]
  }
];