import React, { useEffect, useState } from 'react';
import { apiService } from '../../utils/axios-config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import { TextField, Autocomplete } from '@mui/material';
import { Plus, X } from 'lucide-react';

interface Drug {
  id: number;
  name: string;
  unit: string;
  price: number;
}

interface PrescribedDrug {
  id?: number;
  drugId?: number;
  drugName: string;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

interface Symptom {
  id: number;
  name: string;
  description: string;
  prescribedDrugs: PrescribedDrug[];
  status?: string | null;
}

interface ApiResponse {
  code: number;
  message: string;
  result: Symptom[];
}

type TableData = {
  id: number;
  name: string;
  description: string;
  status: string;
};

const transformSymptom = (symptom: Symptom): TableData => ({
  id: symptom.id,
  name: symptom.name,
  description: symptom.description,
  status: symptom.status || '-',
});

const PreMedicalBillManagement: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
    prescribedDrugs: PrescribedDrug[];
  }>({
    name: '',
    description: '',
    prescribedDrugs: [],
  });
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchDrug, setSearchDrug] = useState<string>('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [addFormData, setAddFormData] = useState<{
    name: string;
    description: string;
    prescribedDrugs: PrescribedDrug[];
  }>({
    name: '',
    description: '',
    prescribedDrugs: [],
  });

  const columns: Column<TableData>[] = [
    {
      id: 'id',
      label: 'ID',
      render: (symptom) => symptom.id,
    },
    {
      id: 'name',
      label: 'Name',
      render: (symptom) => symptom.name,
    },
    {
      id: 'description',
      label: 'Description',
      render: (symptom) => symptom.description,
    },
    {
      id: 'status',
      label: 'Status',
      render: (symptom) => symptom.status,
    },
  ];

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse>('/symptom');
      if (response.code === 200 && Array.isArray(response.result)) {
        setSymptoms(response.result);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch symptoms:', error);
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Failed to load symptoms. Please try again later.');
      }
      setSymptoms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrugs = async () => {
    try {
      const response = await apiService.get<{code: number, result: Drug[]}>('/drug');
      if (response.code === 200) {
        setDrugs(response.result);
      }
    } catch (error: any) {
      console.error('Failed to fetch drugs:', error);
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        toast.error('Failed to fetch drugs. Please try again later.');
      }
    }
  };

  useEffect(() => {
    fetchSymptoms();
    fetchDrugs();
  }, []);

  useEffect(() => {
    const filterSymptoms = () => {
      const filterTerm = search?.toLowerCase() || '';
      const filtered = Array.isArray(symptoms)
        ? symptoms
            .filter((item): item is Symptom => {
              if (!item) return false;
              return item.name.toLowerCase().includes(filterTerm);
            })
            .map(transformSymptom)
        : [];

      setFilteredData(filtered);
    };
    filterSymptoms();
  }, [search, symptoms]);

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setAddFormData({
      name: '',
      description: '',
      prescribedDrugs: [],
    });
  };

  const handleOpenEdit = (symptom: TableData) => {
    const originalSymptom: Symptom = {
      ...symptom,
      prescribedDrugs: [],
      status: symptom.status === '-' ? null : symptom.status,
    };
    setSelectedSymptom(originalSymptom);
    
    // Fetch the full symptom details including prescribedDrugs
    fetchSymptomDetails(symptom.id);
    setOpenEdit(true);
  };

  const fetchSymptomDetails = async (id: number) => {
    try {
      const response = await apiService.get<ApiResponse>(`/symptom/${id}`);
      if (response.code === 200 && response.result) {
        // Since result is an array, we need to find the specific symptom
        const symptom = Array.isArray(response.result) 
          ? response.result.find(s => s.id === id)
          : response.result;

        if (symptom) {
          setEditFormData({
            name: symptom.name,
            description: symptom.description,
            prescribedDrugs: symptom.prescribedDrugs || [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch symptom details:', error);
      toast.error('Failed to fetch symptom details');
    }
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedSymptom(null);
  };

  const handleOpenDelete = (symptom: TableData) => {
    const originalSymptom: Symptom = {
      ...symptom,
      prescribedDrugs: [],
      status: symptom.status === '-' ? null : symptom.status,
    };
    setSelectedSymptom(originalSymptom);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedSymptom(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if there is at least one drug
      if (addFormData.prescribedDrugs.length === 0) {
        toast.error('Please add at least one drug');
        return;
      }

      // Validate prescribed drugs
      const hasInvalidDrugs = addFormData.prescribedDrugs.some(drug => 
        !drug.drugName || drug.dosage <= 0 || drug.duration <= 0 || !drug.frequency
      );

      if (hasInvalidDrugs) {
        toast.error('Please fill in all required information for all drugs');
        return;
      }

      const response = await apiService.post<ApiResponse>('/symptom', addFormData);
      if (response.code === 200) {
        toast.success('Symptom added successfully');
        fetchSymptoms();
        handleCloseAdd();
      } else {
        throw new Error(response.message || 'Failed to add symptom');
      }
    } catch (error: any) {
      console.error('Failed to add symptom:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Unable to connect to server. Please check your connection and try again.');
        return;
      }

      const errorMessage = error.details?.message || error.message;
      if (errorMessage?.includes('Duplicate entry')) {
        toast.error('A symptom with this name already exists. Please use a different name.');
        return;
      }

      toast.error(errorMessage || 'Failed to add symptom. Please try again.');
    }
  };

  const handleAddDrugToNew = () => {
    if (!selectedDrug || !selectedDrug.id) {
      toast.error('Please select a drug before adding');
      return;
    }

    // Check if the drug is already in the list
    const isDrugExist = addFormData.prescribedDrugs.some(
      drug => drug.drugName.toLowerCase() === selectedDrug.name.toLowerCase()
    );

    if (isDrugExist) {
      toast.warning('This drug is already in the list');
      return;
    }

    setAddFormData(prev => ({
      ...prev,
      prescribedDrugs: [
        ...prev.prescribedDrugs,
        {
          drugId: selectedDrug.id,
          drugName: selectedDrug.name,
          dosage: 0,
          duration: 0,
          frequency: '',
          specialInstructions: '',
        },
      ],
    }));
    setSelectedDrug(null);
    setSearchDrug('');
    toast.success('Drug added successfully');
  };

  const handleRemoveDrugFromNew = (index: number) => {
    setAddFormData(prev => ({
      ...prev,
      prescribedDrugs: prev.prescribedDrugs.filter((_, i) => i !== index),
    }));
  };

  const handleDrugChangeInNew = (index: number, field: keyof PrescribedDrug, value: string | number) => {
    if (field === 'dosage' || field === 'duration') {
      if (Number(value) < 0) {
        toast.error('Value cannot be less than 0');
        return;
      }
    }

    setAddFormData(prev => ({
      ...prev,
      prescribedDrugs: prev.prescribedDrugs.map((drug, i) => 
        i === index ? { ...drug, [field]: value } : drug
      ),
    }));
  };

  const handleDrugNameChange = (index: number, newDrug: Drug | null) => {
    if (newDrug) {
      setEditFormData(prev => ({
        ...prev,
        prescribedDrugs: prev.prescribedDrugs.map((drug, i) => {
          if (i === index) {
            const updatedDrug = {
              ...drug,
              drugId: newDrug.id || drug.drugId,
              drugName: newDrug.name,
            };
            return updatedDrug;
          }
          return drug;
        }),
      }));
    }
  };

  const handleEdit = async (id: number, formData: FormData) => {
    try {
      // Check if there is at least one drug
      if (editFormData.prescribedDrugs.length === 0) {
        toast.error('Please add at least one drug');
        return;
      }

      // Map drugs to ensure all have drugId
      const prescribedDrugs = editFormData.prescribedDrugs.map(drug => {
        if (!drug.drugId) {
          const matchingDrug = drugs.find(d => d.name === drug.drugName);
          if (matchingDrug) {
            return { ...drug, drugId: matchingDrug.id };
          }
        }
        return drug;
      });

      // Validate prescribed drugs
      const invalidDrugs = prescribedDrugs.filter(drug => {
        const invalid = !drug.drugId || drug.dosage <= 0 || drug.duration <= 0 || !drug.frequency;
        return invalid;
      });

      if (invalidDrugs.length > 0) {
        toast.error('Please fill in all required information for all drugs');
        return;
      }

      // Format the data according to the required structure
      const updatedData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        prescribedDrugs: prescribedDrugs.map(drug => ({
          drugId: drug.drugId,
          dosage: drug.dosage,
          duration: drug.duration,
          frequency: drug.frequency,
          specialInstructions: drug.specialInstructions || ''
        }))
      };

      const response = await apiService.put<ApiResponse>(`/symptom/${id}`, updatedData);
      if (response.code === 200) {
        toast.success('Updated successfully');
        fetchSymptoms();
        handleCloseEdit();
      } else {
        throw new Error(response.message || 'Failed to update symptom');
      }
    } catch (error: any) {
      console.error('Failed to update symptom:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Unable to connect to server. Please check your connection and try again.');
        return;
      }

      const errorMessage = error.details?.message || error.message;
      if (errorMessage?.includes('The given id must not be null')) {
        toast.error('Invalid drug data. Please check all drug information.');
        return;
      }

      if (errorMessage?.includes('Duplicate entry')) {
        toast.error('A symptom with this name already exists. Please use a different name.');
        return;
      }

      toast.error(errorMessage || 'Update failed. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiService.delete<ApiResponse>(`/symptom/${id}`);
      if (response.code === 200) {
        toast.success('Symptom deleted successfully');
        fetchSymptoms();
        handleCloseDelete();
      } else {
        throw new Error(response.message || 'Failed to delete symptom');
      }
    } catch (error) {
      console.error('Failed to delete symptom:', error);
      toast.error('Failed to delete symptom');
    }
  };

  const handleDrugChange = (index: number, field: keyof PrescribedDrug, value: string | number) => {
    if (field === 'dosage' || field === 'duration') {
      if (Number(value) < 0) {
        toast.error('Value cannot be less than 0');
        return;
      }
    }

    setEditFormData(prev => ({
      ...prev,
      prescribedDrugs: prev.prescribedDrugs.map((drug, i) => 
        i === index ? { ...drug, [field]: value } : drug
      ),
    }));
  };

  const handleAddDrug = () => {
    if (!selectedDrug || !selectedDrug.id) {
      toast.error('Please select a drug before adding');
      return;
    }

    // Check if the drug is already in the list
    const isDrugExist = editFormData.prescribedDrugs.some(
      drug => drug.drugName.toLowerCase() === selectedDrug.name.toLowerCase()
    );

    if (isDrugExist) {
      toast.warning('This drug is already in the list');
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      prescribedDrugs: [
        ...prev.prescribedDrugs,
        {
          drugId: selectedDrug.id,
          drugName: selectedDrug.name,
          dosage: 0,
          duration: 0,
          frequency: '',
          specialInstructions: '',
        },
      ],
    }));
    setSelectedDrug(null);
    setSearchDrug('');
    toast.success('Drug added successfully');
  };

  const handleRemoveDrug = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      prescribedDrugs: prev.prescribedDrugs.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="p-4">
        <h1 className="text-3xl font-bold my-5">Pre Medical Bill Management</h1>
        {error && (
          <div className="text-red-500 mb-4">Error loading symptoms: {error}</div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex mt-10 mb-5 gap-x-7 justify-between">
              <div className="w-10/12 h-1/2">
                <TextField
                  label="Search"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value.toLowerCase())}
                  fullWidth
                  className="mb-4"
                />
              </div>
              <button
                className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-2 rounded-lg transition duration-300 ease-in-out text-lg"
                onClick={() => setOpenAdd(true)}
              >
                + Add Medical Bill
              </button>
            </div>

            <AdminTable<TableData>
              data={filteredData}
              columns={columns}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              statusField="status"
              isUserManage={false}
            />
          </>
        )}

        {/* Add Modal */}
        {openAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Symptom</h2>
              <form onSubmit={handleAdd}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={addFormData.description}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                      rows={4}
                    />
                  </div>

                  {/* Prescribed Drugs Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-lg font-medium text-gray-700">
                        Prescribed Drugs
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-64">
                          <Autocomplete
                            value={selectedDrug}
                            onChange={(_event, newValue) => {
                              setSelectedDrug(newValue);
                            }}
                            inputValue={searchDrug}
                            onInputChange={(_event, newInputValue) => {
                              setSearchDrug(newInputValue);
                            }}
                            options={drugs.filter(d => 
                              !addFormData.prescribedDrugs.some(
                                pd => pd.drugName.toLowerCase() === d.name.toLowerCase()
                              )
                            )}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                label="Search Drug" 
                                variant="outlined" 
                                size="small"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: '#E5E7EB',
                                      borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: '#B2B7BE',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#3B82F6',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddDrugToNew}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center gap-2"
                          disabled={!selectedDrug}
                        >
                          <Plus size={16} />
                          Add Drug
                        </button>
                      </div>
                    </div>

                    {addFormData.prescribedDrugs.map((drug, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveDrugFromNew(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Drug Name
                            </label>
                            <input
                              type="text"
                              value={drug.drugName}
                              disabled
                              readOnly
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 bg-gray-100 shadow-sm cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Dosage
                            </label>
                            <input
                              type="number"
                              value={drug.dosage}
                              onChange={(e) => handleDrugChangeInNew(index, 'dosage', Number(e.target.value))}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Duration (days)
                            </label>
                            <input
                              type="number"
                              value={drug.duration}
                              onChange={(e) => handleDrugChangeInNew(index, 'duration', Number(e.target.value))}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Frequency
                            </label>
                            <input
                              type="text"
                              value={drug.frequency}
                              onChange={(e) => handleDrugChangeInNew(index, 'frequency', e.target.value)}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                              placeholder="e.g., Twice a day"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Special Instructions
                            </label>
                            <textarea
                              value={drug.specialInstructions}
                              onChange={(e) => handleDrugChangeInNew(index, 'specialInstructions', e.target.value)}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                              rows={2}
                              placeholder="e.g., Take after meals"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAdd}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {openEdit && selectedSymptom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Symptom</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEdit(selectedSymptom.id, formData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  {/* Prescribed Drugs Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-lg font-medium text-gray-700">
                        Prescribed Drugs
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-64">
                          <Autocomplete
                            value={selectedDrug}
                            onChange={(_event, newValue) => {
                              setSelectedDrug(newValue);
                            }}
                            inputValue={searchDrug}
                            onInputChange={(_event, newInputValue) => {
                              setSearchDrug(newInputValue);
                            }}
                            options={drugs.filter(d => 
                              !editFormData.prescribedDrugs.some(
                                pd => pd.drugName.toLowerCase() === d.name.toLowerCase()
                              )
                            )}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                variant="outlined" 
                                size="small"
                                className="mt-1"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: '#E5E7EB',
                                      borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: '#B2B7BE',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#3B82F6',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddDrug}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center gap-2"
                          disabled={!selectedDrug}
                        >
                          <Plus size={16} />
                          Add Drug
                        </button>
                      </div>
                    </div>

                    {editFormData.prescribedDrugs.map((drug, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveDrug(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Drug Name
                            </label>
                            <Autocomplete
                              value={drugs.find(d => d.id === drug.drugId) || { id: 0, name: drug.drugName, unit: '', price: 0 }}
                              onChange={(_event, newValue) => handleDrugNameChange(index, newValue)}
                              options={[
                                { id: 0, name: drug.drugName, unit: '', price: 0 },
                                ...drugs.filter(d => 
                                  d.id !== 0 && 
                                  d.name.toLowerCase() !== drug.drugName.toLowerCase() &&
                                  !editFormData.prescribedDrugs.some(
                                    pd => pd.drugName.toLowerCase() === d.name.toLowerCase() && 
                                    pd !== editFormData.prescribedDrugs[index]
                                  )
                                )
                              ]}
                              getOptionLabel={(option) => option.name}
                              isOptionEqualToValue={(option, value) => 
                                option.id === value.id || option.name === value.name
                              }
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  variant="outlined" 
                                  size="small"
                                  className="mt-1"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: '#E5E7EB',
                                        borderWidth: '2px',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: '#B2B7BE',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#3B82F6',
                                      },
                                    },
                                  }}
                                />
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Dosage
                            </label>
                            <input
                              type="number"
                              value={drug.dosage}
                              onChange={(e) => handleDrugChange(index, 'dosage', Number(e.target.value))}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Duration (days)
                            </label>
                            <input
                              type="number"
                              value={drug.duration}
                              onChange={(e) => handleDrugChange(index, 'duration', Number(e.target.value))}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Frequency
                            </label>
                            <input
                              type="text"
                              value={drug.frequency}
                              onChange={(e) => handleDrugChange(index, 'frequency', e.target.value)}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                              placeholder="e.g., Twice a day"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Special Instructions
                            </label>
                            <textarea
                              value={drug.specialInstructions}
                              onChange={(e) => handleDrugChange(index, 'specialInstructions', e.target.value)}
                              className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                              rows={2}
                              placeholder="e.g., Take after meals"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {openDelete && selectedSymptom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Delete Symptom</h2>
              <p className="mb-4">
                Are you sure you want to delete this symptom? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedSymptom.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PreMedicalBillManagement; 