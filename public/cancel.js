function showCurrent() {
    let currDate = new Date(queryParams.get('now'));
    if (Math.round(Math.abs(new Date() - currDate) / 1000 / 60 / 60) < 24) {
        document.getElementById("confirm").innerHTML = "Appointments cannot be cancelled within 24 hours of the appointment time.";
    } else {
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        document.getElementById('currApptDate').innerHTML = `${days[currDate.getDay()]} ${currDate.getDate()} ${months[currDate.getMonth()]} ${currDate.getFullYear()}`
        document.getElementById('currApptDate').style.marginLeft = "1vw";
        document.getElementById('currApptDate').style.marginTop = "0";
        document.getElementById('currApptDate').style.marginBottom = "1vw";
        document.getElementById('currApptTime').innerHTML = formatTime(currDate);
        document.getElementById('currApptTime').style.marginLeft = "1vw";
        document.getElementById('currApptTime').style.marginTop = "0";
        document.getElementById('currApptTime').style.marginBottom = "1vw";
    }

}
var queryParams = new URLSearchParams(window.location.search);

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}
async function cancelOne() {
    document.getElementById('loaderContainer').style.display = 'flex';
    let url = "https://calendar-integration-backend.vercel.app/api/appointments?action=cancel";
    // let url = "http://localhost:3000/api/appointments?action=cancel";
    let customerID = queryParams.get('customerID');
    let eventID = queryParams.get('eventID');
    let body = {
        customerID: customerID,
        id: eventID
    };
    ["where", "when", "who", "email", "eventID", "current", "customerID"].forEach((item) => {
        body[item] = queryParams.get(item);
    })
    // console.log('body', body)
    let respo = await fetch(url, { method: "POST", body: JSON.stringify(body) });
    document.getElementById('loaderContainer').style.display = 'none';
    if (respo.ok) {
        document.getElementById('confirm').innerHTML = '<h2>Your appointment has been cancelled and a confirmation email is on its way to you.</h2>'
    } else {
        document.getElementById('confirm').innerHTML = '<h2>There was an error.</h2>'
    }
}
if (document.readyState === "complete") {
    showCurrent();
} else {
    window.addEventListener("load", () => {
        showCurrent();
    });
}

