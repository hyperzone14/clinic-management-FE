import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/axios-config';
import { toast, ToastContainer } from 'react-toastify';
import { DollarSign } from 'lucide-react';
import { IoPersonOutline } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { BsCurrencyDollar } from "react-icons/bs";
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';

interface MedicalBill {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  date: string;
  labPrice: number;
  totalUnpaidAmount: number;
  status: string;
}

interface ApiResponse {
  content: MedicalBill[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const LabTestPayment: React.FC = () => {
  const [medicalBills, setMedicalBills] = useState<MedicalBill[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Check for payment success state
  useEffect(() => {
    const state = location.state as { paymentSuccess?: boolean };
    if (state?.paymentSuccess) {
      scrollToTop();
      toast.success("Payment successful!");
    }
  }, [location]);

  // Fetch medical bills
  useEffect(() => {
    const fetchMedicalBills = async () => {
      setLoading(true);
      try {
        const endpoint = `/medical-bills/by-date-and-unpaid?date=${today}`;
        
        const response = await apiService.get<ApiResponse>(endpoint);
        
        if (response && response.content) {
          // Set default status for all bills
          const billsWithStatus = response.content.map(bill => ({
            ...bill,
            status: 'Unpaid'
          }));
          
          setMedicalBills(billsWithStatus);
        } else {
          setMedicalBills([]);
        }
      } catch (error) {
        console.error('Failed to fetch medical bills:', error);
        toast.error('Unable to load medical bills');
        setMedicalBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalBills();
  }, [today]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const handleCardClick = (billId: number) => {
    navigate(`/lab-test-payment/${billId}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] pb-20">
      <ToastContainer />
      
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5 text-[#000000]">UNPAID LAB TEST BILLS</h1>
      </div>

      <div className="my-8 flex flex-col items-center">
        {/* Medical Bills List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#34a85a]"></div>
          </div>
        ) : (
          <div className="w-9/12 space-y-4 max-h-[70vh] pr-4 overflow-y-auto">
            {medicalBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white w-full rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer items-center p-4 hover:border-l-4 hover:border-[#34a85a]"
                onClick={() => handleCardClick(bill.id)}
              >
                <div className="ms-5 mt-3 flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <IoPersonOutline className="w-12 h-12 text-[#34a85a]" />
                    <h1 className="font-bold text-3xl ms-3 text-[#000000]">
                      {bill.patientName}
                    </h1>
                  </div>
                  <div className="flex flex-col items-end me-5">
                    <div className="flex my-2 items-center">
                      <p className="me-3 text-xl text-[#000000]">{bill.doctorName}</p>
                      <FaUserDoctor className="w-8 h-8 text-[#87ceeb]" />
                    </div>
                    <div className="flex my-2 items-center">
                      <p className="me-3 text-xl text-[#000000]">{formatDate(bill.date)}</p>
                      <FaRegCalendarAlt className="w-8 h-8 text-[#87ceeb]" />
                    </div>
                    <div className="flex my-2 items-center">
                      <p className="me-3 text-xl font-semibold text-[#34a85a]">
                        {formatCurrency(bill.totalUnpaidAmount)}
                      </p>
                      <BsCurrencyDollar className="w-8 h-8 text-[#34a85a]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!loading && (!medicalBills || medicalBills.length === 0) && (
          <div className="w-9/12 text-center py-12 bg-white rounded-lg">
            <DollarSign className="w-12 h-12 text-[#87ceeb] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#000000]">No bills found</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are no unpaid bills for today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTestPayment; 