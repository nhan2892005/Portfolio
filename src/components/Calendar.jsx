import { useState, useEffect } from 'react';

export default function ModernCalendar({
  calendars = [
    {
      id: 'nhan.nguyen2005phuyen@hcmut.edu.vn',
      timezone: 'Asia/Ho_Chi_Minh',
      embedUrl:
        'https://calendar.google.com/calendar/embed?src=nhan.nguyen2005phuyen%40hcmut.edu.vn&ctz=Asia%2FHo_Chi_Minh',
      icalUrl:
        'https://calendar.google.com/calendar/ical/nhan.nguyen2005phuyen%40hcmut.edu.vn/public/basic.ics',
      color: '#3c78d8',
    },
    {
      id: 'c_6b237cf1cd4d3919fd7706e17beeaf9c05de6180675f73ab3240d6f679ac5edf@group.calendar.google.com',
        timezone: 'Asia/Ho_Chi_Minh',
        embedUrl:
        'https://calendar.google.com/calendar/embed?src=c_6b237cf1cd4d3919fd7706e17beeaf9c05de6180675f73ab3240d6f679ac5edf%40group.calendar.google.com&ctz=Asia%2FHo_Chi_Minh',
        icalUrl:
        'https://calendar.google.com/calendar/ical/c_6b237cf1cd4d3919fd7706e17beeaf9c05de6180675f73ab3240d6f679ac5edf%40group.calendar.google.com/public/basic.ics',
        color: '#d83c78',
    },
  ],
}) {
  const [view, setView] = useState('embed'); // 'custom' | 'embed'

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden relative">
      {/* Toggle View */}
      <div className="p-4 bg-blue-600 text-white flex justify-between">
        <h2 className="text-xl font-bold">My Calendars</h2>
        <div className="space-x-2">
          <button
            className={`${view==='custom'? 'bg-white text-blue-600':'bg-white/20'} px-3 py-1 rounded`}
            onClick={()=>setView('custom')}
          >Grid</button>
          <button
            className={`${view==='embed'? 'bg-white text-blue-600':'bg-white/20'} px-3 py-1 rounded`}
            onClick={()=>setView('embed')}
          >Embed</button>
        </div>
      </div>

      {view==='embed' ? (
        <div className="aspect-[4/3]">
          <iframe
            src={`https://calendar.google.com/calendar/embed?${calendars.map(cal => 
              `src=${encodeURIComponent(cal.id)}`).join('&')}&ctz=Asia%2FHo_Chi_Minh`}
            style={{ border:0, width:'100%', height:'100%' }}
            frameBorder="0"
            scrolling="no"
            title="Combined Calendars"
          />
        </div>
      ) : (
        <>
        </>
      )}
    </div>
  );
}
