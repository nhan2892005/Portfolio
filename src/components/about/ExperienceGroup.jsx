import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

const ExperienceGroup = ({ title, experiences }) => {
  return (
    <div className='py-16'>
      <h3 className='subhead-text'>{title}</h3>
      <div className='mt-12 flex'>
        <VerticalTimeline>
          {experiences.map((experience, index) => (
            <VerticalTimelineElement
              key={experience.company_name}
              date={experience.date}
              iconStyle={{ background: experience.iconBg }}
              icon={
                <div className='flex justify-center items-center w-full h-full'>
                  <img
                    src={experience.icon}
                    alt={experience.company_name}
                    className='w-[70%] h-[70%] object-contain'
                  />
                </div>
              }
              contentStyle={{
                borderBottom: "8px",
                borderStyle: "solid",
                borderBottomColor: experience.iconBg,
                boxShadow: "none",
              }}
            >
              <div>
                <h3 className='text-black text-xl font-poppins font-semibold'>
                  {experience.title}
                </h3>
                <p
                  className='text-black-500 font-medium text-base'
                  style={{ margin: 0 }}
                >
                  {experience.company_name}
                </p>
              </div>

              <ul className='my-5 list-disc ml-5 space-y-2'>
                {experience.points.map((point, index) => (
                  <li
                    key={`experience-point-${index}`}
                    className='text-black-500/50 font-normal pl-1 text-sm'
                  >
                    {point}
                  </li>
                ))}
              </ul>

              {experience.link && (
                <a
                  href={`${experience.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 block"
                >
                  Click here to view
                </a>
              )}
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

export default ExperienceGroup;
