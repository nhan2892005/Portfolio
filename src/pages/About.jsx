import { CTA } from "../components";
import { education, experiences, extracurricular_activities, licenses_and_certifications, research_experiences } from "../constants";
import SkillsGroup from "../components/about/SkillsGroup";
import ExperienceGroup from "../components/about/ExperienceGroup";
import { frontendsk, backendsk, database, svc_cicd, os, big_data, data_visualize, cloud, pro_lang } from "../constants";

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
        <SkillsGroup title="Programming Languages" skills={pro_lang} />
        <SkillsGroup title="Databases" skills={database} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 p-8">
          <SkillsGroup title="Frontend Framework" skills={frontendsk} />
          <SkillsGroup title="Backend Framework" skills={backendsk} />
          <SkillsGroup title="CI/CD" skills={svc_cicd} />
          <SkillsGroup title="OS" skills={os} />
          <SkillsGroup title="Data Engineering" skills={big_data} />
          <SkillsGroup title="Data Visualize" skills={data_visualize} />
          <SkillsGroup title="Cloud" skills={cloud} />
        </div>
      </div>

      <div className='py-16'>
        <ExperienceGroup title="Education" experiences={education} />
        <ExperienceGroup title="Research Experiences" experiences={research_experiences} />
        <ExperienceGroup title="Extracurricular Activities" experiences={extracurricular_activities} />
        <ExperienceGroup title="Licenses & certifications" experiences={licenses_and_certifications} />
        {/* <ExperienceGroup title="Work Experiences" experiences={experiences} /> */}
      </div>

      <hr className='border-slate-200' />

      <CTA />
    </section>
  );
};

export default About;
