// Dynamic greeting
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello Driver!";
  if (hour < 12) greeting = "Good morning! Have a safe trip 🚐";
  else if (hour < 18) greeting = "Good afternoon! Keep up the great work 🌞";
  else greeting = "Good evening! You’re almost done, stay safe 🌙";
  document.getElementById('greeting').innerText = greeting;
}

// Load trips
fetch('data.json')
  .then(res => res.json())
  .then(trips => {
    const container = document.getElementById('trip-container');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const select = document.getElementById('day-filter');

    // Collect unique days
    const days = [...new Set(trips.flatMap(t => t.StandingOrderDays.split(', ')))];
    days.forEach(day => {
      const opt = document.createElement('option');
      opt.value = day;
      opt.textContent = day;
      if (day === today) opt.selected = true;
      select.appendChild(opt);
    });

    function renderTrips(selectedDay) {
      container.innerHTML = "";
      trips
        .filter(t => t.StandingOrderDays.includes(selectedDay))
        .sort((a, b) => a.PickupTimeA.localeCompare(b.PickupTimeA))
        .forEach(trip => {
          const card = document.createElement('div');
          card.className = 'trip-card';
          let mobilityIcon = trip.MobilityType === "Wheelchair" ? "🦽" : "🚶";

          card.innerHTML = `
            <h3>${trip.StandingOrderDays} — ${trip.PickupTimeA}</h3>
            <p><strong>Pickup:</strong> ${trip.PickupAddress}</p>
            <p><strong>Dropoff:</strong> ${trip.DropOffAddress}</p>
            <p><strong>Mobility:</strong> ${mobilityIcon} ${trip.MobilityType}</p>
            <button onclick="window.open('https://www.google.com/maps/dir/${encodeURIComponent(trip.PickupAddress)}/${encodeURIComponent(trip.DropOffAddress)}')">Start Route</button>
            <button onclick="this.parentElement.style.backgroundColor='lightgreen'">Mark Completed</button>
          `;
          container.appendChild(card);

          // Notifications
          if ("Notification" in window && Notification.permission === "granted") {
            const tripTime = new Date();
            const [h, m] = trip.PickupTimeA.split(":");
            tripTime.setHours(h, m);
            const notifyTime = new Date(tripTime.getTime() - 30 * 60000);
            const now = new Date();
            if (notifyTime > now) {
              setTimeout(() => {
                new Notification("Upcoming Trip", {
                  body: `${trip.PickupTimeA} pickup — ${trip.MobilityType}`,
                });
              }, notifyTime - now);
            }
          }
        });
    }

    renderTrips(today);
    select.addEventListener('change', e => renderTrips(e.target.value));

    // Midnight reset
    function resetAtMidnight() {
      const now = new Date();
      const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
      setTimeout(() => {
        document.querySelectorAll('.trip-card').forEach(card => card.style.backgroundColor = "");
        resetAtMidnight();
      }, msUntilMidnight);
    }
    resetAtMidnight();
  });

// Run greeting
setGreeting();

// Ask for notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}
