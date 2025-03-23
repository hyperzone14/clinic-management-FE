import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { setCredentials } from "../../redux/slices/authSlice";
import { AuthService } from "../../utils/security/services/AuthService";
import { FormHelperText } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { JwtUtils } from "../../utils/security/jwt/JwtUtils";

interface LogInProps {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LogIn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const [logInInfo, setLogInInfo] = React.useState<LogInProps>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange =
    (prop: keyof LogInProps) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLogInInfo({
        ...logInInfo,
        [prop]:
          event.target.type === "checkbox"
            ? event.target.checked
            : event.target.value,
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response: {
        code: number;
        result: { id: number; token: string } | boolean;
        message?: string;
      } = await AuthService.login({
        email: logInInfo.email,
        password: logInInfo.password,
        rememberMe: logInInfo.rememberMe,
      });

      if (
        response.code === 200 &&
        typeof response.result === "object" &&
        response.result !== null &&
        !Array.isArray(response.result)
      ) {
        // Store the token using the appropriate storage method
        JwtUtils.setToken(response.result.token, logInInfo.rememberMe);

        dispatch(
          setCredentials({
            id: response.result.id.toString(),
            email: logInInfo.email,
            username: logInInfo.email,
            token: response.result.token,
          })
        );
        navigate("/");
      } else {
        const errorMessage = response.message || "Login failed";
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // console.log(error);
  return (
    <>
      <ToastContainer />
      <div className='flex justify-center items-center'>
        <div className='bg-[#fff] shadow-md p-8 rounded-lg w-9/12 h-fit'>
          <div className='grid grid-cols-2'>
            <div className='col-span-1 ms-5'>
              <div className='flex justify-start ms-3'>
                <img
                  src='/assets/images/medpal.png'
                  alt='Medpal'
                  className='w-3/12'
                />
              </div>
              <div className='mt-20'>
                <h1 className='text-4xl font-bold text-center'>Log in</h1>
                <form onSubmit={handleSubmit}>
                  {/* {error && (
                    <div className="text-red-500 text-center mb-4">{error}</div>
                  )} */}
                  <div className='mt-8 space-y-4 px-16'>
                    <FormControl fullWidth variant='outlined' error={!!error}>
                      <InputLabel htmlFor='email'>Email</InputLabel>
                      <OutlinedInput
                        id='email'
                        type='email'
                        value={logInInfo.email}
                        onChange={handleChange("email")}
                        startAdornment={
                          <InputAdornment position='start'>
                            <EmailIcon />
                          </InputAdornment>
                        }
                        label='Email'
                        placeholder='Email'
                      />
                      {error && (
                        <FormHelperText error>
                          Incorrect email or password
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl fullWidth variant='outlined' error={!!error}>
                      <InputLabel htmlFor='password'>Password</InputLabel>
                      <OutlinedInput
                        id='password'
                        type='password'
                        value={logInInfo.password}
                        onChange={handleChange("password")}
                        startAdornment={
                          <InputAdornment position='start'>
                            <LockIcon />
                          </InputAdornment>
                        }
                        label='Password'
                        placeholder='Password'
                      />
                      {error && (
                        <FormHelperText error>
                          Incorrect email or password
                        </FormHelperText>
                      )}
                    </FormControl>
                    <div className='flex justify-between remember'>
                      <FormControlLabel
                        control={
                          <Checkbox
                            color='primary'
                            checked={logInInfo.rememberMe}
                            onChange={handleChange("rememberMe")}
                          />
                        }
                        label='Keep me logged in'
                      />
                    </div>
                    <button
                      className='bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out w-full'
                      type='submit'
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Log in"}
                    </button>
                  </div>
                </form>
                <div className='mt-20 flex justify-center'>
                  <span className='gap-2'>
                    Not a member yet?{" "}
                    <Link
                      to='/sign-in'
                      className='text-[#2495c3] hover:text-[#64BFE3] transition duration-300 ease-in-out'
                    >
                      Create an account
                    </Link>
                  </span>
                </div>
              </div>
            </div>
            <div className='col-span-1'>
              <img
                src='/assets/images/treatment.png'
                alt='Login'
                className='w-full h-full'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
