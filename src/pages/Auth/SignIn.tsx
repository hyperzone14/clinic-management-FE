import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import WarningIcon from "@mui/icons-material/Warning";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import { setSigninProfile } from "../../redux/slices/signinProfileSlice";
import { FormHelperText } from "@mui/material";
// import { sign } from "crypto";

interface SignInProps {
  username: string;
  email: string;
  password: string;
  checkPassword: string;
}

const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isPasswordMatch, setIsPasswordMatch] = React.useState<boolean>(false);
  const [hasTypedConfirmPassword, setHasTypedConfirmPassword] =
    React.useState<boolean>(false);
  const [formErrors, setFormErrors] = React.useState<Partial<SignInProps>>({});
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

  const validateForm = (): boolean => {
    const errors: Partial<SignInProps> = {};
    let isValid = true;

    // Check for empty fields
    if (!signInInfo.username.trim()) {
      errors.username = "Full name is required";
      isValid = false;
    }

    if (!signInInfo.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signInInfo.email)) {
        errors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (!signInInfo.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    if (!signInInfo.checkPassword) {
      errors.checkPassword = "Please confirm your password";
      isValid = false;
    } else if (signInInfo.password !== signInInfo.checkPassword) {
      errors.checkPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(
        setSigninProfile({
          fullName: signInInfo.username,
          email: signInInfo.email,
          password: signInInfo.password,
        })
      );
      navigate("/user-information");
    }
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
                <form onSubmit={handleSubmit}>
                  <div className="mt-10 space-y-4 px-16">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.username}
                    >
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
                      {formErrors.username && (
                        <FormHelperText error>
                          {formErrors.username}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.email}
                    >
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
                      {formErrors.email && (
                        <FormHelperText error>
                          {formErrors.email}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.password}
                    >
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
                      {formErrors.password && (
                        <FormHelperText error>
                          {formErrors.password}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.checkPassword}
                    >
                      <InputLabel htmlFor="checkPassword">
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
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        error={!isPasswordMatch && hasTypedConfirmPassword} // Turns the input border red if passwords don't match
                      />
                      {formErrors.checkPassword && (
                        <FormHelperText error>
                          Passwords do not match. Please try again.
                        </FormHelperText>
                      )}
                    </FormControl>
                    <button
                      className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out w-full"
                      type="submit"
                    >
                      Create an Account
                    </button>
                  </div>
                </form>
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
