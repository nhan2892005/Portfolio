import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

const PublicationsGroup = ({ title, publications }) => {
  return (
    <div className="py-16">
      <h3 className="subhead-text">{title}</h3>
      <div className="mt-12 flex">
        <VerticalTimeline>
          {publications.map((pub, index) => (
            <VerticalTimelineElement
              key={`pub-${index}`}
              date={pub.year}
              iconStyle={{ background: pub.iconBg || "#4B5563", color: "#fff" }}
              icon={
                <div className="flex justify-center items-center w-full h-full text-white font-bold">
                  {pub.icon || "📄"}
                </div>
              }
              contentStyle={{
                borderBottom: "8px solid " + (pub.iconBg || "#4B5563"),
                boxShadow: "none",
              }}
            >
              <div>
                <h3 className="text-black text-lg font-poppins font-semibold">
                  {pub.title}
                </h3>
                <p
                  className="text-black-500 font-medium text-base"
                  style={{ margin: 0 }}
                >
                  {pub.authors}
                </p>
                <p className="text-gray-600 italic text-sm">{pub.venue}</p>
              </div>

              {pub.abstract && (
                <p className="mt-3 text-black-500/70 text-sm">{pub.abstract}</p>
              )}

              {pub.doi && (
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 block"
                >
                  DOI: {pub.doi}
                </a>
              )}
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

export default PublicationsGroup;
