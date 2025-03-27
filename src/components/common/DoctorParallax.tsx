import { useEffect } from "react";
import { Parallax } from "react-parallax";
import { useDispatch, useSelector } from "react-redux";
// import { getFeedbackByDoctorId } from "../../redux/slices/feedbackSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { getDoctorById } from "../../redux/slices/doctorSlice";

interface DoctorParallaxProps {
  doctorId: string | null;
}

const DoctorParallax: React.FC<DoctorParallaxProps> = ({ doctorId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const doctorInfo = useSelector((state: RootState) => state.doctor.doctors);

  useEffect(() => {
    dispatch(getDoctorById(Number(doctorId)));
  }, [dispatch, doctorId]);

  return (
    <>
      <div className='min-w-7xl overflow-hidden relative -mx-[11rem]'>
        <Parallax
          bgImage='/assets/images/doctor1.png'
          bgImageAlt='Group of doctors'
          strength={800}
          className='h-[300px] w-screen relative'
          renderLayer={() => (
            <div
              style={{
                position: "absolute",
                background: "linear-gradient(to bottom, #A8DBF0c0, #87ceebc0)0",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        >
          {doctorInfo
            .filter((doctor) => doctor.id === Number(doctorId))
            .map((doctor) => (
              <div
                key={doctor.id}
                className='absolute ps-[10.75rem] pt-28 justify-center w-full'
              >
                <h1 className='text-5xl font-bold text-[#333333] '>
                  Meet Dr. {doctor.fullName}
                </h1>
                <div className='mt-3'>
                  <span className='text-xl text-[#708090] font-bold'>
                    Compassionate care for your health and wellness
                  </span>
                </div>
              </div>
            ))}
        </Parallax>
      </div>
    </>
  );
};

export default DoctorParallax;
