"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let cal = document.getElementById("cal");
  let clock = document.getElementById("time");
  let form = document.forms[0];
  cal.valueAsDate = new Date();

  cal.addEventListener("change", async () => {
    const submitBtn = document.querySelector("button[type='submit']");
    let selectedDateStr = cal.value;
    let selectedDate = new Date(selectedDateStr);
    let today = new Date();

    // نضبط الوقت للمقارنة الدقيقة
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // نحصل على اسم اليوم المختار
    let dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    // 🛑 لو اليوم الأحد → إجازة
    if (dayName === "Sunday") {
      clock.innerHTML = "";
      const option = document.createElement("option");
      option.textContent = "🚫 يوم الأحد إجازة";
      option.disabled = true;
      option.selected = true;
      submitBtn.disabled = true;
      clock.appendChild(option);
      return;
    }

    // 🛑 لو التاريخ في الماضي أو النهاردة → ممنوع
    if (selectedDate <= today) {
      clock.innerHTML = "";
      const option = document.createElement("option");
      option.textContent = "⚠️ لا يمكن الحجز في اليوم الحالي أو الأيام السابقة";
      option.disabled = true;
      option.selected = true;
      clock.appendChild(option);
      return;
    }

    // ✅ باقي الكود زي ما هو
    const weeklyRef = db.ref("weekly_schedule/" + dayName);
    const weeklySnapshot = await weeklyRef.once("value");
    const allTimes = weeklySnapshot.val() || [];

    const appointmentsRef = db.ref("appointments");
    const appointmentsSnapshot = await appointmentsRef.once("value");
    const bookedTimes = [];

    appointmentsSnapshot.forEach((snap) => {
      const data = snap.val();
      if (data.day === selectedDateStr) {
        bookedTimes.push(data.time);
      }
    });

    const availableTimes = allTimes.filter(
      (time) => !bookedTimes.includes(time)
    );

    clock.innerHTML = "";

    if (availableTimes.length === 0) {
      const option = document.createElement("option");
      option.textContent = "لا يوجد مواعيد متاحة";
      option.disabled = true;
      option.selected = true;
      clock.appendChild(option);
      return;
    }

    availableTimes.forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = `${time}`;
      clock.appendChild(option);
    });
  });

  cal.dispatchEvent(new Event("change"));

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const time = document.getElementById("time").value.trim();
    const dateStr = document.getElementById("cal").value.trim();

    const selectedDate = new Date(dateStr);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // 🛑 منع الحجز في يوم الأحد أو يوم ماضي
    if (dayName === "Sunday" || selectedDate <= today) {
      alert("❌ لا يمكن الحجز في هذا اليوم.");
      return;
    }

    if (!name || !phone || !dateStr || !time) {
      alert("⚠️ من فضلك املأ كل الحقول.");
      return;
    }

    const appointment = {
      name: name,
      phone: phone,
      day: dateStr,
      time: time,
    };

    firebase
      .database()
      .ref("appointments")
      .push(appointment)
      .then(() => {
        alert("✅ تم حجز الموعد بنجاح!");
        form.reset();
        cal.valueAsDate = new Date();
        cal.dispatchEvent(new Event("change"));
      })
      .catch((error) => {
        console.error("❌ حدث خطأ أثناء الحجز:", error);
        alert("❌ حدث خطأ! حاول مرة أخرى.");
      });
  });
});
