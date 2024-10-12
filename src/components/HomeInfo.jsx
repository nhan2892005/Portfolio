import { Link } from "react-router-dom";

import { arrow } from "../assets/icons";

const HomeInfo = ({ currentStage }) => {
  if (currentStage === 1)
    return (
      <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
        Hi, I'm
        <span className='font-semibold mx-2 text-white'>Phuc Nhan</span>
        👋
        <br />
        A Computer Scientist
      </h1>
    );

  if (currentStage === 2) {
    return (
      <div className='info-box text-center'>
        <p className='font-medium sm:text-xl inline-block' style={{ marginRight: '8px' }}>
          Trường Sa, Hoàng Sa là của Việt Nam
        </p>
        <svg className='inline-block' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="32" height="32">
          <g fill-rule="evenodd" stroke-width="1pt">
            <path fill="#da251d" d="M0 0h640v480H0z"/>
            <path fill="#ff0" d="m320 69.397 42.852 131.905h138.642l-112.258 81.606 42.903 131.695-112.139-81.777-112.028 81.896 42.834-131.696-112.25-81.605h138.526L320 69.397z"/>
          </g>
        </svg>
      </div>
    );
  }

  if (currentStage === 3) {
    return (
      <div className='info-box'>
        <p className='font-medium text-center sm:text-xl'>
          I have worked on many projects and participated in research at the academic club and laboratory <br /> Curious about the impact?
        </p>

        <Link to='/projects' className='neo-brutalism-white neo-btn'>
          Visit my portfolio
          <img src={arrow} alt='arrow' className='w-4 h-4 object-contain' />
        </Link>
      </div>
    );
  }

  if (currentStage === 4) {
    return (
      <div className='info-box'>
      <p className='font-medium sm:text-xl text-center'>
      Are you looking for <br/> a passionate employee, <br/> a friendly partner <br/> or a professional mentor? <br/> I'm just a few keystrokes away.
      </p>

      <Link to='/contact' className='neo-brutalism-white neo-btn'>
        Let's talk
        <img src={arrow} alt='arrow' className='w-4 h-4 object-contain' />
      </Link>
    </div>
    );
  }

  if (currentStage === 5) {
    return (
      <div className='info-box flex items-center justify-center'>
        <p className='font-medium sm:text-xl text-center mr-2 inline-block'>
          Truong Sa, Hoang Sa belong to Viet Nam
        </p>
        <svg className='inline-block' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="32" height="32">
          <g fill-rule="evenodd" stroke-width="1pt">
            <path fill="#da251d" d="M0 0h640v480H0z"/>
            <path fill="#ff0" d="m320 69.397 42.852 131.905h138.642l-112.258 81.606 42.903 131.695-112.139-81.777-112.028 81.896 42.834-131.696-112.25-81.605h138.526L320 69.397z"/>
          </g>
        </svg>
      </div>
    );
  }

  return null;
};

export default HomeInfo;
