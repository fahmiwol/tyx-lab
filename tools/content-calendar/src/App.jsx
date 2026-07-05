import React, { useState, useEffect } from 'react';

export default function ContentCalendar() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      const res = await fetch(`${process.env.VITE_GATEWAY_URL}/api/calendar/events?start=${start}&end=${end}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Content Calendar</h1>
      <div className="flex justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>Prev</button>
        <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>Next</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day} className="border rounded p-2 min-h-20 bg-gray-50">
            <div className="font-bold">{day}</div>
            {events.filter(e => new Date(e.date).getDate() === day).map(e => (
              <div key={e.id} className="text-xs bg-blue-100 rounded mt-1 p-1">{e.title}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
