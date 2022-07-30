/** @type {HTMLCanvasElement} */

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
carCanvas.height = window.innerHeight;

const carCtx = carCanvas.getContext("2d");

let cars = [];
let carsUndamaged = [];
let selectedCarId = "";
let bestCar = null;

let road;
let traffic;

let runAnimation = false;

const CAR_WIDTH = 30;
const CAR_HEIGHT = 50;

const CAR_STARTING_Y = 100;

const TRAFFIC_SPEED = 2;
const DEFAULT_AI_CAR_SPEED = 3;

const DEFAULT_AI_CAR_COUNT = 100;
const DEFAULT_SENSOR_COUNT = 5;
const DEFAULT_SENSOR_LENGTH = 150;
const DEFAULT_SENSOR_SPREAD = 90;

const DEFAULT_MUTATION_ALPHA = 0.1;

initSettingsForm(
    DEFAULT_AI_CAR_COUNT,
    DEFAULT_AI_CAR_SPEED,
    DEFAULT_SENSOR_COUNT,
    DEFAULT_SENSOR_LENGTH,
    DEFAULT_SENSOR_SPREAD
);

let sensorFields = [];
let telemetryFields = [];
initGlobalForm(DEFAULT_MUTATION_ALPHA, settingsForm().sensorCount);

function restart() {
    cancelAnimationFrame(null);
    createTrack();

    cars = generateCars(parseInt(document.getElementById("ai-car-count").value));
    carsUndamaged = cars;
    selectedCarId = carsUndamaged[0].id;
    bestCar = null;

    const mutationConfig = getAlphas(sensorFields);
    if (localStorage.getItem("best-brain")) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(localStorage.getItem("best-brain"));
            if (i != 0) {
                NeuralNetwork.mutate(cars[i].brain, mutationConfig);
            }
        }
    }

    selectedCarIndex = 0;
    document.getElementById("selected-car").value = cars[selectedCarIndex].id;
    if (!runAnimation) {
        runAnimation = true;
        animate();
    }
}

function createTrack() {
    road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    traffic = [
        new Car(road.getLaneCenter(1), -100, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(0), -300, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(2), -300, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(1), -500, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(2), -500, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(0), -700, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(1), -800, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(1), -1000, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(2), -1000, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(0), -1200, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(2), -1200, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(1), -1300, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(0), -1500, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
        new Car(road.getLaneCenter(1), -1500, CAR_WIDTH, CAR_HEIGHT, "DUMMY", TRAFFIC_SPEED),
    ];

    for (let i = 0; i < 100; i++) {
        if (i < 20) {
            traffic.push(
                new Car(
                    road.getLaneCenter(Math.floor(Math.random() * road.laneCount)),
                    -1700 - i * 200,
                    CAR_WIDTH,
                    CAR_HEIGHT,
                    "DUMMY",
                    2
                )
            );
        } else if (i < 40) {
            traffic.push(
                new Car(
                    road.getLaneCenter(Math.floor(Math.random() * road.laneCount)),
                    -1700 - i * 200,
                    Math.floor(Math.random() * 0.4 * CAR_WIDTH) + CAR_WIDTH,
                    Math.floor(Math.random() * CAR_HEIGHT) + CAR_HEIGHT,
                    "DUMMY",
                    2
                )
            );
        } else {
            const lane1 = Math.floor(Math.random() * road.laneCount);
            let lane2 = Math.floor(Math.random() * road.laneCount);
            if (lane1 == lane2) {
                lane2 = lane1 == 0 ? Math.floor(Math.random() * road.laneCount - 1) + 1 : 0;
            }
            traffic.push(new Car(road.getLaneCenter(lane1), -1700 - i * 200, CAR_WIDTH, CAR_HEIGHT, "DUMMY", 2));
            if (Math.floor(Math.random() * 2)) {
                traffic.push(
                    new Car(
                        road.getLaneCenter(lane2),
                        -1700 - i * 200,
                        Math.floor(Math.random() * 0.4 * CAR_WIDTH) + CAR_WIDTH,
                        Math.floor(Math.random() * CAR_HEIGHT) + CAR_HEIGHT,
                        "DUMMY",
                        2
                    )
                );
            }
        }
    }
}

function generateCars(numCars) {
    let cars = [];
    for (let i = 0; i < numCars; i++) {
        cars.push(
            new Car(
                road.getLaneCenter(1),
                CAR_STARTING_Y,
                CAR_WIDTH,
                CAR_HEIGHT,
                "AI",
                settingsForm().carSpeed,
                settingsForm().sensorCount,
                settingsForm().sensorLength,
                settingsForm().sensorSpread
            )
        );
    }
    return cars;
}

function saveSetupSettings() {
    localStorage.setItem("setup-settings", JSON.stringify(settingsForm()));
}

function clearSetupSettings() {
    localStorage.removeItem("setup-settings");
}

function saveGlobalSettings() {
    localStorage.setItem("global-settings", JSON.stringify(globalForm()));
}

function clearGlobalSettings() {
    localStorage.removeItem("global-settings");
}

function saveBest() {
    console.log("brain: ", bestCar.brain);
    localStorage.setItem("best-brain", JSON.stringify(bestCar.brain));
}

function clearBest() {
    localStorage.removeItem("best-brain");
}

function selectBest() {
    if (bestCar) {
        selectedCarId = bestCar.id;
    }
}

function saveSelected() {
    selectedBrains.push(cars[selectedCarIndex].brain);
    localStorage.setItem("other-brains", JSON.stringify(selectedBrains));
}

function clearSelected() {
    localStorage.removeItem("other-brains");
}

function selectCar(dir) {
    if (dir === "up") {
    }
}

function animate() {
    if (runAnimation) {
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.borders, []);
        }
        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
            if (cars[i].y > CAR_STARTING_Y * 3) cars[i].damaged = true;
        }

        bestCar = cars.find((car) => {
            return car.y == Math.min(...cars.map((c) => c.y));
        });
        const selectedCar = cars.find((car) => {
            return car.id === selectedCarId;
        });

        carCanvas.height = window.innerHeight;
        carCtx.save();
        carCtx.translate(0, -selectedCar.y + carCanvas.height * 0.7);

        road.draw(carCtx);
        for (let i = 0; i < traffic.length; i++) {
            if (
                traffic[i].y < selectedCar.y + carCanvas.height / 2 + selectedCar.height &&
                traffic[i].y > selectedCar.y - carCanvas.height - selectedCar.height
            ) {
                traffic[i].draw(carCtx, "purple");
            }
        }

        carCtx.globalAlpha = 0.2;
        for (let i = 0; i < cars.length; i++) {
            cars[i].draw(carCtx, "red");
        }

        carCtx.globalAlpha = 1;
        bestCar.draw(carCtx, "blue");
        selectedCar.draw(carCtx, "orange", true);

        carsUndamaged = cars.filter((car) => {
            return !car.damaged;
        });

        updateTelemetry(carsUndamaged.length, selectedCar);

        carCtx.restore();

        requestAnimationFrame(animate);
    }
}
