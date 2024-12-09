import { useNavigate } from "react-router-dom";

const NotPermitted = () => {
  const nav = useNavigate();

  const backToPage = () => {
    nav(-1);
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
        <h1 className="text-2xl font-bold text-red-600">
          You are not allowed to access this page.
        </h1>
        <button
          className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out text-xl mt-5"
          onClick={backToPage}
        >
          Back
        </button>
      </div>
    </>
  );
};

export default NotPermitted;
