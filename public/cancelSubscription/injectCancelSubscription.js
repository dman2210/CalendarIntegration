document.getElementById('main').innerHTML = `
<div id="confirm" style="font-family: Petit Formal Script, cursive;">
        <div id="loaderContainer" class="coverUp" style="display:none">
            <div id="loader" class="loader"></div>
            <div id="prompt" style="display:none" class="cancelAllPrompt">
                <h2>Are you sure you want to cancel your subscription?</h2>
                <button id="cancelAll" class="buttonAdapt" onclick="cancelAll()">Yes - Cancel Subscription</button>
                <button id="closePrompt" class="buttonAdapt" onclick="closePrompt()">No</button>
            </div>
        </div>
        <h2>
            Do you want to cancel your subscription?
        </h2>
        <button id="prompt" class="buttonAdapt" onclick="promptCancelAll()">Cancel Subscription</button>
    </div>
</body>`