export interface Medicine {
    id: string;
    name: string;
    quantity: number;
    note: string;
    price: number;
  }
  
  export interface PrescribeDrug {
    id: string;
    title: string;
    symptoms: string;
    syndrome: string;
    medicines: Medicine[];
    totalPrice: number;
  }
  
  export const mockPrescribeDrugs: PrescribeDrug[] = [
    {
      id: '1',
      title: 'Cough',
      symptoms: 'Chronic cough, throat clearing, runny nose',
      syndrome: 'Chronic cough, throat clearing, runny nose, congestion, and sore throat',
      medicines: [
        {
          id: '1',
          name: 'Carbocisterin 750mg',
          quantity: 14,
          note: '1 pill/morning\n1 pill/evening\nafter meal',
          price: 100
        },
        {
          id: '2',
          name: 'Amoxicilin + Acid Clavulanic',
          quantity: 14,
          note: '1 pill/morning\nbefore meal',
          price: 100
        }
      ],
      totalPrice: 200
    },
    {
      id: '2',
      title: 'Fever',
      symptoms: 'High temperature, headache, body aches',
      syndrome: 'Acute febrile illness with associated symptoms of viral infection',
      medicines: [
        {
          id: '3',
          name: 'Paracetamol 500mg',
          quantity: 10,
          note: '1 pill every 6 hours\nafter meal',
          price: 50
        }
      ],
      totalPrice: 50
    }
  ];
  
  // Utility functions for prescribe drug management
  export const calculateTotalPrice = (medicines: Medicine[]): number => {
    return medicines.reduce((sum, medicine) => sum + medicine.price, 0);
  };
  
  export const generateMedicineId = (): string => {
    return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const generatePrescriptionId = (): string => {
    return `presc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const createEmptyMedicine = (): Medicine => {
    return {
      id: generateMedicineId(),
      name: '',
      quantity: 0,
      note: '',
      price: 0
    };
  };
  
  export const createEmptyPrescription = (): PrescribeDrug => {
    return {
      id: generatePrescriptionId(),
      title: '',
      symptoms: '',
      syndrome: '',
      medicines: [],
      totalPrice: 0
    };
  };