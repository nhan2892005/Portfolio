import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import { CTA } from "../components";
import { experiences, research_experiences } from "../constants";
import SkillsGroup from "../components/SkillsGroup";
import ExperienceGroup from "../components/ExperienceGroup";
import { frontendsk, backendsk, database, svc_cicd, os, big_data, data_visualize, cloud } from "../constants";

import "react-vertical-timeline-component/style.min.css";

const About = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        Hello, I'm{" "}
        <span className='blue-gradient_text font-semibold drop-shadow'>
          {" "}
          Phuc Nhan
        </span>{" "}
        👋
      </h1>

      <div className='mt-5 flex flex-col gap-3 text-slate-500'>
        <p>
          Study for Bachelor of Computer Science 
          at Ho Chi Minh City University of Technology.
        </p>
      </div>

      <div className='py-10 flex flex-col'>
        <h3 className='subhead-text'>My Skills</h3>
        <SkillsGroup title="Frontend" skills={frontendsk} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
          <SkillsGroup title="Backend" skills={backendsk} />
          <SkillsGroup title="Database" skills={database} />
          <SkillsGroup title="CI/CD" skills={svc_cicd} />
          <SkillsGroup title="OS" skills={os} />
          <SkillsGroup title="Data Engineering" skills={big_data} />
          <SkillsGroup title="Data Visualize" skills={data_visualize} />
        </div>
        <SkillsGroup title="Cloud" skills={cloud} />
      </div>

      <div className='py-16'>
        <ExperienceGroup title="Research Experiences" experiences={research_experiences} />
        <ExperienceGroup title="Work Experiences" experiences={experiences} />
      </div>

      <hr className='border-slate-200' />

      <CTA />
    </section>
  );
};

export default About;
