function initSettingsForm(carCount, carSpeed, sensorCount, sensorLength, sensorSpread) {
    if (localStorage.getItem("setup-settings")) {
        const settings = JSON.parse(localStorage.getItem("setup-settings"));
        carCount = parseInt(settings.carCount);
        carSpeed = parseFloat(settings.carSpeed);
        sensorCount = parseInt(settings.sensorCount);
        sensorLength = parseInt(settings.sensorLength);
        sensorSpread = parseInt(settings.sensorSpread);
    }
    document.getElementById("ai-car-count").value = carCount;
    document.getElementById("ai-car-speed").value = carSpeed;
    document.getElementById("sensor-count").value = sensorCount;
    document.getElementById("sensor-length").value = sensorLength;
    document.getElementById("sensor-spread").value = sensorSpread;
}

function settingsForm() {
    return {
        carCount: parseInt(document.getElementById("ai-car-count").value),
        carSpeed: parseFloat(document.getElementById("ai-car-speed").value),
        sensorCount: parseInt(document.getElementById("sensor-count").value),
        sensorLength: parseInt(document.getElementById("sensor-length").value),
        sensorSpread: parseInt(document.getElementById("sensor-spread").value),
    };
}

function initGlobalForm(defaultMutationAlpha, sensorCount) {
    updateSensorFields(sensorCount);
    let biasesAlpha = defaultMutationAlpha;
    let weightsAlpha = defaultMutationAlpha;
    let forwardAlpha = defaultMutationAlpha;
    let reverseAlpha = defaultMutationAlpha;
    let leftAlpha = defaultMutationAlpha;
    let rightAlpha = defaultMutationAlpha;
    if (localStorage.getItem("global-settings")) {
        const settings = JSON.parse(localStorage.getItem("global-settings"));
        biasesAlpha = parseFloat(settings.biases);
        weightsAlpha = parseFloat(settings.weights);
        const sensorFields = document.getElementById("sensor-fields").children;
        for (let i = 0; i < sensorFields.length; i++) {
            const field = sensorFields[i];
            const id = field.children[1].id;
            document.getElementById(id).value = settings.sensorAlphas[i];
        }
        forwardAlpha = parseFloat(settings.forward);
        reverseAlpha = parseFloat(settings.reverse);
        leftAlpha = parseFloat(settings.left);
        rightAlpha = parseFloat(settings.right);
    }
    document.getElementById("biases-alpha").value = biasesAlpha;
    document.getElementById("weights-alpha").value = weightsAlpha;
    document.getElementById("forward-alpha").value = forwardAlpha;
    document.getElementById("reverse-alpha").value = reverseAlpha;
    document.getElementById("left-alpha").value = leftAlpha;
    document.getElementById("right-alpha").value = rightAlpha;
}

function globalForm() {
    const sensorFields = document.getElementById("sensor-fields").children;
    const sensorAlphas = [];
    for (let field of sensorFields) {
        const id = field.children[1].id;
        sensorAlphas.push(parseFloat(document.getElementById(id).value));
    }
    return {
        biases: parseFloat(document.getElementById("biases-alpha").value),
        sensorAlphas,
        weights: parseFloat(document.getElementById("weights-alpha").value),
        forward: parseFloat(document.getElementById("forward-alpha").value),
        reverse: parseFloat(document.getElementById("reverse-alpha").value),
        left: parseFloat(document.getElementById("left-alpha").value),
        right: parseFloat(document.getElementById("right-alpha").value),
    };
}

function getAlphas(sensorFields) {
    const sensorAlphas = [];
    sensorFields.forEach((sensorId) => {
        sensorAlphas.push(parseFloat(document.getElementById(sensorId).value));
    });
    return {
        mutateBiases: document.getElementById("mutate-biases").checked,
        biasesAlpha: parseFloat(document.getElementById("biases-alpha").value),
        mutateWeights: document.getElementById("mutate-weights").checked,
        weightsAlpha: parseFloat(document.getElementById("weights-alpha").value),
        forwardAlpha: parseFloat(document.getElementById("forward-alpha").value),
        reverseAlpha: parseFloat(document.getElementById("reverse-alpha").value),
        leftAlpha: parseFloat(document.getElementById("left-alpha").value),
        rightAlpha: parseFloat(document.getElementById("right-alpha").value),
        sensorAlphas,
    };
}

function updateSensorFields(sensorCount) {
    sensorFields = [];
    telemetryFields = [];
    let sensorFieldsHtml = "";
    let telemetryFieldsHtml = "";
    for (let i = 0; i < sensorCount; i++) {
        const sensorId = `sensor-${i + 1}-alpha`;
        sensorFields.push(sensorId);
        sensorFieldsHtml += `<div class="row">
                <label for="${sensorId}">Sensor ${i + 1} Alpha</label>
                <input
                    type="number"
                    name="${sensorId}"
                    id="${sensorId}"
                    min="0"
                    max="1"
                    step="0.0001"
                />
            </div>`;
        const telemetryId = `sensor-${i + 1}-offset`;
        telemetryFields.push(telemetryId);
        telemetryFieldsHtml += `<div class="row">
                <label for="${telemetryId}">Sensor ${i + 1} Offset</label>
                <input
                    type="number"
                    name="${telemetryId}"
                    id="${telemetryId}"
                    readonly
                />
            </div>`;
    }
    const sensorFieldsElement = document.getElementById("sensor-fields");
    sensorFieldsElement.innerHTML = sensorFieldsHtml;
    sensorFields.forEach((id) => {
        document.getElementById(id).value = DEFAULT_MUTATION_ALPHA;
    });

    const telemetryFieldsElement = document.getElementById("telemetry-fields");
    telemetryFieldsElement.innerHTML = telemetryFieldsHtml;
}
