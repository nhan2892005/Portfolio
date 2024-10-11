import { Link } from "react-router-dom";

import { CTA } from "../components";
import { projects } from "../constants";
import { arrow } from "../assets/icons";

const Projects = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        My{" "}
        <span className='blue-gradient_text drop-shadow font-semibold'>
          Projects
        </span>
      </h1>

      <p className='text-slate-500 mt-2 leading-relaxed'>
      Over the course of my academic journey and personal development, I’ve worked on a range of impactful projects.
      Many of these projects are open-source, so if you find something interesting, feel free to explore the codebase or contribute ideas for further improvement. 
      I highly appreciate any collaboration!
      </p>

      <div className='flex flex-wrap my-20 gap-16'>
        {projects.map((project) => (
          <div className='lg:w-[400px] w-full' key={project.name}>
            <div className='block-container w-12 h-12'>
              <div className={`btn-back rounded-xl ${project.theme}`} />
              <div className='btn-front rounded-xl flex justify-center items-center'>
                <img
                  src={project.iconUrl}
                  alt={project.name}
                  className='w-3/2 h-3/2 object-contain'
                />
              </div>
            </div>

            <div className='mt-5 flex flex-col'>
              <h4 className='text-2xl font-poppins font-semibold'>
                {project.name}
              </h4>
              <p className='mt-2 text-slate-500'>{project.description}</p>
              <div className='mt-5 flex items-center gap-2 font-poppins'>
                <a
                  href={project.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-semibold text-blue-600'
                >
                  View Project
                </a>
                <img
                  src={arrow}
                  alt='arrow'
                  className='w-4 h-4 object-contain'
                />
              </div>
              <div className='mt-5 flex items-center gap-2 font-poppins'>
                {project.livesite !== "" && (
                  <>
                    <a
                      href={project.livesite}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-semibold text-blue-600'
                    >
                      Deployed here
                    </a>
                    <img
                      src={arrow}
                      alt='arrow'
                      className='w-4 h-4 object-contain'
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className='border-slate-200' />

      <CTA />
    </section>
  );
};

export default Projects;
