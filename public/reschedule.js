var queryParams = new URLSearchParams(window.location.search);
var subURL = 'https://calendar-integration-backend.vercel.app/api/subscribe';
var toDo = [];
document.subOptions = {};
let frequencyChoice = queryParams.get('frequency');
document.getElementById("loaderContainer").style.display = "flex";
showCurrent();
// var subURL = "http://localhost:3000/api/subscribe";
if (!hoursBusyResolved || !availableHoursResolved) {
    toDo.push(() => { filterByFrequency(frequencyChoice); });
    toDo.push(() => { disableBookedDays((new Date()).getMonth()); });
    toDo.push(() => { hideLoader(); });
} else {
    filterByFrequency(frequencyChoice);
    disableBookedDays((new Date()).getMonth());
    hideLoader();
}

//defines the behavior of the day buttons when clicked
//form is passed in as string
function goTo() {
    let time = document.subOptions.start;
    // console.log(formatTime(new Date(time)))
    Array.from(document.getElementsByTagName('button')).find(
        el => el.firstChild
            && el.firstChild.firstChild
            && el.firstChild.firstChild.innerHTML === formatTime(new Date(time))).classList.add('selectedTime');
    showChangeSubmit()
}

function showCurrent() {
    let currDate = new Date(queryParams.get('now'));
    if (Math.round(Math.abs(new Date() - currDate) / 1000 / 60 / 60) < 24) {
        document.getElementById("mainContainer").innerHTML = "Appointments cannot be rescheduled within 24 hours of the appointment time.";
    } else {
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        document.getElementById('currApptDate').innerHTML = `${days[currDate.getDay()]} ${currDate.getDate()} ${months[currDate.getMonth()]} ${currDate.getFullYear()}`
        document.getElementById('currApptDate').style.marginLeft = "1vw";
        document.getElementById('currApptDate').style.marginTop = "0";
        document.getElementById('currApptTime').innerHTML = formatTime(currDate);
        document.getElementById('currApptTime').style.marginLeft = "1vw";
        document.getElementById('currApptTime').style.marginTop = "0";
    }

}

//changes the details to show new appt details
function showChangeSubmit() {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ["January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"];

    let date = new Date(document.subOptions.start)
    document.getElementById('newApptDate').innerHTML = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    document.getElementById('newApptDate').style.marginLeft = "1vw";
    document.getElementById('newApptDate').style.marginTop = "0";
    document.getElementById('newApptTime').innerHTML = formatTime(date);
    document.getElementById('newApptTime').style.marginLeft = "1vw";
    document.getElementById('newApptTime').style.marginTop = "0";
    document.getElementById('submit').style.display = "block"
}

