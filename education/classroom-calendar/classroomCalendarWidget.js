(function() {
  const events = [
    { date: '2023-11-01', description: 'Math Test', emoji: '📝' },
    { date: '2023-11-10', description: 'Science Project Due', emoji: '🔬' },
    { date: '2023-11-15', description: 'John\'s Birthday', emoji: '🎂' },
    { date: '2023-11-20', description: 'Field Trip', emoji: '🚌' },
    { date: '2023-11-25', description: 'Thanksgiving Break', emoji: '🦃' }
  ];

  const today = new Date().toISOString().split('T')[0];

  const eventToday = events.find(event => event.date === today);

  const calendarWidget = document.getElementById('calendar-widget');
  if (calendarWidget) {
    if (eventToday) {
      calendarWidget.innerHTML = `
        <div style="font-family: 'Arial', sans-serif; margin: 20px; padding: 10px; border: 1px solid #ccc;">
          <p style="font-size: 1.2em;">${eventToday.emoji} ${eventToday.description}</p>
        </div>
      `;
    } else {
      calendarWidget.innerHTML = `
        <div style="font-family: 'Arial', sans-serif; margin: 20px; padding: 10px; border: 1px solid #ccc;">
          <p style="font-size: 1.2em;">No special events today.</p>
        </div>
      `;
    }
  }
})(); 