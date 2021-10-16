var subURL;
subURL = 'https://calendar-integration-backend.vercel.app/api/subscribe';
// subURL = "http://localhost:3000/api/subscribe";
const appId = "sandbox-sq0idb-Hq2z0oLxNxfqY-FrJE9abw";
const locationId = "LXSNHMQ7X5J6G";

async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach("#card-container");
    console.log("thing attached");
    return card;
}

async function finishTransaction(token) {
    console.log("running transaction...");
    let body = {
        customerDetails: document.customerDetails,
        token: token,
        subOptions: document.subOptions,
    };
    // console.log(body);
    const subscriptionResponse = await fetch(subURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });
    // console.log(subscriptionResponse);
    if (subscriptionResponse.ok) {
        return true;
    } else {
        console.log(
            "error! subscription response: " +
            JSON.stringify(subscriptionResponse)
        );
        return (
            "error! subscription response: " +
            JSON.stringify(subscriptionResponse)
        );
    }
}

async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    // console.log(tokenResult);
    if (tokenResult.status === "OK") {
        return tokenResult.token;
    } else {
        let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
        if (tokenResult.errors) {
            errorMessage += ` and errors: ${JSON.stringify(
                tokenResult.errors
            )}`;
        }

        throw new Error(errorMessage);
    }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
    const statusContainer = document.getElementById("payment-status-container");
    if (status === "SUCCESS") {
        statusContainer.classList.remove("is-failure");
        statusContainer.classList.add("is-success");
    } else {
        statusContainer.classList.remove("is-success");
        statusContainer.classList.add("is-failure");
    }

    statusContainer.style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", runSquare());

async function runSquare() {
    if (!window.Square) {
        throw new Error("Square.js failed to load properly");
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch {
        const statusContainer = document.getElementById(
            "payment-status-container"
        );
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
        return;
    }

    let card;
    try {
        card = await initializeCard(payments);
    } catch (e) {
        console.error("Initializing Card failed", e);
        return;
    }

    // Checkpoint 2.
    async function handlePaymentMethodSubmission(event, paymentMethod) {
        event.preventDefault();

        try {
            let main = document.getElementById("main");
            main.style.marginTop = "2vh";
            // disable the submit button as we await tokenization and make a payment request.
            cardButton.disabled = true;
            const token = await tokenize(paymentMethod);
            console.log("sending request...");
            main.innerHTML = "Setting up cleaning...";
            const paymentResults = await finishTransaction(token);
            if (paymentResults === true) {
                console.log("request success");
                displayPaymentResults("SUCCESS");
                main.innerHTML = `<h1 >Payment success!! Receipt has been emailed with scheduling info.</h1>`;
            } else {
                console.log("request error");
                displayPaymentResults("ERROR");

                main.innerHTML = `<h1>There was an error</h1>`;
            }
        } catch (e) {
            cardButton.disabled = false;
            displayPaymentResults("FAILURE");
            console.error(e.message);
        }
    }

    const cardButton = document.getElementById("card-button");
    cardButton.classList.add('buttonAdapt');
    cardButton.addEventListener("click", async function (event) {
        await handlePaymentMethodSubmission(event, card);
    });
}

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

function compareDates(date1, date2) {
    if (new Date(date2.start).getTime() > new Date(date1.start).getTime()) {
        return 1;
    } else {
        return 0;
    }
}

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