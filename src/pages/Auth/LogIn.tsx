import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";

interface LogInProps {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LogIn: React.FC = () => {
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
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="bg-[#fff] shadow-md p-8 rounded-lg w-9/12 h-fit">
          <div className="grid grid-cols-2">
            <div className="col-span-1 ms-5">
              <div className="flex justify-start ms-3">
                <img
                  src="/assets/images/medpal.png"
                  alt="Medpal"
                  className="w-3/12"
                />
              </div>
              <div className="mt-20">
                <h1 className="text-4xl font-bold text-center">Log in</h1>
                <div className="mt-10 space-y-4 px-16">
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <OutlinedInput
                      id="email"
                      type="email"
                      value={logInInfo.email}
                      onChange={handleChange("email")}
                      startAdornment={
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      }
                      label="Email"
                      placeholder="Email"
                    />
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                      id="password"
                      type="password"
                      value={logInInfo.password}
                      onChange={handleChange("password")}
                      startAdornment={
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      }
                      label="Password"
                      placeholder="Password"
                    />
                  </FormControl>
                  <div className="flex justify-between remember">
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={logInInfo.rememberMe}
                          onChange={handleChange("rememberMe")}
                        />
                      }
                      label="Keep me logged in"
                    />

                    <Link
                      to="/forgot-password"
                      className="mt-2 text-[#2495c3] hover:text-[#64BFE3] transition duration-300 ease-in-out"
                    >
                      Forget Password?
                    </Link>
                  </div>
                  <button
                    className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out w-full"
                    type="submit"
                  >
                    Log in
                  </button>
                </div>
                <div className="mt-20 flex justify-center">
                  <span className="gap-2">
                    Not a member yet?{" "}
                    <Link
                      to="/sign-in"
                      className="text-[#2495c3] hover:text-[#64BFE3] transition duration-300 ease-in-out"
                    >
                      Create an account
                    </Link>
                  </span>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <img
                src="/assets/images/treatment.png"
                alt="Login"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
