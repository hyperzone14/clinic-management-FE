import React from "react";
import { Link } from "react-router-dom";
import { pageRoutes } from "../../utils/pageRoutes.ts";

export const Header = () => {
  return (
    <>
      <header className="bg-[#87ceeb]">
        <nav>
          <div className="flex justify-between items-center w-full p-5">
            <div className="logo">
              <Link to="/">
                <img
                  src="assets/images/medpal.png"
                  alt="Medpal"
                  className="w-2/12 ms-11"
                />
              </Link>
            </div>

            <div className="flex justify-center">
              <ul className="flex gap-10 me-10">
                {pageRoutes.map((route) => (
                  <li key={route.id}>
                    <Link
                      to={route.path}
                      className="font-bold font-['Inter'] text-lg hover:text-[#4567b7] hover:underline transition duration-50 ease-in-out"
                    >
                      {route.location}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-8">
              <button className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out w-28">
                Log in
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
