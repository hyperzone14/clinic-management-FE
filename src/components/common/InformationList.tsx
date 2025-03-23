import { RootState } from "../../redux/store";
import React, { useCallback, useEffect } from "react";
import { IoNewspaperOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { setInfoList } from "../../redux/slices/infoListSlice";
import { fetchUsers } from "../../redux/slices/userManageSlice";
// import { setAppointments } from "../../redux/slices/scheduleSlice";

interface InformationListProps {
  patientId?: string | null;
}

const InformationList: React.FC<InformationListProps> = ({ patientId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const infoList = useSelector((state: RootState) => state.infoList);
  const users = useSelector((state: RootState) => state.userManage.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const patientIdNum = Number(patientId);

    if (!patientIdNum) {
      return;
    }

    if (!Array.isArray(users) || users.length === 0) {
      return;
    }

    const patient = users.find((user) => Number(user?.id) === patientIdNum);
    if (patient?.fullName && patient.fullName !== infoList.name) {
      dispatch(
        setInfoList({
          ...infoList,
          patientId: patientIdNum,
          name: patient.fullName,
        })
      );
    }
  }, [infoList.patientId, users, dispatch, infoList.name, patientId, infoList]);

  // Format price with dots for thousands
  const formatPrice = (price: string | undefined): string => {
    if (!price || price === "N/A") return "N/A";
    const cleanPrice = price.replace(/[.,\s]/g, "");
    return cleanPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (date: null | Date | string): string => {
    if (!date) return "N/A";

    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const day = String(parsedDate.getDate()).padStart(2, "0");
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const year = parsedDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    return "N/A";
  };

  const generateNote = useCallback(() => {
    return [
      infoList.name,
      infoList.service,
      infoList.type,
      infoList.date ? formatDate(infoList.date) : "N/A",
      infoList.time,
      infoList.price !== "N/A" ? `${formatPrice(infoList.price)} VNĐ` : null,
    ]
      .filter((item) => item && item !== "N/A")
      .join(", ");
  }, [
    infoList.name,
    infoList.service,
    infoList.type,
    infoList.date,
    infoList.time,
    infoList.price,
  ]);

  // Separate effect for note updates
  useEffect(() => {
    const newNote = generateNote();
    if (newNote !== infoList.note) {
      dispatch(
        setInfoList({
          ...infoList,
          note: newNote,
        })
      );
    }
  }, [dispatch, generateNote, infoList, infoList.note]);

  return (
    <div className='w-[430px] h-fit bg-gray-50 rounded-md shadow-md'>
      <div className='w-full h-fit px-5 py-6 bg-[#87ceeb] rounded-t-md'>
        <div className='flex items-center justify-center'>
          <IoNewspaperOutline className='w-10 h-10' />
          <span className='ms-5 font-bold text-3xl'>Booking information</span>
        </div>
      </div>
      <div className='w-full text-[20px] px-5 py-7'>
        <dl className='space-y-4'>
          <div className='flex justify-between mb-2'>
            <dt className='font-semibold'>Name:</dt>
            <dd>{infoList.name ?? "N/A"}</dd>
          </div>
          <div className='flex justify-between mb-2'>
            <dt className='font-semibold'>Service:</dt>
            <dd>{infoList.service ?? "N/A"}</dd>
          </div>
          <div className='flex justify-between mb-2'>
            {infoList.service === "By doctor" ? (
              <dt className='font-semibold'>Doctor:</dt>
            ) : (
              <dt className='font-semibold'>Department:</dt>
            )}
            <dd>{infoList.type ?? "N/A"}</dd>
          </div>
          <div className='flex justify-between mb-2'>
            <dt className='font-semibold'>Date:</dt>
            <dd>{infoList.date ? formatDate(infoList.date) : "N/A"}</dd>
          </div>
          <div className='flex justify-between mb-2'>
            <dt className='font-semibold'>Time:</dt>
            <dd>{infoList.time ?? "N/A"}</dd>
          </div>
          <div className='flex justify-between mb-2'>
            <dt className='font-semibold'>Price:</dt>
            <dd>
              {infoList.price !== "N/A"
                ? `${formatPrice(infoList.price)} VNĐ`
                : "N/A"}
            </dd>
          </div>
        </dl>
        <hr className='my-4 border-gray-300' />
        <div className='flex justify-between font-bold'>
          <dt>Total:</dt>
          <dd>
            {infoList.price !== "N/A"
              ? `${formatPrice(infoList.price)} VNĐ`
              : "N/A"}
          </dd>
        </div>
        <div className='mt-4 flex justify-between font-bold'>
          <dt>Note:</dt>
          <dd className='text-right'>{generateNote()}</dd>
        </div>
      </div>
    </div>
  );
};

export default InformationList;
