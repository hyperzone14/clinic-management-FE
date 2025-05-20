import "./App.css";
import "./utils/sockjs-polyfills";
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
  // bookingRoutes,
  // dashboardRoutes,
  adminRoutes,
  prescriptionRoutes,
} from "./utils/pageRoutes";
import React, { Suspense, lazy } from "react";
// import Booking from "./pages/Booking";
import NotFound from "./pages/error/NotFound";
// import Dashboard from "./pages/Dashboard";
import { Provider } from "react-redux";
import store from "./redux/store";
import AdminSideBar from "./components/layout/AdminSideBar";
import Chatbot from "./components/layout/Chatbot";
import { ProtectedRoute } from "./utils/security/components/ProtectedRoute";
import NotPermitted from "./pages/Adminpages/NotPermitted";
import { AuthService } from "./utils/security/services/AuthService";
import Prescription from "./pages/Prescription";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConditionalChatbot: React.FC = () => {
  const userRole = AuthService.getRolesFromToken();
  const hasPatientRole = userRole.includes("ROLE_PATIENT");
  return hasPatientRole ? <Chatbot /> : null;
};

// Layout wrapper component for pages that need header and footer
const MainLayout: React.FC = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow mx-[11rem]'>
        <Outlet />
      </main>
      <ConditionalChatbot />
      <BackToTop />
      <Footer />
    </div>
  );
};

// Layout wrapper for auth pages without header and footer
const AuthLayout: React.FC = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#efffeb]'>
      <main className='w-full'>
        <Outlet />
      </main>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className='flex min-h-screen bg-[#f7f7f7]'>
      <AdminSideBar />
      <main className='w-4/5 py-4 mx-32 flex-grow'>
        <Outlet />
      </main>
    </div>
  );
};

// Lazy load auth pages
const SignIn = lazy(() => import("./pages/Auth/SignIn"));
const Login = lazy(() => import("./pages/Auth/LogIn"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgetPassword"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

// Automatically import all page components
const pageComponents = import.meta.glob(["./pages/*.tsx", "./pages/**/*.tsx"]);

function App() {
  return (
    <Provider store={store}>
      <ToastContainer />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className='flex items-center justify-center'>Loading...</div>
          }
        >
          <Routes>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path='/admin' element={<AdminLayout />}>
                {/* The dashboard is now directly at /admin */}
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
                        <ProtectedRoute roles={route.roles}>
                          <Suspense fallback={<div>Loading admin page...</div>}>
                            <AdminComponent />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                  );
                })}
              </Route>
            </Route>

            {/* Not Permitted Route */}
            <Route
              path='/admin/not-permitted'
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <NotPermitted />
                </Suspense>
              }
            />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route
                path='/sign-in'
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <SignIn />
                  </Suspense>
                }
              />
              <Route
                path='/login'
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path='/forgot-password'
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <ForgotPassword />
                  </Suspense>
                }
              />
              <Route
                path='/payment-success'
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <PaymentSuccess />
                  </Suspense>
                }
              />
            </Route>

            {/* Main App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Page Routes */}
                {pageRoutes.map((route) => {
                  if (route.children) {
                    return (
                      <Route key={route.id} path={route.path}>
                        {/* Index route (list view) */}
                        <Route
                          index
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              {React.createElement(
                                lazy(
                                  () =>
                                    pageComponents[
                                      `./pages/${route.location}.tsx`
                                    ]() as Promise<{
                                      default: React.ComponentType<unknown>;
                                    }>
                                )
                              )}
                            </Suspense>
                          }
                        />

                        {/* Child routes (detail view) */}
                        {route.children.map((child) => {
                          const ChildComponent = lazy(
                            () =>
                              pageComponents[
                                `./pages/${child.location}.tsx`
                              ]() as Promise<{
                                default: React.ComponentType<unknown>;
                              }>
                          );

                          return (
                            <Route
                              key={child.id}
                              path=':id'
                              element={
                                <Suspense fallback={<div>Loading...</div>}>
                                  <ChildComponent />
                                </Suspense>
                              }
                            />
                          );
                        })}
                      </Route>
                    );
                  }
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
                {/* <Route element={<ProtectedRoute />}>
                  <Route
                    path="/booking"
                    element={<Booking steps={bookingRoutes} />}
                  >
                    <Route
                      index
                      element={
                        <Navigate
                          to={`/booking/${bookingRoutes[0].path
                            .split("/")
                            .pop()}`}
                          replace
                        />
                      }
                    />
                    {bookingRoutes.map((step) => {
                      const StepComponent = lazy(() => {
                        return pageComponents[
                          `./pages/Bookingpages/${step.location}.tsx`
                        ]() as Promise<{
                          default: React.ComponentType<unknown>;
                        }>;
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
                </Route> */}

                {/* Prescription Routes */}
                <Route
                  path='/prescription'
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
                <Route path='*' element={<NotFound />}>
                  <Route path='*' element={<Navigate to='/error' replace />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
