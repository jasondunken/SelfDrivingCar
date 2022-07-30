function updateTelemetry(undamagedCount, car) {
    document.getElementById("total-cars-alive").value = undamagedCount;

    let offsets = car.lastOffsets;
    for (let i = 0; i < offsets.length; i++) {
        document.getElementById(telemetryFields[i]).value = offsets[i];
    }

    let forwardOn = car.controls.forward;
    if (forwardOn) {
        document.getElementById("forward-indicator").classList.add("on");
    } else {
        document.getElementById("forward-indicator").classList.remove("on");
    }
    let reverseOn = car.controls.reverse;
    if (reverseOn) {
        document.getElementById("reverse-indicator").classList.add("on");
    } else {
        document.getElementById("reverse-indicator").classList.remove("on");
    }
    let leftOn = car.controls.left;
    if (leftOn) {
        document.getElementById("left-indicator").classList.add("on");
    } else {
        document.getElementById("left-indicator").classList.remove("on");
    }
    let rightOn = car.controls.right;
    if (rightOn) {
        document.getElementById("right-indicator").classList.add("on");
    } else {
        document.getElementById("right-indicator").classList.remove("on");
    }
}
