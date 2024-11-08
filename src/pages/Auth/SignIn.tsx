import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { Link } from "react-router-dom";

interface SignInProps {
  username: string;
  email: string;
  password: string;
  checkPassword: string;
}

const SignIn: React.FC = () => {
  const [isPasswordMatch, setIsPasswordMatch] = React.useState<boolean>(false);
  const [hasTypedConfirmPassword, setHasTypedConfirmPassword] =
    React.useState<boolean>(false);
  const [signInInfo, setSignInInfo] = React.useState<SignInProps>({
    username: "",
    email: "",
    password: "",
    checkPassword: "",
  });

  const handleChange =
    (prop: keyof SignInProps) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setSignInInfo((prevInfo) => {
        const updatedInfo = { ...prevInfo, [prop]: value };

        if (prop === "checkPassword") {
          setHasTypedConfirmPassword(true);
        }

        // Check if passwords match whenever either password field changes
        if (prop === "password" || prop === "checkPassword") {
          setIsPasswordMatch(
            updatedInfo.password === updatedInfo.checkPassword
          );
        }

        return updatedInfo;
      });
    };
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="bg-[#fff] shadow-md p-8 rounded-lg w-9/12 h-fit">
          <div className="grid grid-cols-2">
            <div className="col-span-1">
              <img
                src="/assets/images/treatment2.png"
                alt="Login"
                className="w-full h-fit"
              />
            </div>
            <div className="col-span-1 ms-5">
              <div className="flex justify-end me-3">
                <img
                  src="/assets/images/medpal.png"
                  alt="Medpal"
                  className="w-3/12"
                />
              </div>
              <div className="mt-10">
                <h1 className="text-4xl font-bold text-center">
                  Create an Account
                </h1>
                <div className="mt-10 space-y-4 px-16">
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="email">Full name</InputLabel>
                    <OutlinedInput
                      id="username"
                      type="text"
                      value={signInInfo.username}
                      onChange={handleChange("username")}
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountCircleIcon />
                        </InputAdornment>
                      }
                      label="Username"
                      placeholder="Full name"
                    />
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <OutlinedInput
                      id="email"
                      type="email"
                      value={signInInfo.email}
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
                      value={signInInfo.password}
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
                  <FormControl fullWidth variant="outlined">
                    <InputLabel
                      htmlFor="checkPassword"
                      error={!isPasswordMatch && hasTypedConfirmPassword}
                    >
                      Confirm Password
                    </InputLabel>
                    <OutlinedInput
                      id="checkPassword"
                      type="password"
                      value={signInInfo.checkPassword}
                      onChange={handleChange("checkPassword")}
                      startAdornment={
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      }
                      endAdornment={
                        !isPasswordMatch &&
                        hasTypedConfirmPassword && (
                          <InputAdornment position="end">
                            <WarningIcon color="error" />
                          </InputAdornment>
                        )
                      }
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      error={!isPasswordMatch && hasTypedConfirmPassword} // Turns the input border red if passwords don't match
                    />
                  </FormControl>
                  <button
                    className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out w-full"
                    type="submit"
                  >
                    Log in
                  </button>
                </div>
                <div className="mt-8 flex justify-center">
                  <span className="gap-2">
                    Already a member?{" "}
                    <Link
                      to="/login"
                      className="text-[#2495c3] hover:text-[#64BFE3] transition duration-300 ease-in-out"
                    >
                      Log in
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
