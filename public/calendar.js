window.hoursBusyResolved = false;
window.hoursBusy;
window.availableHoursResolved = false;
window.availableHours;
window.bookedDays;
window.done = false;
let appointmentsURL = "https://calendar-integration-backend.vercel.app/api/appointments"
// let hoursURL = "http://localhost:3000/api/hours";
let hoursURL = "https://calendar-integration-backend.vercel.app/api/hours";
async function prepareAvailableHours() {
    return await fetch(hoursURL).then(
        async (response) => {
            // console.log(response);
            if (response.ok) {
                return await response.json().then(json => {
                    // console.log(json); 
                    availableHoursResolved = true; return json
                }).then(
                    (rson) => {
                        Object.keys(rson).forEach(
                            (key) => {
                                if (rson[key].length <= 0) {
                                    delete (rson[key]);
                                }
                            }
                        )
                        return rson;
                    }
                );
            } else {
                console.log(response.error);
            }
        }
    )
}
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
            for (let i = 0; i < busy.length; i++) {
                // busy.forEach(
                // (block, index) => {
                let block = busy[i];
                // console.log("index: ", index)
                let startDate = new Date(block.start);
                let endDate = new Date(block.end);
                if (startDate.getFullYear() !== start.getFullYear() && startDate.getMonth() === start.getMonth()) {
                    break;
                }
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
            }
        }
    );
    // console.log("end", performance.now())
    hoursBusyResolved = true;
    return hoursBusy;
    // console.log("all done.", global.hoursBusy);
}


// let appointmentsURL = "http://localhost:3000/api/appointments";
function chooseTime(day, time, parent) {
    document.subOptions.start = time;
    goTo("form");
    // console.log("heyo");
    // console.log("He chose...  day: ", day, "time: ", time);
}
function prepareCustomer(event, values) {
    let customerDetails = {
        givenName: values.first.value,
        familyName: values.last.value,
        emailAddress: values.email.value,
        phoneNumber: values.phone.value,
        address: values.street.value + " " + values.city.value + " " + values.state.value + " " + values.zip.value,
        gloves: values.gloveSel.value,
        mask: values.maskSel.value,
        unitNumber: values.unit.value,
        description: values.instructions.value
    }
    event.preventDefault();
    document.customerDetails = customerDetails;
    goTo("payment");
}
///sets up the dimensions of the booked array
function prepareBookedDaysArray() {
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
}

function dateify(date) {
    let needNew = false;
    let newDate = { start: null, end: null };
    if (date.start.constructor.name !== "Date") {
        needNew = true;
        newDate.start = new Date(date.start);
    } else {
        //in case one part is date
        newDate.start = date.start;
    }
    if (date.end.constructor.name !== "Date") {
        needNew = true;
        newDate.end = new Date(date.end);
    } else {
        //in case of partial
        newDate.end = date.end;
    }
    if (needNew) {
        return newDate;
    } else {
        return date;
    }


}

