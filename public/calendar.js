window.hoursBusyResolved = false;
window.hoursBusy;
window.bookedDays;
let appointmentsURL = "https://calendar-integration-backend.vercel.app/api/appointments"
async function prepareAvailability() {
    let start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    let arrayOfResponses = await fetch(appointmentsURL + "?all=true&start=" + encodeURIComponent(start.toISOString())).then(async (response) => { return await response.json() })
    let arrayOfBusies = [];
    //extract the data from the responses
    for (let i = 0; i < arrayOfResponses.length; i++) {
        arrayOfBusies.push(arrayOfResponses[i].data.calendars[Object.keys(arrayOfResponses[i].data.calendars)[0]].busy);
    }
    //set up array for the finish
    let hoursBusy = [];
    for (let i = 0; i < 12; i++) {
        let month = {}
        hoursBusy.push(month);
    }
    arrayOfBusies.forEach(
        (busy) => {
            // console.log(busy);
            busy.forEach(
                (block, index) => {
                    // console.log("index: ", index)
                    let startDate = new Date(block.start);
                    let endDate = new Date(block.end);
                    // console.log("month", startDate.getMonth())
                    let blockObject = { start: startDate, end: endDate }
                    //pushes on to the relevant day of the relevant month.
                    if (!hoursBusy[startDate.getMonth()][startDate.getDate()]) {
                        // console.log("not in array yet. adding")
                        hoursBusy[startDate.getMonth()][startDate.getDate()] = [blockObject];
                    } else {
                        // console.log("day already in. adding")
                        hoursBusy[startDate.getMonth()][startDate.getDate()].push(blockObject)
                    }
                    //push the object onto any additional day in a multi day busy
                    if (startDate.getDate() !== endDate.getDate()) {
                        let inbet = new Date(startDate.getTime());
                        while (inbet.getDate() !== endDate.getDate()) {
                            // console.log("multi day. current month:", inbet.getMonth(), "current day", inbet.getDate())
                            inbet.setDate(inbet.getDate() + 1)
                            // console.log("new month", inbet.getMonth(), "current day", inbet.getDate())
                            if (!hoursBusy[inbet.getMonth()][inbet.getDate()]) {
                                hoursBusy[inbet.getMonth()][inbet.getDate()] = [blockObject];
                            } else {
                                hoursBusy[inbet.getMonth()][inbet.getDate()].push(blockObject)
                            }

                        }
                    }

                }
            );
        }
    );
    // console.log("end", performance.now())
    hoursBusyResolved = true;
    return hoursBusy;
    // console.log("all done.", global.hoursBusy);
}
prepareAvailability().then((times) => { hoursBusy = times; toDo.forEach(func => func()) });

