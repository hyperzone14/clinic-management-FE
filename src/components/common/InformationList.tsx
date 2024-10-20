import React from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface BookingInformationProps {
  name?: string;
  service?: string;
  type?: string;
  date?: string;
  time?: string;
  price?: string;
}

const InformationList: React.FC<BookingInformationProps> = ({
  name = "N/A",
  service = "N/A",
  type = "N/A",
  date = "N/A",
  time = "N/A",
  price = "N/A",
}) => {
  return (
    <>
      <div className="w-[430px] h-fit bg-[#fff] rounded-[15px] bg-gray-50 rounded-md shadow-md">
        <div className="w-full h-fit px-5 py-6 bg-[#87ceeb] rounded-t-[15px]">
          <div className="flex items-center justify-center">
            <FaFileInvoiceDollar className="w-7 h-7" />
            <span className="ms-5 font-bold text-3xl">Booking information</span>
          </div>
        </div>
        <div className="w-full text-[20px] px-5 py-7">
          <dl className="space-y-4">
            <div className="flex justify-between mb-2">
              <dt className="font-semibold">Name:</dt>
              <dd>{name || "N/A"}</dd>
            </div>
            <div className="flex justify-between mb-2">
              <dt className="font-semibold">Service:</dt>
              <dd>{service || "N/A"}</dd>
            </div>
            <div className="flex justify-between mb-2">
              {service === "By doctor" ? (
                <dt className="font-semibold">Doctor:</dt>
              ) : (
                <dt className="font-semibold">Specialty:</dt>
              )}
              <dd>{type || "N/A"}</dd>
            </div>
            <div className="flex justify-between mb-2">
              <dt className="font-semibold">Date:</dt>
              <dd>{date || "N/A"}</dd>
            </div>
            <div className="flex justify-between mb-2">
              <dt className="font-semibold">Time:</dt>
              <dd>{time || "N/A"}</dd>
            </div>
            <div className="flex justify-between mb-2">
              <dt className="font-semibold">Price:</dt>
              <dd>{price ? `${price} VNĐ` : "N/A"}</dd>
            </div>
          </dl>
          <hr className="my-4 border-gray-300" />
          <div className="flex justify-between font-bold">
            <dt>Total:</dt>
            <dd>{price ? `${price} VNĐ` : "N/A"}</dd>
          </div>
          <div className="mt-4 flex justify-between font-bold">
            <dt>Note:</dt>
            <dd className="text-right">
              {name ? `${name}, ` : ""}
              {service ? `${service}, ` : ""}
              {type ? `${type}, ` : ""}
              {date ? `${date}, ` : ""}
              {time ? `${time}, ` : ""}
              {price ? `${price} VNĐ` : ""}
            </dd>
          </div>
        </div>
      </div>
    </>
  );
};

export default InformationList;
