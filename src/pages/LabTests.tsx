import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/axios-config';
import { toast, ToastContainer } from 'react-toastify';
import { Beaker } from 'lucide-react';

interface LabTest {
  id: number;
  patientName: string;
  examinationType: string;
  labDepartment: string;
  date: string;
}

const LabTests: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [examinationTypes, setExaminationTypes] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedExaminationType, setSelectedExaminationType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiService.get<string[]>('/lab_department');
        setDepartments(response);
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
        setExaminationTypes(response);
        setSelectedExaminationType(''); // Reset selected examination type
      } catch (error) {
        console.error('Failed to fetch examination types:', error);
        toast.error('Failed to load examination types');
      }
    };

    fetchExaminationTypes();
  }, [selectedDepartment]);

  // Fetch lab tests based on filters
  useEffect(() => {
    const fetchLabTests = async () => {
      if (!selectedDepartment && !selectedExaminationType) return;

      setLoading(true);
      try {
        let response;
        if (selectedExaminationType) {
          response = await apiService.get<LabTest[]>(`/examination_detail/by_examination_type?examinationType=${selectedExaminationType}`);
        } else if (selectedDepartment) {
          response = await apiService.get<LabTest[]>(`/examination_detail/by_department?labDepartment=${selectedDepartment}`);
        }
        
        if (response) {
          setLabTests(response);
        }
      } catch (error) {
        console.error('Failed to fetch lab tests:', error);
        toast.error('Failed to load lab tests');
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
  }, [selectedDepartment, selectedExaminationType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <ToastContainer />
      
      <div className="pt-16 pb-10">
        <h1 className="text-4xl font-bold font-sans text-center text-gray-800">
          LAB TESTS
        </h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examination Type
              </label>
              <select
                value={selectedExaminationType}
                onChange={(e) => setSelectedExaminationType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedDepartment}
              >
                <option value="">Select Examination Type</option>
                {examinationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lab Tests Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Beaker className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 ml-3">
                    {test.patientName}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Examination Type</p>
                    <p className="text-base text-gray-900">{test.examinationType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-base text-gray-900">{test.labDepartment}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-base text-gray-900">{formatDate(test.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!loading && labTests.length === 0 && (selectedDepartment || selectedExaminationType) && (
          <div className="text-center py-12">
            <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No lab tests found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTests; 