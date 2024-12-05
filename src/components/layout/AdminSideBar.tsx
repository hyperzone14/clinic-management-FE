import { LuLayoutDashboard } from "react-icons/lu";
import { PiUserCircleLight } from "react-icons/pi";
import { BsCapsulePill } from "react-icons/bs";
import { FaUserDoctor } from "react-icons/fa6";
import { MdOutlineReceiptLong } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { adminRoutes } from "../../utils/pageRoutes";
import { JwtUtils } from "../../utils/security/jwt/JwtUtils";
import { logout } from "../../redux/slices/authSlice";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { AuthService } from "../../utils/security/services/AuthService";

const adminIcons = [
  {
    id: 1,
    icon: LuLayoutDashboard,
  },
  {
    id: 2,
    icon: PiUserCircleLight,
  },
  {
    id: 3,
    icon: BsCapsulePill,
  },
  {
    id: 4,
    icon: FaUserDoctor,
  },
  {
    id: 5,
    icon: MdOutlineReceiptLong,
  },
];

const formatName = (name: string) => {
  // Remove "Management" from the name and then format
  const cleanedName = name.replace("Management", "").trim();
  return cleanedName.replace(/([A-Z])/g, " $1").trim();
};

const AdminSideBar = () => {
  const currentRole = AuthService.getRolesFromToken();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = () => {
    JwtUtils.removeToken();
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="group transition-all duration-300 ease-in-out w-1/12 hover:w-1/5 bg-[#87ceeb] px-5 h-screen flex flex-col justify-between">
      <div>
        <img
          src="/assets/images/medpal.png"
          alt="MedPal"
          className="w-40 mt-10"
        />

        {/* Navigation Links */}
        <div className="mt-16 flex flex-col space-y-9">
          {adminRoutes.map((route) => {
            const matchedIcon = adminIcons.find(
              (iconObj) => iconObj.id === route.id
            );
            const IconComponent = matchedIcon
              ? matchedIcon.icon
              : PiUserCircleLight;

            return (
              <div
                key={route.id}
                className="flex items-center hover:text-[#4567B7] transition-colors duration-300 ease-in-out cursor-pointer w-full px-2"
              >
                {/* Icon */}
                <IconComponent className="w-11 h-11 text-[#8a8d56] flex-shrink-0 ms-4 group-hover:ms-0 transition-all duration-300 ease-in-out" />

                {/* Text Label */}
                <h1
                  className="ml-4 text-xl font-bold font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                  onClick={() => navigate(`/admin/${route.path}`)}
                >
                  {route.path === "" ? "Dashboard" : formatName(route.location)}
                </h1>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Icon at the bottom */}
      <div className="mb-6 flex items-center">
        <PiUserCircleLight
          size={55}
          className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-1.5 rounded-full transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0 ms-5 group-hover:ms-0"
          onClick={handleLogout}
        />
        <h1 className="ml-4 text-xl font-bold font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {currentRole[0].replace("ROLE_", "")}
        </h1>
      </div>
    </div>
  );
};

export default AdminSideBar;
