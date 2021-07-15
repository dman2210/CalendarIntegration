var subURL = 'https://calendar-integration-backend.vercel.app/api/subscribe';
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
    let body = JSON.stringify({customerDetails:document.customerDetails, token:token, subOptions: document.subOptions,});
    console.log(body);
    const subscriptionResponse = await fetch(subURL, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
    console.log(subscriptionResponse);
    if(subscriptionResponse.ok){
        return true;
    }else{
        console.log("error! customer response: "+subscriptionResponse);
        return "error! customer response: "+subscriptionResponse;
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
            if(paymentResults===true){
                console.log("request success");
                displayPaymentResults('SUCCESS');
                main.innerHTML = `<h1>Payment success!! Receipt has been emailed with scheduling info.</h1>`;
            }else{
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