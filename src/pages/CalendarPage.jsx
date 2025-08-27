import React from 'react';
import { ModernCalendar } from '../components';

const CalendarPage = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        <span className='blue-gradient_text font-semibold drop-shadow'>
          Calendar
        </span>
      </h1>
      
      <div className='mt-5 flex flex-col gap-3 text-slate-500'>
        <p>
          My schedule and events.
        </p>
      </div>

      <div className='mt-10 w-full bg-white rounded-lg shadow-lg p-6'>
        <ModernCalendar />
      </div>
    </section>
  );
};

export default CalendarPage;
