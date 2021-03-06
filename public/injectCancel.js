document.getElementById('main').innerHTML =
    `    <div id="confirm" style="font-family: Petit Formal Script, cursive;">
    <div id="loaderContainer" class="coverUp" style="display:none">
        <div id="loader" class="loader"></div>
        <div id="prompt" style="display:none" class="cancelAllPrompt">
            <h2>Are you sure you want to cancel your subscription?</h2>
            <button id="cancelAll" class="buttonAdapt" onclick="cancelAll()">Yes - Cancel Subscription</button>
            <button id="closePrompt" class="buttonAdapt" onclick="closePrompt()">No</button>
        </div>
    </div>
    <h2>
        Do you want to cancel this appointment?
    </h2>
    <div id='scheduleDetails'>
        <h2 style="padding-bottom:15px">Current Appointment</h2>
        <div style="display:flex; padding-bottom:10px;">
            <p>Date:</p>
            <p id="currApptDate"></p>
        </div>
        <div style="display:flex; padding-bottom:10px;">
            <p>Time:</p>
            <p id="currApptTime"></p>
        </div>
    </div>
    <button id="cancelOne" class="buttonAdapt" onclick="cancelOne()">Cancel Appointment</button>
</div>`;