//replaces all the html with a notice
async function submitChanges() {
    let freqMap = {
        "weekly": 1,
        "biweekly": 2,
        "monthly": 4
    }
    let dayMap = {
        0: "SU",
        1: "MO",
        2: "TU",
        3: "WE",
        4: "TH",
        5: "FR",
        6: "SA"
    }
    document.getElementById('loaderContainer').style.display = 'flex';
    let url = "https://calendar-integration-backend.vercel.app/api/appointments?action=reschedule";
    // let url = "http://localhost:3000/api/appointments?action=reschedule"
    let start = new Date(document.subOptions.start);
    // console.log(start);
    let endDate = new Date(start);
    endDate.setHours(start.getHours() + 2);
    // console.log(endDate);
    let eventID = queryParams.get('eventID');
    let convStart = convertTZ(start, "America/New_York")
    let event = {
        start: start.toISOString(),
        duration: { hours: 2, minutes: 0 },
        title: "Housekeeping",
        busyStatus: 'BUSY',
    }
    let icalLink = "https://calendar-integration-backend.vercel.app/api/makeICS?event=" +
        encodeURIComponent(JSON.stringify(event));
    //create google link
    let recurrence = `FREQ=WEEKLY;BYDAY=${dayMap[start.getDay()]};INTERVAL=${freqMap[frequencyChoice]}`;
    let googleLink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
        urlFormat(event.title) +
        "&dates=" + getDateString(start, endDate) +
        "&recur=" + (recurrence);
    let body = {
        start: start.toISOString(),
        current: start.toISOString(),
        was: queryParams.get('when'),
        end: endDate.toISOString(),
        eventID: eventID,
        where: queryParams.get('where'),
        when: convStart.toDateString().replace(/ \d{4}/, '') + " " + formatTime(convStart),
        who: queryParams.get('who'),
        customerID: queryParams.get('customerID'),
        email: queryParams.get('email'),
        googleCalLink: googleLink,
        icalLink: icalLink,
        frequency: frequencyChoice,
        email: queryParams.get('email'),
        mask: queryParams.get("mask"),
        gloves: queryParams.get("gloves"),
    };
    let description = queryParams.get('description');
    if (description !== undefined && description !== null) {
        body.description = description;
    }
    // console.log("body", body)
    let respo = await fetch(url, { method: "POST", body: JSON.stringify(body) });
    document.getElementById('loaderContainer').style.display = 'none';
    if (respo.ok) {
        document.getElementById('mainContainer').innerHTML = '<h2>Your appointment has been moved. Confirmation sent. Please note that if you have saved this event to your iCal/Google calendar, the original date and time will show up on your calendar until you manually update it.</h2>'
    } else {
        document.getElementById('mainContainer').innerHTML = '<h2>There was an error.</h2>'
    }

}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}

//helper
function insertNoDup(apptsArray, newAppt) {
    let matched = false;
    for (let i = 0; i < apptsArray.length; i++) {
        let appt = apptsArray[i];
        appt.start = new Date(appt.start);
        appt.end = new Date(appt.end);

        if ((appt.start.getHours() === newAppt.start.getHours()) && (appt.start.getMinutes() === newAppt.start.getMinutes())) {
            matched = true;
        }
    }
    if (!matched) {
        apptsArray.push(newAppt);
    }
    return;
}

//copies the given appt across the year according to the given frequency
function copyAcrossYearByFrequency(sAppt, step) {
    let today = new Date();
    let steps = (365 - (365 % step)) / step;
    for (let i = 0; i < steps; i++) {
        let apptInStep = JSON.parse(JSON.stringify(sAppt));
        apptInStep.start = new Date(apptInStep.start);
        apptInStep.end = new Date(apptInStep.end);
        let daysDiff = (apptInStep.end - apptInStep.start) / 1000 / 60 / 60 / 24;
        apptInStep.start.setDate(apptInStep.start.getDate() + i * step);
        apptInStep.end.setFullYear(apptInStep.start.getFullYear());
        apptInStep.end.setMonth(apptInStep.start.getMonth());
        apptInStep.end.setDate(apptInStep.start.getDate() + daysDiff);
        //if eoy then break
        if (today.getMonth() === apptInStep.start.getMonth() && today.getFullYear() !== apptInStep.start.getFullYear()) {
            break;
        }
        if (busyDaysByFrequency[apptInStep.start.getMonth()][apptInStep.start.getDate()] === undefined
        ) {
            busyDaysByFrequency[apptInStep.start.getMonth()][apptInStep.start.getDate()] = [apptInStep];
        } else {
            insertNoDup(
                busyDaysByFrequency[apptInStep.start.getMonth()][apptInStep.start.getDate()],
                apptInStep
            );
        }
    }
}

