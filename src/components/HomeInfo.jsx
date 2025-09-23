import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";

const baseBoxClasses = "inline-block w-max max-w-[90vw] bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-white";

const HomeInfo = ({ currentStage }) => {
  if (currentStage === 1)
    return (
      <h1 className={`${baseBoxClasses} sm:text-xl sm:leading-snug text-center neo-brutalism-blue`}>
        Hi, I'm
        <span className="font-semibold mx-2 text-white">Phuc Nhan</span>
        👋
        <br />
        A Computer Scientist
      </h1>
    );

  if (currentStage === 2) {
    return (
      <div className={`${baseBoxClasses} text-center`}>
        <p className="font-medium sm:text-lg">
          Study at <br /> Ho Chi Minh City University of Technology
        </p>
      </div>
    );
  }

  if (currentStage === 3) {
    return (
      <div className={`${baseBoxClasses} text-center space-y-3`}>
        <p className="font-medium sm:text-lg">
          I have worked on many projects and participated in research at the academic club and laboratory.
          <br />
          Curious about the impact?
        </p>

        <Link to="/projects" className="neo-brutalism-white neo-btn-small inline-flex items-center gap-1 px-1 py-1 text-xs">
          Visit my portfolio
          <img src={arrow} alt="arrow" className="w-2 h-2 object-contain" />
        </Link>
      </div>
    );
  }

  if (currentStage === 4) {
    return (
      <div className={`${baseBoxClasses} text-center space-y-3`}>
        <p className="font-medium sm:text-lg">
          Are you looking for a passionate employee, a friendly partner or a professional mentor? <br /> I'm just a few keystrokes away.
        </p>

        <Link to="/contact" className="neo-brutalism-white neo-btn-small inline-flex items-center gap-1 px-1 py-1 text-xs">
          Let's talk
          <img src={arrow} alt="arrow" className="w-4 h-4 object-contain" />
        </Link>
      </div>
    );
  }

  if (currentStage === 5) {
    return (
      <div className={`${baseBoxClasses} text-center inline-flex items-center gap-2`}>
        <p className="font-medium sm:text-lg inline-block m-0">
          Truong Sa, Hoang Sa belong to Viet Nam
        </p>
        <svg className="inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24" fillRule="evenodd" strokeWidth="1">
          <path fill="#da251d" d="M0 0h640v480H0z" />
          <path fill="#ff0" d="m320 69.397 42.852 131.905h138.642l-112.258 81.606 42.903 131.695-112.139-81.777-112.028 81.896 42.834-131.696-112.25-81.605h138.526L320 69.397z" />
        </svg>
      </div>
    );
  }

  return null;
};

export default HomeInfo;
