import "./App.css";
import {
  Route,
  BrowserRouter,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { BackToTop } from "./components/layout/BackToTop";
import {
  pageRoutes,
  bookingRoutes,
  dashboardRoutes,
  prescriptionRoutes,
  adminRoutes,
} from "./utils/pageRoutes";
import React, { Suspense, lazy } from "react";
import Booking from "./pages/Booking";
import NotFound from "./pages/error/NotFound";
import Dashboard from "./pages/Dashboard";
import { Provider } from "react-redux";
import store from "./redux/store";
import Prescription from "./pages/Prescription";
import AdminSideBar from "./components/layout/AdminSideBar";

// Layout wrapper component for pages that need header and footer
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mx-[11rem]">
        <Outlet />
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
};

// Layout wrapper for auth pages without header and footer
const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#efffeb]">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <AdminSideBar />
      <main className="w-4/5 p-4">
        <Outlet />
      </main>
    </div>
  );
};

// Lazy load auth pages
const SignIn = lazy(() => import("./pages/Auth/SignIn"));
const Login = lazy(() => import("./pages/Auth/LogIn"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgetPassword"));

// Automatically import all page components
const pageComponents = import.meta.glob(["./pages/*.tsx", "./pages/**/*.tsx"]);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              {adminRoutes.map((route) => {
                const AdminComponent = lazy(() => {
                  return pageComponents[
                    `./pages/Adminpages/${route.location}.tsx`
                  ]() as Promise<{ default: React.ComponentType<unknown> }>;
                });
                return (
                  <Route
                    key={route.id}
                    path={route.path}
                    element={
                      <Suspense fallback={<div>Loading admin page...</div>}>
                        <AdminComponent />
                      </Suspense>
                    }
                  />
                );
              })}
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/sign-in"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <SignIn />
                  </Suspense>
                }
              />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <ForgotPassword />
                  </Suspense>
                }
              />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              {/* Page Routes */}
              {pageRoutes.map((route) => {
                const Component = lazy(() => {
                  return pageComponents[
                    `./pages/${route.location}.tsx`
                  ]() as Promise<{ default: React.ComponentType<unknown> }>;
                });
                return (
                  <Route
                    key={route.id}
                    path={route.path}
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Component />
                      </Suspense>
                    }
                  />
                );
              })}

              {/* Booking Routes */}
              <Route
                path="/booking"
                element={<Booking steps={bookingRoutes} />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      to={`/booking/${bookingRoutes[0].path.split("/").pop()}`}
                      replace
                    />
                  }
                />
                {bookingRoutes.map((step) => {
                  const StepComponent = lazy(() => {
                    return pageComponents[
                      `./pages/Bookingpages/${step.location}.tsx`
                    ]() as Promise<{ default: React.ComponentType<unknown> }>;
                  });
                  return (
                    <Route
                      key={step.id}
                      path={step.path.split("/").pop()}
                      element={
                        <Suspense fallback={<div>Loading step...</div>}>
                          <StepComponent />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Route>

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={<Dashboard steps={dashboardRoutes} />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      to={`/dashboard/${dashboardRoutes[0].path
                        .split("/")
                        .pop()}`}
                      replace
                    />
                  }
                />
                {dashboardRoutes.map((step) => {
                  const StepComponent = lazy(() => {
                    return pageComponents[
                      `./pages/Dashboardpages/${step.location}.tsx`
                    ]() as Promise<{ default: React.ComponentType<unknown> }>;
                  });
                  return (
                    <Route
                      key={step.id}
                      path={step.path.split("/").pop()}
                      element={
                        <Suspense fallback={<div>Loading step...</div>}>
                          <StepComponent />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Route>

              {/* Prescription Routes */}
              <Route
                path="/prescription"
                element={<Prescription steps={prescriptionRoutes} />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      to={`/prescription/${prescriptionRoutes[0].path
                        .split("/")
                        .pop()}`}
                      replace
                    />
                  }
                />
                {prescriptionRoutes.map((step) => {
                  const StepComponent = lazy(() => {
                    return pageComponents[
                      `./pages/Prescriptionpages/${step.location}.tsx`
                    ]() as Promise<{ default: React.ComponentType<unknown> }>;
                  });
                  return (
                    <Route
                      key={step.id}
                      path={step.path.split("/").pop()}
                      element={
                        <Suspense fallback={<div>Loading step...</div>}>
                          <StepComponent />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Route>

              {/* Not Found Route */}
              <Route path="*" element={<NotFound />}>
                <Route path="*" element={<Navigate to="/error" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
