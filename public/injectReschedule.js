document.getElementById('main').innerHTML =
    `<div id="mainContainer" class="mainContainer">
<div style="display:flex;align-items: center;justify-content: center;">
    <h1>
        Reschedule Appointment
    </h1>
</div>
<div id="loaderContainer" class="coverUp">
    <div class="loader"></div>
</div>
<div id="calOldTime">
    <div id='calendar'>
    </div>

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
</div>
<div id="submit" style="display:none">
    <h2 style="padding-bottom:15px">New Appointment</h2>
    <div style="display:flex; padding-bottom:10px;">
        <p>Date:</p>
        <p id="newApptDate">
        </p>
    </div>
    <div style="display:flex; padding-bottom:10px;">
        <p>Time:</p>
        <p id="newApptTime"></p>
    </div>
    <button class="buttonAdapt" onclick="submitChanges()">
        <div class="buttonItem">
            <p>Submit</p>
        </div>
    </button>
</div>
</div>`