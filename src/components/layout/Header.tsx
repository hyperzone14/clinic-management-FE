import { useState, useEffect, useRef } from "react";
import { getHeaderRoutes, Routes } from "../../utils/pageRoutes.ts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown from "../common/Dropdown.tsx";
import { useSelector } from "react-redux";
import {
  RootState,
  useAppDispatch,
  // useAppSelector,
} from "../../redux/store.ts";
import { PiUserCircleLight } from "react-icons/pi";
import { JwtUtils } from "../../utils/security/jwt/JwtUtils";
import { logout, setCredentials } from "../../redux/slices/authSlice";
import { AuthService } from "../../utils/security/services/AuthService.ts";

export const Header = () => {
  const currentRole = AuthService.getRolesFromToken();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [headerRoutes, setHeaderRoutes] = useState<Routes[]>([]);
  // const patientInfo = useSelector((state: RootState) => state.userManage.users);
  // const doctorInfo = useAppSelector((state) => state.doctorManage.doctors);

  useEffect(() => {
    const initializeUserData = () => {
      const token = JwtUtils.getToken();
      const email = JwtUtils.getEmail();
      const username = JwtUtils.getUsername();
      const id = AuthService.getIdFromToken();
      // const userRole = AuthService.getRolesFromToken();

      //   let username: string | undefined; // Declare username outside the blocks

      // if (userRole.includes("ROLE_PATIENT")) {
      //   const user = patientInfo.find((user) => user.id.toString() === id);
      //   username = user?.username; // Assign username if user is found
      // } else if (userRole.includes("ROLE_DOCTOR")) {
      //   const user = doctorInfo.find((user) => user.id.toString() === id);
      //   username = user?.username; // Assign username if user is found
      // }

      if (token && email && username && id) {
        // Restore user data to Redux state
        dispatch(
          setCredentials({
            id,
            email,
            username,
            token,
          })
        );
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    initializeUserData();
  }, [dispatch]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    JwtUtils.removeToken();
    dispatch(logout());
    navigate("/");
    closeDropdown();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkAuthAndUpdateRoutes = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const currentRole = AuthService.getCurrentRole();
        const routes = getHeaderRoutes(currentRole);
        setHeaderRoutes(routes);
      } else {
        // Set default routes for unauthenticated users
        setHeaderRoutes(getHeaderRoutes("ROLE_PATIENT"));
      }
    };

    checkAuthAndUpdateRoutes();
  }, [auth.token]); // Depend on auth.token to re-run when authentication changes

  return (
    <header
      className={`sticky top-0 transition-all duration-300 z-10 ${
        isScrolled ? "bg-[#87ceeb]" : "bg-transparent"
      }`}
    >
      <nav>
        <div className='flex justify-between items-center w-full py-5 md:px-10 lg:px-16'>
          <div className='logo'>
            <Link to='/'>
              <img
                src='/assets/images/medpal.png'
                alt='Medpal'
                className='md:w-3/12 lg:w-2/12 ms-11'
              />
            </Link>
          </div>

          <div className='flex justify-center'>
            <ul className='flex gap-10 md:pe-10 md:me-3 lg:pe-0 lg:me-10'>
              {currentRole.includes("ROLE_NURSE")
                ? headerRoutes.map((route) => (
                    <li key={route.id}>
                      <Link
                        to={route.path}
                        className={`font-bold font-sans text-lg hover:text-[#4567b7] hover:underline transition duration-50 ease-in-out whitespace-nowrap ${
                          location.pathname === route.path
                            ? "text-[#4567b7] underline"
                            : ""
                        }`}
                      >
                        {route.name}
                      </Link>
                    </li>
                  ))
                : headerRoutes.map((route) => (
                    <li key={route.id}>
                      <Link
                        to={route.path}
                        className={`font-bold font-sans text-lg hover:text-[#4567b7] hover:underline transition duration-50 ease-in-out whitespace-nowrap ${
                          location.pathname === route.path
                            ? "text-[#4567b7] underline"
                            : ""
                        }`}
                      >
                        {route.location}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>

          <div className='md:ms-2 md:me-14 lg:mx-8' ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <PiUserCircleLight
                  size={55}
                  className='bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-1.5 rounded-full transition duration-300 ease-in-out cursor-pointer'
                  onClick={toggleDropdown}
                />
                <Dropdown
                  isOpen={isOpen}
                  onClose={closeDropdown}
                  onLogout={handleLogout}
                  userName={auth.username}
                  userEmail={auth.email}
                />
              </>
            ) : (
              <button
                className='bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out w-28'
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
