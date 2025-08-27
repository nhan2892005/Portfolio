import React from "react";

const SkillsGroup = ({ title, skills }) => {
  return (
    <div className='mb-8'>
      <h3 className='text-xl font-bold mb-4'>{title}</h3>
      <div className='flex flex-wrap gap-12'>
        {skills.map((skill) => (
          <div className='block-container w-20 h-20' key={skill.name}>
            <div className='btn-back rounded-xl' />
            <div className='btn-front rounded-xl flex justify-center items-center'>
              <img
                src={skill.imageUrl}
                alt={skill.name}
                className='w-1/2 h-1/2 object-contain'
              />
            </div>
            <p className='text-center mt-2 font-semibold'>{skill.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsGroup;
