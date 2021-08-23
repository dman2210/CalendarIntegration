document.getElementById('main').innerHTML=
`<body>
<div id="confirm" style="font-family: Petit Formal Script, cursive;">
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
    <button class="buttonAdapt" onclick="cancelOne()">Cancel Appointment</button>
</div>
</body>`;