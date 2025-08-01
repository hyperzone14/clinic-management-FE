import React from "react";
import { PiUserCircleLight } from "react-icons/pi";
// import { useDispatch } from "react-redux";
// import { setProfile } from "../../redux/slices/profileSlice";
// import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// interface UserImageProps {
//   isEditing: boolean;
// }

interface UserImageProps {
  fullName?: string;
  id?: string;
}

const UserImage: React.FC<UserImageProps> = ({ fullName, id }) => {
  // const dispatch = useDispatch();
  // const [imageURL, setImageURL] = useState<string | null>(null);

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];

  //     // Check if MIME type is acceptable
  //     const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  //     if (!validImageTypes.includes(file.type)) {
  //       toast.error("Invalid file type. Please upload a valid image.");
  //       return;
  //     }

  //     // Read the file as binary to double-check if it’s an image
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
  //       let header = "";
  //       for (let i = 0; i < arr.length; i++) {
  //         header += arr[i].toString(16);
  //       }

  //       // Common file headers for images
  //       const imageHeaders = [
  //         "89504e47",
  //         "ffd8ffe0",
  //         "ffd8ffe1",
  //         "ffd8ffe2",
  //         "ffd8ffe3",
  //         "47494638",
  //       ];

  //       // Check if the file’s header matches a known image type
  //       if (!imageHeaders.includes(header)) {
  //         toast.error("Invalid file format. Please upload a valid image.");
  //         return;
  //       }

  //       // If valid, set the image
  //       const imageUrl = URL.createObjectURL(file);
  //       setImageURL(imageUrl); // Update state with the new image URL
  //       toast.success("Image has been uploaded!");
  //     };

  //     reader.readAsArrayBuffer(file); // Start reading the file
  //   }
  // };

  // useEffect(() => {
  //   dispatch(
  //     setProfile({
  //       imageURL: imageURL,
  //     })
  //   );
  // }, [dispatch, imageURL]);

  return (
    <>
      <div className='col-span-1 bg-[#fff] rounded-lg shadow-lg w-full h-fit'>
        <div className='flex flex-col justify-center items-center'>
          {/* Display the uploaded image or icon conditionally */}
          {/* {imageURL ? (
            <img
              src={imageURL}
              alt="Profile"
              className="w-24 h-24 rounded-full mt-5 mb-3 object-cover"
            />
          ) : ( */}
          <PiUserCircleLight
            size={80}
            className='bg-[#4567B7] text-white font-bold p-2 rounded-full mt-5 mb-3'
          />
          {/* )} */}
        </div>
        <div className='flex flex-col justify-center items-center'>
          <span className='text-lg font-bold mb-2'>{fullName}</span>
        </div>
        <div className='flex flex-col justify-center items-center mb-5'>
          <span className='text-sm text-gray-500'>ID: {id}</span>
        </div>

        {/* <div className="flex flex-col justify-center items-center mt-2 mb-7">
          Button to upload image
          <label htmlFor="imageUpload" className="cursor-pointer">
            <span
              className={`${
                isEditing
                  ? "bg-[#4567b7] hover:bg-[#3E5CA3]"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out`}
            >
              Update Image
            </span>
            {isEditing && (
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            )}
          </label>
        </div> */}
      </div>
    </>
  );
};

export default UserImage;
