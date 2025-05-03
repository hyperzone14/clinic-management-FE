import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/axios-config';
import { toast, ToastContainer } from 'react-toastify';
import { Beaker, Filter, X } from 'lucide-react';
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

interface LabTest {
  id: number;
  patientName: string;
  doctorName: string;
  examinationType: string;
  labDepartment: string;
  date: string;
  status: string;
  examinationResult: string | null;
  imageResponseDTO: any[];
}

interface ApiResponse {
  content: LabTest[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const LabTests: React.FC = () => {
  const navigate = useNavigate();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [examinationTypes, setExaminationTypes] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedExaminationType, setSelectedExaminationType] = useState<string>('');
  const [appliedDepartment, setAppliedDepartment] = useState<string>('');
  const [appliedExaminationType, setAppliedExaminationType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiService.get<string[]>('/lab_department');
        setDepartments(response || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast.error('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  // Fetch examination types when department changes
  useEffect(() => {
    const fetchExaminationTypes = async () => {
      if (!selectedDepartment) {
        setExaminationTypes([]);
        return;
      }

      try {
        const response = await apiService.get<string[]>(`/lab_department/lab_tests?labDepartment=${selectedDepartment}`);
        setExaminationTypes(response || []);
        setSelectedExaminationType(''); // Reset selected examination type
      } catch (error) {
        console.error('Failed to fetch examination types:', error);
        toast.error('Failed to load examination types');
      }
    };

    fetchExaminationTypes();
  }, [selectedDepartment]);

  // Fetch lab tests based on applied filters
  useEffect(() => {
    const fetchLabTests = async () => {
      setLoading(true);
      try {
        let response;
        if (appliedExaminationType) {
          response = await apiService.get<ApiResponse>(`/lab_department/by_lab_type_and_created_at?labTest=${appliedExaminationType}&createdAt=${selectedDate}`);
        } else if (appliedDepartment) {
          response = await apiService.get<ApiResponse>(`/lab_department/by_department_and_created_at?labDepartment=${appliedDepartment}&createdAt=${selectedDate}`);
        } else {
          response = await apiService.get<ApiResponse>('/examination_detail/all_undone');
        }
        
        if (response && response.content) {
          setLabTests(response.content);
        } else {
          setLabTests([]);
        }
      } catch (error) {
        console.error('Failed to fetch lab tests:', error);
        toast.error('Failed to load lab tests');
        setLabTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
  }, [appliedDepartment, appliedExaminationType, selectedDate]);

  const handleApplyFilter = () => {
    setAppliedDepartment(selectedDepartment);
    setAppliedExaminationType(selectedExaminationType);
  };

  const handleDiscardFilter = () => {
    setSelectedDepartment('');
    setSelectedExaminationType('');
    setAppliedDepartment('');
    setAppliedExaminationType('');
    setExaminationTypes([]);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  const handleCardClick = (id: number) => {
    navigate(`/lab-tests/${id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <ToastContainer />
      
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">LAB TESTS</h1>
      </div>

      <div className="my-12 flex flex-col items-center">
        {/* Filters Section */}
        <div className="w-9/12 bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Department</label>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <IoSearchOutline className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Examination Type</label>
              <div className="relative">
                <select
                  value={selectedExaminationType}
                  onChange={(e) => setSelectedExaminationType(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={!selectedDepartment}
                >
                  <option value="">All Types</option>
                  {examinationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <IoSearchOutline className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply 
              </button>
              <button
                onClick={handleDiscardFilter}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-300 flex items-center justify-center"
                title="Clear filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Applied Filters */}
        {(appliedDepartment || appliedExaminationType) && (
          <div className="w-9/12 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800 font-medium">Active Filters</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {appliedDepartment && (
                <span className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm font-medium inline-flex items-center">
                  Department: {appliedDepartment}
                </span>
              )}
              {appliedExaminationType && (
                <span className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm font-medium inline-flex items-center">
                  Type: {appliedExaminationType}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lab Tests Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="w-9/12 grid grid-cols-1 gap-4">
            {Array.isArray(labTests) && labTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCardClick(test.id)}
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Patient Name</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Beaker className="w-5 h-5 text-blue-500" />
                      <p className="text-base font-medium text-gray-900">{test.patientName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{test.labDepartment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Examination Type</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{test.examinationType}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{test.doctorName}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'PAID' 
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-orange-50 text-orange-500 border border-orange-200'
                    }`}>
                      {test.status === 'PAID' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!loading && (!labTests || labTests.length === 0) && (
          <div className="w-9/12 text-center py-12 bg-white rounded-lg">
            <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No lab tests found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {appliedDepartment || appliedExaminationType 
                ? "Try adjusting your filters to find what you're looking for."
                : "There are no pending lab tests at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTests; 