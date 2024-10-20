import React from "react";
import { titleSteps } from "../../utils/titleSteps";
import { PiUserCircleLight } from "react-icons/pi";

interface TitleProps {
  id: number;
}

const Title: React.FC<TitleProps> = ({ id }) => {
  const title = titleSteps.find((step) => step.id === id);

  if (!title) {
    return <div>Title not found</div>;
  }
  return (
    <>
      <div className="flex">
        <PiUserCircleLight className="w-16 h-16 text-[#34A85A]" />
        <div className="ms-3 flex flex-col justify-center">
          <h2 className="text-[#34A85A] font-bold text-3xl">{title.title}</h2>
          <span className="text-[#A9A9A9] text-md">{title.subTitle}</span>
        </div>
      </div>
    </>
  );
};

export default Title;