// let appointmentsURL = "http://localhost:3000/api/appointments";
function chooseTime(day, time, parent) {
    triggerAnswer()
    //inject into parent
    let date = new Date();
    date.setMonth(monthName.indexOf(document.getElementsByClassName("dycalendar-span-month-year")[0].innerHTML));
    date.setDate(day);
    let timePieces = time.split(":");
    let lastPieces = timePieces[1].split(" ");
    date.setHours(lastPieces[1] === "AM" ? timePieces[0] : timePieces[0] + 12);
    date.setMinutes(lastPieces[0]);
    let formattedTime = date.toISOString();
    document.subOptions.start = formattedTime;
    console.log("heyo");
    console.log("He chose...  day: ", day, "time: ", time);
}
function prepareCustomer(event, values) {
    let customerDetails = {
        givenName: values.first.value,
        familyName: values.last.value,
        emailAddress: values.email.value,
        phoneNumber: values.phone.value,
        address: values.address.value,
    }
    event.preventDefault();
    document.customerDetails = customerDetails;
    checkout();
}
function triggerAnswer() {
    let main = document.getElementById("main");
    let form =
        `<form onsubmit="prepareCustomer(event, this)"> <div style="display:flex;justify-content: center;flex-direction: column;">
        <h2>Customer Profile</h2>
        <div style="display:flex;justify-content:space-between">
            <div><h4>FIRST NAME</h4>
            <input name="first" required class="textInput" type="text"></input>
            </div>
            <div>
                <h4>LAST NAME</h4>
            <input name="last" required class="textInput" type="text"></input>
            </div>
        </div>
        <h4>PHONE</h4>
        <input name="phone" required pattern=".*([0-9]{3}).*([0-9]{3}).*([0-9]{4}).*" 
        oninvalid="this.setCustomValidity('Please match one of these formats: ##########,   ###-###-####,   (###) ###-####')" 
        onvalid="this.setCustomValidity('')" 
        class="textInput" 
        type="tel"></input>
        <h4>EMAIL</h4>
        <input name="email" required pattern=".+@.+\.+." 
        oninvalid="this.setCustomValidity('Please match one of these formats: ##########,   ###-###-####,   (###) ###-####')" 
        onvalid="this.setCustomValidity('')"  class="textInput" type="email"></input>
        <h4>ADDRESS</h4>
        <input name="address" required class="textInput" type="text"></input>
        <h4>Should a vacuum be brought to this session?</h4>
        <div>
            <input type="radio" id="vacuum" name="vacuumSel" value="true" required>
                <label for="html">YES</label><br>
                    <input type="radio" id="noVacuum" name="vacuumSel" value="false">
                        <label for="css">NO</label><br>
        </div>
        <h4>Do you request gloves be worn during your session?</h4>
        <div>
            <input type="radio" id="gloves" name="gloveSel" value="true" required>
                <label for="html">YES</label><br>
                    <input type="radio" id="noGloves" name="gloveSel" value="false">
                        <label for="css">NO</label><br>
        </div>
        <h4>Do you request that a mask be worn during your session?</h4>
        <div>
            <input type="radio" id="mask" name="maskSel" value="true" required>
                <label for="html">YES</label><br>
                    <input type="radio" id="noMask" name="maskSel" value="false">
                        <label for="css">NO</label><br>
        </div>
        <h4>Parking instructions or other applicable information:</h4>
        <textarea class="textInput" name="instructions"></textarea>
        <input style="margin-top:5px" type="submit" value="Submit" type="submit"></input>
    </div></form>`;
    main.innerHTML = form;
}
function checkout() {
    document.getElementById("squareContainer").style.display = "unset";
    let main = document.getElementById("main");
    main.innerHTML = "";
}
// document.getElementById("loaderContainer").style.display = "none";
// var bookedDays;
//greys out the days in a month that are booked up according to the frequency that the client chose.
function disableBookedDays(month) {
    if (typeof (bookedDays) === 'undefined') {
        bookedDays = [];
        for (let i = 0; i < 12; i++) {
            bookedDays.push({});
        }
    } else if (bookedDays.length <= 0) {
        for (let i = 0; i < 12; i++) {
            bookedDays.push({});
        }
    }

    let today = new Date();
    let bod = new Date();
    let eod = new Date();
    eod.setMonth(month);
    // eod.setMonth(eod.getMonth() + 1);
    // eod.setDate(0);
    bod.setMonth(month);
    bod.setDate(1);
    bod.setHours(0);
    bod.setMinutes(2);
    eod.setMonth(month);
    eod.setDate(1);
    eod.setHours(23);
    eod.setMinutes(14);
    eod.setSeconds(0)
    eod.setMilliseconds(0);
    //for each day in month that has appointments
    Object.keys(busyDaysByFrequency[month]).forEach(
        (index) => {
            bod.setDate(index);
            eod.setDate(index);
            // console.log(eod, today, (eod.getTime() - today.getTime()) / 1000 / 60 / 60);
            if ((index < today.getDate() && month === today.getMonth()) || (eod - today) / 1000 / 60 / 60 < 2) {
                bookedDays[month][index] = true;
            } else {
                let step = { monthly: 28, biweekly: 14, weekly: 7 }[document.subOptions.frequency];
                let day = busyDaysByFrequency[month][index];

                //for each appointment on the day of the current index
                for (let i = 0; i < Object.keys(day).length; i++) {
                    //if booked isn't already set
                    if (bookedDays[month][index] === undefined || bookedDays[month][index === null]) {
                        let appt = JSON.parse(JSON.stringify(day[i]));
                        if (appt !== undefined) {
                            appt.start = new Date(appt.start);
                            appt.end = new Date(appt.end);
                            //set the date into the current month/year/week
                            let startEndDifference = appt.end.getDate() - appt.start.getDate();
                            let daysDifference = (appt.start - bod) / 1000 / 60 / 60 / 24;
                            if (daysDifference >= 7 || daysDifference <= -7) {
                                let dow = appt.start.getDay();
                                let dowDifference = bod.getDay() - dow
                                appt.start.setMonth(bod.getMonth());
                                appt.start.setDate(bod.getDate - dowDifference);
                                appt.end.setDate(appt.start.getDate() + startEndDifference);
                            }
                            //if start of window is before busy
                            if (appt.start < bod) {
                                if (appt.end > eod) {
                                    bookedDays[month][index] = true;
                                    break;
                                }
                                bod.setHours(appt.end.getHours());
                                for (let j = i + 1; j <= day.length; j++) {
                                    //check undefined, null, and if the next appt starts later than the day just in case
                                    if (day[j] !== undefined && day[j] != null) {
                                        let nextAppt = JSON.parse(JSON.stringify(day[j]));
                                        nextAppt.start = new Date(nextAppt.start);
                                        nextAppt.end = new Date(nextAppt.end);
                                        if (nextAppt.start.getDate() === bod.getDate()) {
                                            eod.setHours(nextAppt.start.getHours());
                                            let difference = (eod.getHours() + eod.getMinutes() / 60) - (bod.getHours() + bod.getMinutes() / 60);
                                            if (difference >= 2) {
                                                bookedDays[month][index] = false;
                                                break;
                                            }
                                        } else {
                                            //earlier appts did not cover all day
                                            bookedDays[month][index] = false;
                                            break;
                                        }
                                    } else {
                                        //earlier appts did not cover all day
                                        bookedDays[month][index] = false;
                                        break;
                                    }

                                }

                            } else {
                                //check if 2 hours before the appt
                                if ((appt.start.getHours() + (appt.start.getMinutes() / 60)) - (bod.getHours() + (bod.getMinutes() / 60)) >= 2) {
                                    bookedDays[month][index] = false;
                                    break;
                                } else {
                                    //loop through rest of appointments in day and check for two hour gaps
                                    bod.setHours(appt.end.getHours());
                                    for (let j = i + 1; j < day.length; j++) {
                                        //check undefined, null, and if the next appt starts later than the day just in case
                                        if (day[j] !== undefined && day[j] != null) {
                                            let nextAppt = JSON.parse(JSON.stringify(day[j]));
                                            nextAppt.start = new Date(nextAppt.start);
                                            nextAppt.end = new Date(nextAppt.end);
                                            if (nextAppt.start.getDate() === bod.getDate()) {
                                                eod.setHours(nextAppt.start.getHours());
                                                let difference = (eod.getHours() + eod.getMinutes() / 60) - (bod.getHours() + bod.getMinutes() / 60);
                                                if (difference >= 2) {
                                                    bookedDays[month][index] = false
                                                    break;
                                                }
                                            } else {
                                                //earlier appts did not cover all day
                                                bookedDays[month][index] = false;
                                                break;
                                            }
                                        } else {
                                            //earlier appts did not cover all day
                                            bookedDays[month][index] = false;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        break;
                    }
                }
            }

        }
    )
    Array.from(document.getElementsByTagName('td')).forEach(
        (td) => {
            if (bookedDays[month][td.innerHTML] !== undefined && bookedDays[month][td.innerHTML] !== false) {
                td.classList.add('unavailable')
            }
        })
}
(async function (global) {
    global.calendarLoaded = false;
    global.hoursBusyResolved = false;
    "use strict";
    var dycalendar = {}
        , document = global.document
        , START_YEAR = 1900
        , END_YEAR = 9999
        , monthName = {
            full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            mmm: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
        , dayName = {
            full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            d: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            dd: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            ddd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
    const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    };
    function createMonthTable(data, option) {
        var table, tr, td, r, c, count;
        table = document.createElement("table");
        tr = document.createElement("tr");
        for (c = 0; c <= 6; c = c + 1) {
            td = document.createElement("td");
            td.innerHTML = dayName.d[c];
            tr.appendChild(td);
        }
        table.appendChild(tr);
        tr = document.createElement("tr");
        for (c = 0; c <= 6; c = c + 1) {
            if (c === data.firstDayIndex) {
                break;
            }
            td = document.createElement("td");
            tr.appendChild(td);
        }
        count = 1;
        while (c <= 6) {
            td = document.createElement("td");
            td.innerHTML = count;
            if (data.today.date === count && data.today.monthIndex === data.monthIndex && option.highlighttoday === true) {
                td.setAttribute("class", "dycalendar-today-date");
            }
            // if (option.date === count && option.month === data.monthIndex && option.highlighttargetdate === true) {
            //current date
            // td.setAttribute("class", "dycalendar-target-date");
            // }
            tr.appendChild(td);
            count = count + 1;
            c = c + 1;
        }
        table.appendChild(tr);
        for (r = 3; r <= 7; r = r + 1) {
            tr = document.createElement("tr");
            for (c = 0; c <= 6; c = c + 1) {
                if (count > data.totaldays) {
                    table.appendChild(tr);
                    return table;
                }
                td = document.createElement('td');
                td.innerHTML = count;
                // td.onClick = () => { console.log("hello there. this day is ", count); }
                if (data.today.date === count && data.today.monthIndex === data.monthIndex && option.highlighttoday === true) {
                    td.setAttribute("class", "dycalendar-today-date");
                }
                if (option.date === count && option.month === data.monthIndex && option.highlighttargetdate === true) {
                    td.setAttribute("class", "dycalendar-target-date");
                }
                count = count + 1;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        return table;
    }
    function drawCalendarMonthTable(data, option) {
        var table, div, container, elem;
        table = createMonthTable(data, option);
        container = document.createElement("div");
        let button = document.createElement("button");
        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add('navButtonContainer');
        button.classList.add('navButton');
        button.classList.add('buttonAdapt');
        button.innerHTML = "< Back";
        buttonContainer.appendChild(button);
        container.appendChild(buttonContainer);
        container.setAttribute("class", "dycalendar-month-container");
        div = document.createElement("div");
        div.setAttribute("class", "dycalendar-header");
        div.setAttribute("data-option", JSON.stringify(option));
        if (option.prevnextbutton === "show") {
            elem = document.createElement("span");
            elem.setAttribute("class", "dycalendar-prev-next-btn prev-btn");
            elem.setAttribute("data-date", option.date);
            elem.setAttribute("data-month", option.month);
            elem.setAttribute("data-year", option.year);
            elem.setAttribute("data-btn", "prev");
            elem.innerHTML = "&lt;";
            div.appendChild(elem);
        }
        elem = document.createElement("span");
        elem.setAttribute("class", "dycalendar-span-month-year");
        if (option.monthformat === "mmm") {
            elem.innerHTML = data.monthName + " " + data.year;
        } else if (option.monthformat === "full") {
            elem.innerHTML = data.monthNameFull + " " + data.year;
        }
        div.appendChild(elem);
        if (option.prevnextbutton === "show") {
            elem = document.createElement("span");
            elem.setAttribute("class", "dycalendar-prev-next-btn next-btn");
            elem.setAttribute("data-date", option.date);
            elem.setAttribute("data-month", option.month);
            elem.setAttribute("data-year", option.year);
            elem.setAttribute("data-btn", "next");
            elem.innerHTML = "&gt;";
            div.appendChild(elem);
        }
        container.appendChild(div);
        div = document.createElement("div");
        div.setAttribute("class", "dycalendar-body");
        div.appendChild(table);
        container.appendChild(div);
        return container;
    }
    function drawCalendarDay(data, option) {
        var div, container, elem;
        container = document.createElement("div");
        container.setAttribute("class", "dycalendar-day-container");
        div = document.createElement("div");
        div.setAttribute("class", "dycalendar-header");
        elem = document.createElement("span");
        elem.setAttribute("class", "dycalendar-span-day");
        if (option.dayformat === "ddd") {
            elem.innerHTML = dayName.ddd[data.targetedDayIndex];
        } else if (option.dayformat === "full") {
            elem.innerHTML = dayName.full[data.targetedDayIndex];
        }
        div.appendChild(elem);
        container.appendChild(div);
        div = document.createElement("div");
        div.setAttribute("class", "dycalendar-body");
        elem = document.createElement("span");
        elem.setAttribute("class", "dycalendar-span-date");
        elem.innerHTML = data.date;
        div.appendChild(elem);
        container.appendChild(div);
        div = document.createElement("div");
        div.setAttribute("class", "dycalendar-footer");
        elem = document.createElement("span");
        elem.setAttribute("class", "dycalendar-span-month-year");
        if (option.monthformat === "mmm") {
            elem.innerHTML = data.monthName + " " + data.year;
        } else if (option.monthformat === "full") {
            elem.innerHTML = data.monthNameFull + " " + data.year;
        }
        div.appendChild(elem);
        container.appendChild(div);
        return container;
    }
    function extendSource(source, defaults) {
        var property;
        for (property in defaults) {
            if (source.hasOwnProperty(property) === false) {
                source[property] = defaults[property];
            }
        }
        return source;
    }
    function getCalendar(year, month, date) {
        var dateObj = new Date(), dateString, result = {}, idx;
        if (year < START_YEAR || year > END_YEAR) {
            global.console.error("Invalid Year");
            return false;
        }
        if (month > 11 || month < 0) {
            global.console.error("Invalid Month");
            return false;
        }
        if (date > 31 || date < 1) {
            global.console.error("Invalid Date");
            return false;
        }
        result.year = year;
        result.month = month;
        result.date = date;
        result.today = {};
        dateString = dateObj.toString().split(" ");
        idx = dayName.ddd.indexOf(dateString[0]);
        result.today.dayIndex = idx;
        result.today.dayName = dateString[0];
        result.today.dayFullName = dayName.full[idx];
        idx = monthName.mmm.indexOf(dateString[1]);
        result.today.monthIndex = idx;
        result.today.monthName = dateString[1];
        result.today.monthNameFull = monthName.full[idx];
        result.today.date = dateObj.getDate();
        result.today.year = dateString[3];
        dateObj.setDate(1);
        dateObj.setMonth(month);
        dateObj.setFullYear(year);
        dateString = dateObj.toString().split(" ");
        idx = dayName.ddd.indexOf(dateString[0]);
        result.firstDayIndex = idx;
        result.firstDayName = dateString[0];
        result.firstDayFullName = dayName.full[idx];
        idx = monthName.mmm.indexOf(dateString[1]);
        result.monthIndex = idx;
        result.monthName = dateString[1];
        result.monthNameFull = monthName.full[idx];
        dateObj.setFullYear(year);
        dateObj.setMonth(month + 1);
        dateObj.setDate(0);
        result.totaldays = dateObj.getDate();
        dateObj.setFullYear(year);
        dateObj.setMonth(month);
        dateObj.setDate(date);
        dateString = dateObj.toString().split(" ");
        idx = dayName.ddd.indexOf(dateString[0]);
        result.targetedDayIndex = idx;
        result.targetedDayName = dateString[0];
        result.targetedDayFullName = dayName.full[idx];
        return result;
    }
    function onClick() {
        document.body.onclick = function (e) {
            e = global.event || e;
            var targetDomObject = e.target || e.srcElement, date, month, year, btn, option, dateObj;
            if ((targetDomObject) && (targetDomObject.classList) && (targetDomObject.classList.contains("dycalendar-prev-next-btn"))) {
                date = parseInt(targetDomObject.getAttribute("data-date"));
                month = parseInt(targetDomObject.getAttribute("data-month"));
                year = parseInt(targetDomObject.getAttribute("data-year"));
                btn = targetDomObject.getAttribute("data-btn");
                option = JSON.parse(targetDomObject.parentElement.getAttribute("data-option"));
                if (btn === "prev") {
                    month = month - 1;
                    if (month < 0) {
                        year = year - 1;
                        month = 11;
                    }
                } else if (btn === "next") {
                    month = month + 1;
                    if (month > 11) {
                        year = year + 1;
                        month = 0;
                    }
                }
                option.date = date;
                option.month = month;
                option.year = year;
                drawCalendar(option);
            }
            if ((targetDomObject) && (targetDomObject.classList) && (targetDomObject.classList.contains("dycalendar-span-month-year"))) {
                option = JSON.parse(targetDomObject.parentElement.getAttribute("data-option"));
                dateObj = new Date();
                option.date = dateObj.getDate();
                option.month = dateObj.getMonth();
                option.year = dateObj.getFullYear();
                drawCalendar(option);
            }
            if ((e.target.nodeName === "TD" && /.*[0-9]+.*/g.test(e.target.innerHTML)) && !Array.from(e.target.classList).includes('unavailable')) {
                drawChooseHours(e.target);
            }
        }
            ;
    }
    dycalendar.draw = function (option) {
        if (typeof option === "undefined") {
            global.console.error("Option missing");
            return false;
        }
        var self = this
            , dateObj = new Date()
            , defaults = {
                type: "day",
                month: dateObj.getMonth(),
                year: dateObj.getFullYear(),
                date: dateObj.getDate(),
                monthformat: "full",
                dayformat: "full",
                highlighttoday: false,
                highlighttargetdate: false,
                prevnextbutton: "hide"
            };
        option = extendSource(option, defaults);
        drawCalendar(option);
    }
        ;
    function drawCalendar(option) {
        var calendar, calendarHTML, targetedElementBy = "id", targetElem, i, len, elemArr;
        if (option.target[0] === "#") {
            targetedElementBy = "id";
        } else if (option.target[0] === ".") {
            targetedElementBy = "class";
        }
        targetElem = option.target.substring(1);
        switch (option.type) {
            case "day":
                calendar = getCalendar(option.year, option.month, option.date);
                calendarHTML = drawCalendarDay(calendar, option);
                break;
            case "month":
                calendar = getCalendar(option.year, option.month, option.date);
                calendarHTML = drawCalendarMonthTable(calendar, option);
                break;
            default:
                global.console.error("Invalid type");
                return false;
        }
        if (targetedElementBy === "id") {
            document.getElementById(targetElem).innerHTML = calendarHTML.outerHTML;
        } else if (targetedElementBy === "class") {
            elemArr = document.getElementsByClassName(targetElem);
            for (i = 0,
                len = elemArr.length; i < len; i = i + 1) {
                elemArr[i].innerHTML = calendarHTML.outerHTML;
            }
        }
        if (global.hoursBusyResolved) {
            disableBookedDays(option.month);
        } else {
            console.log("busy hours not complete")
        }
    }
    onClick();
    global.dycalendar = dycalendar;
    global.calendarLoaded = true;
    dycalendar.draw({
        target: '#calendar',
        type: 'month',
        dayformat: 'full',
        monthformat: 'full',
        highlighttargetdate: true,
        prevnextbutton: 'show'
    })

    function selectDay(dayElement){
        Array.from(document.getElementsByTagName('tbody')[0].children).forEach(
            (tr, index) => {
                if (index > 0) {
                    Array.from(tr.children).forEach(
                        (td) => {
                            td.classList.remove('dycalendar-target-date')
                        })
                }
            })
        dayElement.classList.add('dycalendar-target-date');
    }

    //run on click of day
    function drawChooseHours(dayElement) {
        //need to make sure we look through the whole year
        selectDay(dayElement);
        let day = dayElement.innerHTML;
        let month = monthName.indexOf(document.getElementsByClassName("dycalendar-span-month-year")[0].innerHTML);
        console.log("month", month);
        let dayBusy = global.hoursBusy[month][day];
        //walk through each half. check for all day then to end of day
        //check each half hour , add html for it.
        let bod = new Date();
        let eod = new Date();
        eod.setMonth(month);
        bod.setMonth(month);
        eod.setDate(day);
        bod.setDate(day);
        eod.setHours(22);
        eod.setMinutes(59);
        eod.setSeconds(0)
        eod.setMilliseconds(0);
        bod.setHours(0);
        bod.setMinutes(2);
        let dayAvailability = [];
        let dateSetter = new Date(bod);
        dateSetter.setMilliseconds(0);
        dateSetter.setMinutes(0);
        dateSetter.setSeconds(0);
        while (dateSetter.getDate() === day) {
            let eoappt = new Date()
            eoappt.setHours(eoappt.getHours() + 2);
            let busyBlock = {};
            busyBlock.conflict = false;
            dayBusy.forEach(
                (busy, index) => {
                    //check if beginning of appt is in busy and two hours later.
                    //busy needs to be reparsed as object?
                    if (dateSetter.getDate() === busy.start.getDate()) {
                        //current and end is earlier than start of busy
                        if (!(dateSetter < busy.start && eoappt < busy.start)) {
                            busyBlock.index = index;
                            busyBlock.conflict = true;
                        }
                    }
                }
            )
            if (!busyBlock.conflict) {
                //insert
                dayAvailability.push(formatTime(dateSetter));
                //increment
                dateSetter.setMinutes(dayAvailability.getMinutes() + 30);
            } else {
                //set to end of conflict
                dateSetter.setTime(busy[busyBlock.index].getTime());
            }

        }
        //recheck according to frequency
        if (dayAvailability.length > 0) {
            let content = `<div class="buttonItem"><h4>${day}</h4></div>${dayAvailability.map(hour => {
                return `<div class="buttonItem"><p onClick="chooseTime(${day}, '${hour}', this)">${hour}</p></div>`
            })}`;
            console.log(content);
            document.getElementById("hours").innerHTML = content;
            document.getElementById("hoursWrapper").style.display = "block";
        }
    }

    //run on page load

}(typeof window !== "undefined" ? window : this));