///checks for overlap between appt and time that makes the time unbookable
function checkOverlap(apptC, timeC) {
    //check that both are dates
    let appt = dateify(apptC);
    let time = dateify(timeC);
    //check if appt start is earlier than time start (appt might overlap from the left)
    if (appt.start <= time.start) {
        //check if appt starts earlier than time
        if (appt.end > time.start) {
            return true;
            //do not break. need to check rest of appointments
            //may want to change to removing appts from list
        } else {
            //will go to next day because of if at beginning of loop
            return false;
        }
    } else {
        //check if appt start is earlier than end of time slot (partial left overlap)
        if (appt.start < time.end) {
            return true;
            //do not break. need to check rest of appointments
            //may want to change to removing appts from list
        } else {
            //will go to next day because of if at beginning of loop
            return false;
        }


    }
}
///greys out the days in a month that are booked up according to the frequency that the client chose.
function disableBookedDays(month, year) {
    if (year === undefined || year === null) {
        year = (new Date()).getFullYear();
    }
    prepareBookedDaysArray();
    let today = new Date();
    //get days in month
    let dim = new Date();
    dim.setFullYear(year);
    dim.setMonth(dim.getMonth() + 1);
    dim.setDate(0);
    let daysInMonth = dim.getDate();
    //for each day in month
    for (let i = 0; i < daysInMonth; i++) {
        //set up day in month to be checked
        let dayIndex = i + 1;
        let date = new Date();
        date.setFullYear(year)
        date.setMonth(month);
        date.setDate(dayIndex);
        //check if day of month less than today if on current month
        if (today.getMonth() === month && dayIndex < today.getDate() && document.yearDrawn<=today.getFullYear()) {
            bookedDays[month][dayIndex] = true;
        } else {
            //check if bookedDays is set at index already
            //may want to switch this to not true ie not booked
            if (bookedDays[month][dayIndex] === undefined || bookedDays[month][dayIndex] === null) {
                //check if day has available appointments
                if (availableHours[date.getDay()] !== undefined && availableHours[date.getDay()] !== null) {
                    //for each available time on that day
                    for (let j = 0; j < availableHours[date.getDay()].length; j++) {
                        if (bookedDays[month][dayIndex] === false) {
                            //bust out if already determined to be not booked
                            break;
                        }
                        let time = {};
                        time.start = new Date(availableHours[date.getDay()][j]);
                        time.start.setMonth(date.getMonth());
                        time.start.setDate(date.getDate());
                        time.end = new Date(time.start.getTime());
                        time.end.setHours(time.start.getHours() + 2)
                        // check for availability closer than 24hrs
                        if (Math.round(Math.abs(new Date() - time.start) / 1000 / 60 / 60) < 48) {
                            bookedDays[month][dayIndex] = true;
                        } else {
                            //check if there are appoitnemtns that day
                            if (busyDaysByFrequency[month][dayIndex] !== undefined && busyDaysByFrequency[month][dayIndex] !== null) {
                                //day booked by defualt
                                let bookedFromOverlap = true;
                                //for each appt 
                                for (let k = 0; k < busyDaysByFrequency[month][dayIndex].length; k++) {
                                    let apptBlock = busyDaysByFrequency[month][dayIndex][k];
                                    let appt = JSON.parse(JSON.stringify(apptBlock));
                                    appt.start = new Date(appt.start);
                                    appt.end = new Date(appt.end);
                                    //check for appt/time overlap
                                    bookedFromOverlap = checkOverlap(appt, time)
                                    bookedDays[month][dayIndex] = bookedFromOverlap;
                                    if (bookedFromOverlap === true) {
                                        break;
                                    }
                                    //next appt
                                }
                                if (bookedFromOverlap === false) {
                                    break;
                                }
                            } else {
                                //no appts
                                bookedDays[month][dayIndex] = false;
                            }
                        }
                    }
                } else {
                    //does not have an available day entry
                    bookedDays[month][dayIndex] = true;
                }
            }
        }
        //next day
    }
    Array.from(document.getElementsByTagName('td')).forEach(
        (td) => {
            if (bookedDays[month][td.innerHTML] !== undefined && bookedDays[month][td.innerHTML] !== false) {
                td.classList.add('unavailable')
            }
        })
}


