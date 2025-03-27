/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DoctorParallax from "../components/common/DoctorParallax";
import SlidingBar from "../components/common/SlidingBar";
import { AppDispatch, RootState } from "../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDoctorById } from "../redux/slices/doctorSlice";
import { fetchDepartments } from "../redux/slices/departmentSlice";

const DoctorDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const doctorInfo = useSelector((state: RootState) => state.doctor.doctors);
  const departments = useSelector(
    (state: RootState) => state.department.departments
  );
  const id = sessionStorage.getItem("doctorId");

  useEffect(() => {
    if (id === null || isNaN(Number(id))) {
      toast.error("No ID found in sessionStorage");
      navigate("/doctors");
      return;
    }

    // setDoctorId(id);
    const numId = Number(id);
    dispatch(getDoctorById(numId));
    dispatch(fetchDepartments());
  }, [dispatch, navigate]);

  const handleDepartmentName = (departmentId: number) => {
    return departments.find((dep) => dep.id === departmentId)?.name || "";
  };

  return (
    <>
      <ToastContainer />
      <div className='w-full'>
        <DoctorParallax doctorId={id} />
        <div className='flex my-10 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5'>Doctor Profile</h1>
        </div>
        <div className='mb-10 grid-cols-5 grid gap-4'>
          <div className='col-span-1 flex justify-center'>
            <div className='w-[150px] h-[150px] rounded-full overflow-hidden flex justify-center items-center'>
              <img
                src='/assets/images/doctor1.png'
                alt=''
                className='w-full h-full object-cover'
              />
            </div>
          </div>
          {/* {feedbacks.map((feedback, index) => ())} */}
          {doctorInfo
            .filter((doctor) => doctor.id === Number(id))
            .map((doctor) => (
              <div key={doctor.id} className='col-span-4'>
                <h1 className='text-3xl font-bold font-sans'>
                  {doctor.fullName}
                </h1>
                <div className='flex flex-col mt-2 gap-2'>
                  <p className='text-gray-500 text-xl'>
                    Department:{" "}
                    <b className='text-black'>
                      {handleDepartmentName(doctor.departmentId)}
                    </b>
                  </p>
                  <p className='text-gray-500 text-xl'>
                    Working days:{" "}
                    <b className='text-black'>
                      {doctor.workingDays.join(", ")}
                    </b>
                  </p>
                  <span className='text-gray-500 text-xl'>
                    With 10 years of experience, Dr. {doctor.fullName} has honed
                    their expertise in delivering top-notch patient care and
                    diagnosing complex conditions. Dr. {doctor.fullName} is
                    dedicated to providing effective treatment plans and staying
                    updated with the latest medical advancements.
                  </span>
                </div>
              </div>
            ))}
        </div>
        <div className='my-20'>
          <h1 className='text-3xl font-bold font-sans text-center'>
            Reviews from patients
          </h1>
          <div className='w-full gap-4 mt-5 flex '>
            <SlidingBar feedbackId={id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDetail;
