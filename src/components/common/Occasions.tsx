import React, { useEffect } from "react";
import { HiOutlineClock } from "react-icons/hi";
import { IoPersonCircleOutline } from "react-icons/io5";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../../styles/listingXEffect.css";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
] as const;

interface OccasionsProps {
  chosenDate: Date | null;
}

const Occasions: React.FC<OccasionsProps> = ({ chosenDate }) => {
  const events = useSelector(
    (state: RootState) => state.doctorEvents.doctorEvents
  );
  const [eventDate, setEventDate] = React.useState<string | null>(null);
  const today = new Date();
  const noEventsRef = React.useRef(null);
  const nodeRefs = events.reduce((acc, event) => {
    acc[event.id] = React.createRef<HTMLDivElement>();
    return acc;
  }, {} as Record<string, React.RefObject<HTMLDivElement>>);

  useEffect(() => {
    if (events && events.length > 0) {
      const date = events[0].day;
      setEventDate(date);
    }
  }, [events]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleTimeSlot = (timeSlot: string) => {
    const time = TIME_SLOTS.find((slot) => slot.timeSlot === timeSlot);
    return time?.time;
  };

  return (
    <div>
      <span className='font-bold text-lg'>
        Events for {chosenDate ? formatDate(chosenDate) : formatDate(today)}
      </span>
      <TransitionGroup component={null}>
        {chosenDate &&
        eventDate &&
        formatDate(chosenDate) === formatDate(new Date(eventDate)) ? (
          events.map((event) => (
            <CSSTransition
              key={event.id}
              timeout={500}
              nodeRef={nodeRefs[event.id]}
              classNames='fade-slide'
            >
              <div
                ref={nodeRefs[event.id]}
                className='mt-5 rounded-md text-white p-2'
                style={{ backgroundColor: event.color }}
              >
                <p className='font-bold'>{event.title}</p>
                <div className='flex mt-2'>
                  <IoPersonCircleOutline className='mt-1 me-2' />
                  <p className='text-md'>{event.patientName}</p>
                </div>
                <div className='flex my-2'>
                  <HiOutlineClock className='mt-1 me-2' />
                  <p className='text-md'>{handleTimeSlot(event.timeSlot)}</p>
                </div>
              </div>
            </CSSTransition>
          ))
        ) : (
          <CSSTransition
            key='no-events'
            timeout={500}
            nodeRef={noEventsRef}
            classNames='fade-slide'
          >
            <div
              ref={noEventsRef}
              className='mt-5 flex justify-center items-center'
            >
              <p className='text-[#a9a9a9]'>
                No events for{" "}
                {chosenDate ? formatDate(chosenDate) : formatDate(today)}
              </p>
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </div>
  );
};

export default Occasions;
