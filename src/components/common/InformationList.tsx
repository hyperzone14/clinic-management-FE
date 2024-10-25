import { RootState } from "../../redux/store";
import React from "react";
import { IoNewspaperOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setBooking } from "../../redux/slices/bookingSlide";

const InformationList: React.FC = () => {
  const dispatch = useDispatch();
  const infoList = useSelector((state: RootState) => state.infoList);

  // Format price with dots for thousands
  const formatPrice = (price: string | undefined): string => {
    if (!price || price === "N/A") return "N/A";
    // Remove any existing dots and spaces
    const cleanPrice = price.replace(/[.,\s]/g, "");
    // Format with dots
    return cleanPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const note = [
    infoList.name,
    infoList.service,
    infoList.type,
    infoList.date,
    infoList.time,
    infoList.price !== "N/A" ? `${formatPrice(infoList.price)} VNĐ` : null,
  ]
    .filter((item) => item && item !== "N/A")
    .join(", ");

  dispatch(
    setBooking({
      service: infoList.service,
      type: infoList.type,
      date: infoList.date,
      time: infoList.time,
      price: formatPrice(infoList.price),
      note: note,
    })
  );

  return (
    <div className="w-[430px] h-fit bg-gray-50 rounded-md shadow-md">
      <div className="w-full h-fit px-5 py-6 bg-[#87ceeb] rounded-t-md">
        <div className="flex items-center justify-center">
          <IoNewspaperOutline className="w-10 h-10" />
          <span className="ms-5 font-bold text-3xl">Booking information</span>
        </div>
      </div>
      <div className="w-full text-[20px] px-5 py-7">
        <dl className="space-y-4">
          <div className="flex justify-between mb-2">
            <dt className="font-semibold">Name:</dt>
            <dd>{infoList.name ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between mb-2">
            <dt className="font-semibold">Service:</dt>
            <dd>{infoList.service ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between mb-2">
            {infoList.service === "By doctor" ? (
              <dt className="font-semibold">Doctor:</dt>
            ) : (
              <dt className="font-semibold">Specialty:</dt>
            )}
            <dd>{infoList.type ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between mb-2">
            <dt className="font-semibold">Date:</dt>
            <dd>{infoList.date ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between mb-2">
            <dt className="font-semibold">Time:</dt>
            <dd>{infoList.time ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between mb-2">
            <dt className="font-semibold">Price:</dt>
            <dd>
              {infoList.price !== "N/A"
                ? `${formatPrice(infoList.price)} VNĐ`
                : "N/A"}
            </dd>
          </div>
        </dl>
        <hr className="my-4 border-gray-300" />
        <div className="flex justify-between font-bold">
          <dt>Total:</dt>
          <dd>
            {infoList.price !== "N/A"
              ? `${formatPrice(infoList.price)} VNĐ`
              : "N/A"}
          </dd>
        </div>
        <div className="mt-4 flex justify-between font-bold">
          <dt>Note:</dt>
          <dd className="text-right">{note}</dd>
        </div>
      </div>
    </div>
  );
};

export default InformationList;
