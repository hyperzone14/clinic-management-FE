import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchParallax from "../components/common/SearchParallax";
import { IoSearchOutline } from "react-icons/io5";
import { TbFilter } from "react-icons/tb";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./../styles/listingYEffect.css";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../redux/slices/departmentSlice";
import {
  // fetchDoctors,
  fetchDoctorsPagination,
  setSearchTerm,
} from "../redux/slices/doctorSlice";

const Doctors = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const noEventsRef = useRef(null);

  // Memoize selectors to prevent unnecessary re-renders
  const departments = useSelector(
    (state: RootState) => state.department.departments,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );

  const {
    doctors = [],
    pagination,
    searchTerm,
    loading,
    error,
  } = useSelector(
    (state: RootState) => state.doctor,
    (prev, next) =>
      prev.doctors.length === next.doctors.length &&
      prev.pagination.currentPage === next.pagination.currentPage &&
      prev.searchTerm === next.searchTerm &&
      prev.loading === next.loading
  );

  const [checkedChoice, setCheckedChoice] = React.useState<string>("All");
  const navigate = useNavigate();

  // Create node refs for each doctor
  const nodeRefs = doctors.reduce((acc, doctor) => {
    acc[doctor.id] = React.createRef<HTMLDivElement>();
    return acc;
  }, {} as Record<number, React.RefObject<HTMLDivElement>>);

  // Memoized handlers to prevent unnecessary re-renders
  const handleDoctorClick = useCallback(
    (doctorId: number) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/doctors/${doctorId}`);
    },
    [navigate]
  );

  const handleDoctorDepartment = useCallback(
    (departmentId: number) => {
      return departments.find((dep) => dep.id === departmentId)?.name || "";
    },
    [departments]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 0 && newPage < pagination.totalPages) {
        const searchTermForFetch =
          checkedChoice === "All" ? searchTerm : checkedChoice;

        dispatch(
          fetchDoctorsPagination({
            page: newPage,
            searchTerm: searchTermForFetch,
          })
        );
      }
    },
    [dispatch, pagination, checkedChoice, searchTerm]
  );

  const handleSearch = useCallback(
    (value: string) => {
      dispatch(setSearchTerm(value));
    },
    [dispatch]
  );

  // Filtering logic
  const displayDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      !searchTerm ||
      doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      checkedChoice === "All" ||
      handleDoctorDepartment(doctor.departmentId) === checkedChoice;

    return matchesSearch && matchesDepartment;
  });

  // Pagination visibility check
  const showPagination = !searchTerm && checkedChoice === "All";

  // Optimize initial data fetching
  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      dispatch(fetchDepartments()),
      dispatch(fetchDoctorsPagination({ page: 0 })),
    ]).catch((error) => {
      console.error("Initial data fetch failed:", error);
    });

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  // Search term change effect with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        dispatch(fetchDoctorsPagination({ page: 0, searchTerm }));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm]);

  // Department change effect
  useEffect(() => {
    const searchTermForFetch = checkedChoice === "All" ? "" : checkedChoice;

    dispatch(
      fetchDoctorsPagination({
        page: 0,
        searchTerm: searchTermForFetch,
      })
    );
  }, [dispatch, checkedChoice]);

  return (
    <>
      <div className='w-full'>
        <SearchParallax />
        <div className='flex flex-col my-10 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5'>
            Choose Your Doctor
          </h1>
        </div>
        <div className='mb-20 grid grid-cols-4'>
          <div className='col-span-1'>
            <div className='mt-2 flex'>
              <TbFilter className='mx-3 mt-1' size={25} />
              <p className='text-2xl font-bold'>Filter</p>
            </div>
            <hr className='mr-12 my-3' />
            <FormControl className='ms-3' sx={{ minWidth: 290 }}>
              <InputLabel id='departments'>Departments</InputLabel>
              <Select
                labelId='departments'
                id='departments'
                value={checkedChoice}
                onChange={(e) => setCheckedChoice(e.target.value)}
                label='Departments'
              >
                <MenuItem value='All'>All</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.name}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className='col-span-3'>
            <div className='flex items-center bg-[#fff] rounded-md focus-within:ring-2 focus-within:ring-blue-500 mb-5 h-[3rem]'>
              <IoSearchOutline className='ml-3 text-[#808080]' size={20} />
              <input
                type='text'
                placeholder='Search doctors or departments...'
                className='w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-[#808080] text-lg'
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
              </div>
            ) : error ? (
              <div className='text-red-500 text-center p-4'>
                Error loading doctors: {error}
              </div>
            ) : (
              <div>
                {displayDoctors.length === 0 ? (
                  <TransitionGroup component={null}>
                    <CSSTransition
                      key='no-doctors'
                      timeout={500}
                      nodeRef={noEventsRef}
                      classNames='fade-slide'
                    >
                      <div
                        ref={noEventsRef}
                        className='text-center p-8 bg-gray-100 rounded-lg'
                      >
                        <p className='text-xl text-gray-600'>
                          No doctors found
                        </p>
                        <p className='text-sm text-gray-500 mt-2'>
                          {searchTerm || checkedChoice !== "All"
                            ? "Try adjusting your search terms or filter"
                            : "There are no doctors to display"}
                        </p>
                      </div>
                    </CSSTransition>
                  </TransitionGroup>
                ) : (
                  <div className='grid grid-cols-3 gap-4'>
                    <TransitionGroup component={null}>
                      {displayDoctors.map((doctor) => (
                        <CSSTransition
                          key={`${checkedChoice}-${doctor.id}`}
                          timeout={500}
                          nodeRef={nodeRefs[doctor.id]}
                          classNames='fade-slide'
                        >
                          <div
                            ref={nodeRefs[doctor.id]}
                            className='col-span-1 bg-[#fff] rounded-md hover:shadow-md transition-shadow duration-300 cursor-pointer'
                            onClick={() => handleDoctorClick(doctor.id)}
                          >
                            <img
                              src='assets\\images\\doctor1.png'
                              alt='doctor1'
                              className='w-full h-[200px] object-cover rounded-t-md'
                            />
                            <div className='p-3'>
                              <h1 className='text-xl font-bold'>
                                {doctor.fullName}
                              </h1>
                              <span className='text-[#808080]'>
                                {handleDoctorDepartment(doctor.departmentId)}
                              </span>
                            </div>
                          </div>
                        </CSSTransition>
                      ))}
                    </TransitionGroup>
                  </div>
                )}

                {showPagination && (
                  <div className='flex justify-center space-x-4 my-4'>
                    <button
                      className='px-4 py-2 bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out'
                      onClick={() => {
                        handlePageChange(pagination.currentPage - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={pagination.currentPage === 0}
                    >
                      Previous
                    </button>
                    <span className='px-4 py-2'>
                      Page {pagination.currentPage + 1} of{" "}
                      {pagination.totalPages}
                    </span>
                    <button
                      className='px-4 py-2 bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out'
                      onClick={() => {
                        handlePageChange(pagination.currentPage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={
                        pagination.currentPage === pagination.totalPages - 1
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default Doctors;
