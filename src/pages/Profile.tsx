import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserImage from "../components/common/UserImage";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { AuthService } from "../utils/security/services/AuthService";
import PatientProfile from "../components/common/PatientProfile";
import DoctorProfile from "../components/common/DoctorProfile";

interface PatientProfile {
  fullName: string;
  gender: string;
  DoB: string | null;
  citizenId: string;
  address: string;
  email: string;
}

const Profile = () => {
  const currentId = AuthService.getIdFromToken();
  const currentRole = AuthService.getRolesFromToken();
  const auth = useSelector((state: RootState) => state.auth);

  return (
    <>
      <ToastContainer />
      <div className='w-full'>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-5xl font-bold font-sans my-5'>Profile</h1>
        </div>

        <div className='grid grid-cols-12 gap-4 mx-10'>
          <div className='col-span-3'>
            <UserImage fullName={auth.username ?? undefined} />
          </div>
          <div className='col-span-9 mb-16'>
            {currentRole.includes("ROLE_PATIENT") && currentId ? (
              <PatientProfile id={currentId} />
            ) : currentRole.includes("ROLE_NURSE") && currentId ? (
              <PatientProfile id={currentId} />
            ) : (
              <DoctorProfile id={currentId ?? ""} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