prepareAvailability().then(
    (times) => {

        hoursBusy = times;
        if (availableHoursResolved === true && !done) {
            toDo.forEach(func => func());
            done = true;
        }
    }
);
prepareAvailableHours().then(
    (hours) => {
        // console.log("doing the thing:", hours)
        availableHours = hours;
        if (hoursBusyResolved === true && !done) {
            toDo.forEach(func => func());
            done = true;
        }
    }
);

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
            if (option.date === count && option.month === data.monthIndex && option.highlighttargetdate === true) {
                // current date
                td.setAttribute("class", "dycalendar-current-date");
            }
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
                    td.setAttribute("class", "dycalendar-current-date");
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
        button.classList.add('backButton');
        button.classList.add('backButtonCalendar');
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
            if ((new Date).getMonth() === option.month) {
                elem.classList.add('unavailable')
            }
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
            if ((new Date()).getMonth() - 1 === option.month) {
                elem.classList.add('unavailable')
            }
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
            if ((targetDomObject) && (targetDomObject.classList) && (targetDomObject.classList.contains("dycalendar-prev-next-btn")) && !(targetDomObject.classList.contains('unavailable'))) {
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
                selectDay(e.target);
                drawChooseHours(e.target);
            }
            if (e.target.nodeName === "BUTTON" && Array.from(e.target.classList).includes("backButtonCalendar")) {
                goBack();
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
        document.monthDrawn = option.month;
        document.yearDrawn = option.year;
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
            document.getElementById(targetElem).style.flexDirection = "column";
            let wrapper = document.createElement('div');
            wrapper.innerHTML = '<div id="hours" style="display:none;" class="hoursWrapper"></div>'
            document.getElementById(targetElem).appendChild(wrapper.firstChild);
        } else if (targetedElementBy === "class") {
            elemArr = document.getElementsByClassName(targetElem);
            for (i = 0,
                len = elemArr.length; i < len; i = i + 1) {
                elemArr[i].innerHTML = calendarHTML.outerHTML;
            }
        }
        if (global.hoursBusyResolved && global.availableHoursResolved) {
            disableBookedDays(option.month, option.year);
        } else {
            // console.log("busy hours not complete")
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

    function selectDay(dayElement) {
        Array.from(document.getElementsByClassName('dycalendar-target-date')).forEach(
            (td) => {
                td.classList.remove('dycalendar-target-date')
            })
        dayElement.classList.add('dycalendar-target-date');
    }

    //run on click of day
    function drawChooseHours(dayElement) {
        let year = document.yearDrawn;
        let availabilities = [];
        //need to make sure we look through the whole year
        let day = dayElement.innerHTML;
        let month = document.monthDrawn;
        //test if clickable
        let newDay = new Date()
        newDay.setFullYear(year);
        newDay.setMonth(month);
        newDay.setDate(day);
        let avs = availableHours[newDay.getDay()];
        let avai = {};
        avai.start = new Date();
        avai.end = new Date();
        avai.start.setFullYear(year);
        avai.start.setDate(day);
        avai.start.setMonth(month);
        avai.end.setFullYear(year);
        avai.end.setDate(day);
        avai.end.setMonth(month);
        for (let i = 0; i < avs.length; i++) {
            let time = new Date(avs[i]);
            avai.start.setHours(time.getHours());
            avai.start.setMinutes(time.getMinutes());
            avai.end.setHours(avai.start.getHours() + 2)
            avai.end.setMinutes(avai.start.getMinutes());
            //if not within 48 hours
            if (clears48(avai.start)) {
                if (busyDaysByFrequency[month][day] !== undefined) {
                    let conflict = false;
                    for (let j = 0; j < busyDaysByFrequency[month][day].length; j++) {
                        let appt = busyDaysByFrequency[month][day][j];
                        conflict = checkOverlap(appt, avai);
                        if (conflict === true) {
                            break;
                        }
                    }
                    if (conflict === false) {

                        availabilities.push(cloneDateObject(avai));
                    }
                } else {
                    availabilities.push(cloneDateObject(avai));
                }
            }
        }
        // console.log("map");
        let apptOptions = availabilities.map(
            (availability) => {
                if (availability !== null && availability !== undefined) {
                    // console.log(availability);
                    return `<button class="buttonAdapt timeButton" onClick="chooseTime(${day}, '${availability.start.toISOString()}', this)"><div class="buttonItem"><p>${formatTime(availability.start)}</p></div></button>`
                };
            }
        );
        document.apptOptions = apptOptions;
        document.availabilities = availabilities;
        // console.log("append")
        setOptionsContent(apptOptions)

    }

    function setOptionsContent(apptOptions) {
        let content = `${apptOptions.join('')}`;
        document.getElementById("hours").innerHTML = content;
        document.getElementById("hours").style.display = "flex";
    }

    function clears48(appt) {
        return ((appt - new Date()) / 1000 / 60 / 60 > 48) ? true : false;
    }

    function convertToSecondFrame(appt, avai) {
        appt.start = new Date(appt.start);
        appt.end = new Date(appt.end);
        let startEndDifference = appt.end.getDate() - appt.start.getDate();
        let daysDifference = (appt.start - avai.start) / 1000 / 60 / 60 / 24;
        if (daysDifference >= 7 || daysDifference <= -7) {
            let dow = appt.start.getDay();
            let dowDifference = avai.start.getDay() - dow
            if (appt.start.getFullYear() !== avai.start.getFullYear()) {
                appt.start.setFullYear(avai.start.getFullYear());
                appt.end.setFullYear(avai.start.getFullYear());
            }
            appt.start.setMonth(avai.start.getMonth());
            appt.start.setDate(avai.start.getDate() - dowDifference);
            appt.end.setMonth(appt.start.getMonth())
            appt.end.setDate(appt.start.getDate() + startEndDifference);
        }
        return appt;
    }

    function cloneDateObject(date) {
        let newObj = JSON.parse(JSON.stringify(date));
        newObj.start = new Date(newObj.start);
        newObj.end = new Date(newObj.end);
        return newObj;
    }

    //run on page load

}(typeof window !== "undefined" ? window : this));



