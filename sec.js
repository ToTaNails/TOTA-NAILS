"use strict";

const tableBody = document.querySelector("#table tbody");

firebase
  .database()
  .ref("appointments")
  .on("value", function (snapshot) {
    const data = snapshot.val();
    const appointments = [];

    for (let id in data) {
      const entry = data[id];

      const [year, month, day] = entry.day.split("-").map(Number);

      const [timePart, ampm] = entry.time.trim().split(" ");

      let hourStr, minuteStr;
      if (timePart.includes(":")) {
        [hourStr, minuteStr] = timePart.split(":");
      } else {
        hourStr = timePart;
        minuteStr = "00";
      }

      let hour = Number(hourStr);
      const minute = Number(minuteStr);

      if (ampm.toUpperCase() === "PM" && hour !== 12) {
        hour += 12;
      } else if (ampm.toUpperCase() === "AM" && hour === 12) {
        hour = 0;
      }

      const fullDate = new Date(year, month - 1, day, hour, minute);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const bookingDate = new Date(year, month - 1, day);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate < now) {
        continue;
      }

      appointments.push({
        id: id, // ✅ مهم علشان الحذف
        name: entry.name,
        phone: entry.phone,
        day: entry.day,
        time: entry.time,
        timestamp: fullDate.getTime(),
      });
    }

    appointments.sort((a, b) => a.timestamp - b.timestamp);

    tableBody.innerHTML = "";

    appointments.forEach((appt) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${appt.day}</td>
        <td>${appt.time}</td>
        <td>${appt.name}</td>
        <td>${appt.phone}</td>
        <td>
          <i class="fa-solid fa-trash" onclick="deleteAppointment('${appt.id}')" style="background:none; border:none; cursor:pointer;" title="حذف">
          </i>
        </td>
      `;

      tableBody.appendChild(row);
    });
  });


// ✅ دالة حذف الحجز من Firebase
function deleteAppointment(id) {
  const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا الحجز؟");
  if (!confirmDelete) return;

  firebase
    .database()
    .ref("appointments/" + id)
    .remove()
    .then(() => {
      alert("✅ تم حذف الحجز بنجاح.");
    })
    .catch((error) => {
      console.error("❌ خطأ أثناء الحذف:", error);
      alert("❌ فشل الحذف. حاول مرة أخرى.");
    });
}