//return a new date at the earliest day in the same spot in the month according to the frequency
function projectBack(appt, step) {
    //prepare appt by initializing dates
    appt.start = new Date(appt.start);
    appt.end = new Date(appt.end);
    //get today
    let today = new Date();
    //get days between today week and appt
    let diff = (new Date(appt.start.getTime()) - today) / 1000 / 60 / 60 / 24;
    diff = diff < 0 ? Math.ceil(diff) : Math.floor(diff);
    let daysBack = diff - (diff % step);
    //copy the appt to keep original
    let newAppt = JSON.parse(JSON.stringify(appt));
    //get days between appt start and end
    let dayDiff = Math.floor((appt.end - appt.start) / 1000 / 60 / 60 / 24);
    //adjust to this month
    newAppt.start = new Date(newAppt.start);
    newAppt.end = new Date(newAppt.end);
    newAppt.start.setDate(newAppt.start.getDate() - daysBack);
    newAppt.end.setFullYear(newAppt.start.getFullYear());
    newAppt.end.setMonth(newAppt.start.getMonth());
    newAppt.end.setDate(newAppt.start.getDate() + dayDiff);
    return newAppt;
}

var busyDaysByFrequency;
function filterByFrequency(frequency) {
    busyDaysByFrequency = JSON.parse(JSON.stringify(hoursBusy));
    if (frequency === "one") {
        hideLoader();
        return;
    }
    let frequencyMap = {
        monthly: 28,
        weekly: 7,
        biweekly: 14,
    };
    let step = frequencyMap[frequency];
    let monthOffset = new Date();
    let thisMonth = monthOffset.getMonth();
    //for each month
    for (j = 0; j < 12; j++) {
        monthOffset.setMonth(thisMonth + j);
        let month = monthOffset.getMonth();
        //for each day of appts in busy days by frequency
        Object.keys(busyDaysByFrequency[month]).forEach((key) => {
            //get a day
            let day = busyDaysByFrequency[month][key];
            //for each appt
            //prepare dates first
            day.forEach((appt) => {
                let sAppt = projectBack(appt, step);
                copyAcrossYearByFrequency(sAppt, step);
            });
        });
    }
    return;
}

//helper
function compareDates(date1, date2) {
    if (new Date(date2.start).getTime() > new Date(date1.start).getTime()) {
        return 1;
    } else {
        return 0;
    }
}

//helper
function removeContainingAppts(day) {
    // for all the appts already accpeted
    let dayDates = [];
    day.forEach((slot) => {
        let appt = JSON.parse(JSON.stringify(slot));
        appt.start = new Date(appt.start);
        appt.end = new Date(appt.end);
        dayDates.push(appt);
    });
    let remove = [];
    for (let i = 0; i < dayDates.length; i++) {
        let date = dayDates[i];
        for (let j = 0; j < dayDates.length; j++) {
            let time = dayDates[j];
            if (time.start <= date.start && time.end > date.end) {
                // if time contains date in set
                remove.push(i);
            } else if (time.start >= date.start && time.end < date.end) {
                //if date contains time
                remove.push(j);
            }
        }
        remove.forEach((time) => {
            day.splice(time, 1);
        });
        return;
    }
    return;
}

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

function hideLoader() {
    document.getElementById("loaderContainer").style.display = "none";

}

function urlFormat(str) {
    var newstr = str.replace(/^\s+/g, "");
    return encodeURIComponent(newstr.replace(/\s+$/g, ""));
}

// Add a leading '0' if string is only 1 char
function stringPad(str) {
    var newStr = "" + str;
    if (newStr.length == 1) {
        newStr = "0" + newStr;
    }
    return newStr;
}

// Converts the given time into UTC, returns this in a string
function getUTCDateString(y, m, d, h, min) {
    var timeObj = new Date(y, m - 1, d, h, min);
    var dateStr = "" + timeObj.getUTCFullYear();
    dateStr += stringPad(timeObj.getUTCMonth() + 1);
    dateStr += stringPad(timeObj.getUTCDate());
    dateStr += "T" + stringPad(timeObj.getUTCHours());
    dateStr += stringPad(timeObj.getUTCMinutes()) + "00Z";
    return dateStr;
}

// Determines the CGI argument for dates parameter based on user input
function getDateString(start, end) {
    var dateString = "";
    dateString += getUTCDateString(
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes());
    dateString += "/";
    dateString += getUTCDateString(
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes());
    return dateString;
}