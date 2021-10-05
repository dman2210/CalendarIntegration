document.getElementById('main').innerHTML = `
<div id="mainContainer" class="mainContainer">
        <div style="display:flex;align-items: center;justify-content: center;;">
            <h1 class="changeTitle">
                Change Card on File
            </h1>
        </div>
        <div id="loaderContainer" style="display:flex" class="coverUp">
            <div class="loader"></div>
        </div>
        <div id="squareContainer">
            <form id="payment-form">
                <div id="card-container"></div>
                <button id="card-button" type="button">Change Card on File</button>
            </form>
            <div id="payment-status-container"></div>
        </div>
    </div>`;