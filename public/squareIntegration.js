// var subURL = 'https://calendar-integration-backend.vercel.app/api/subscribe';
var subURL = "http://localhost:3000/api/subscribe";
const appId = 'sandbox-sq0idb-k47NFyfiTnNf1wkfFcHAvg';
const locationId = 'LXSNHMQ7X5J6G';

async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');
    console.log("thing attached");
    return card;
}

async function finishTransaction(token) {
    console.log('running transaction...');
    let body = JSON.stringify({ customerDetails: document.customerDetails, token: token, subOptions: document.subOptions, });
    console.log(body);
    const subscriptionResponse = await fetch(subURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
    console.log(subscriptionResponse);
    if (subscriptionResponse.ok) {
        return true;
    } else {
        console.log("error! subscription response: " + JSON.stringify(subscriptionResponse));
        return "error! subscription response: " + JSON.stringify(subscriptionResponse);
    }


}

async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    console.log(tokenResult);
    if (tokenResult.status === 'OK') {
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
    const statusContainer = document.getElementById(
        'payment-status-container'
    );
    if (status === 'SUCCESS') {
        statusContainer.classList.remove('is-failure');
        statusContainer.classList.add('is-success');
    } else {
        statusContainer.classList.remove('is-success');
        statusContainer.classList.add('is-failure');
    }

    statusContainer.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', runSquare());

async function runSquare() {
    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch {
        const statusContainer = document.getElementById(
            'payment-status-container'
        );
        statusContainer.className = 'missing-credentials';
        statusContainer.style.visibility = 'visible';
        return;
    }

    let card;
    try {
        card = await initializeCard(payments);
    } catch (e) {
        console.error('Initializing Card failed', e);
        return;
    }

    // Checkpoint 2.
    async function handlePaymentMethodSubmission(event, paymentMethod) {
        event.preventDefault();

        try {
            let main = document.getElementById("main");
            // disable the submit button as we await tokenization and make a payment request.
            cardButton.disabled = true;
            const token = await tokenize(paymentMethod);
            console.log("sending request...");
            main.innerHTML = "Setting up cleaning...;"
            const paymentResults = await finishTransaction(token);
            if (paymentResults === true) {
                console.log("request success");
                displayPaymentResults('SUCCESS');
                main.innerHTML = `<h1>Payment success!! Receipt has been emailed with scheduling info.</h1>`;
            } else {
                console.log("request error");
                displayPaymentResults('ERROR');

                main.innerHTML = `<h1>There was an error</h1>`;
            }

        } catch (e) {
            cardButton.disabled = false;
            displayPaymentResults('FAILURE');
            console.error(e.message);
        }
    }

    const cardButton = document.getElementById('card-button');
    cardButton.addEventListener('click', async function (event) {
        await handlePaymentMethodSubmission(event, card);
    });
};

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
    //for each time day
    for (let i = 0; i < step; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        let originalDate = new Date(date.getTime());
        let day = JSON.parse(JSON.stringify(busyDaysByFrequency[date.getMonth()][date.getDate()]));
        let daySet = new Set();
        day.forEach(
            (time) => {
                daySet.add(JSON.stringify(time))
            }
        );
        //for each time slot by step
        for (let stepped = 0; stepped * step < 364; stepped++) {
            busyDaysByFrequency[date.getMonth()][date.getDate()].forEach(
                (timeFuture) => {
                    let time = JSON.parse(JSON.stringify(timeFuture));
                    time.start = new Date(time.start);
                    time.end = new Date(time.end);
                    time.start.setDate(time.start.getDate() - (step * stepped));
                    time.end.setDate(time.end.getDate() - (step * stepped));
                    time.start = time.start.toISOString();
                    time.end = time.end.toISOString();
                    //loop through to see if time is contained in day already
                    if (!daySet.has(JSON.stringify(time))) {

                        daySet.add(JSON.stringify(time));
                        day.push(time);
                    }

                }
            );
            removeContainingAppts(day);
            if (day.length > 0) {
                busyDaysByFrequency[date.getMonth()][date.getDate()] = day.sort();
            }
            date.setDate(date.getDate() + step);
        }
    }
    hideLoader()
    return;
}

function removeContainingAppts(day) {
    // for all the appts already accpeted
    let dayDates = [];
    day.forEach(
        (slot) => {
            let appt = JSON.parse(JSON.stringify(slot));
            appt.start = new Date(appt.start);
            appt.end = new Date(appt.end)
            dayDates.push(appt);
        }
    )
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
        remove.forEach(
            (time) => {
                day.splice(time, 1, 0);
            }
        )
        return
    }
    return false;


}


function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};