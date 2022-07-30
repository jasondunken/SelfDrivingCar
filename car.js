class Car {
    constructor(
        x,
        y,
        width,
        height,
        controlType,
        maxSpeed = 3,
        sensorCount = 5,
        sensorLength = 150,
        sensorSpread = 90
    ) {
        this.id = this.#generateId();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rad = Math.hypot(this.width, this.height) / 2;
        this.alpha = Math.atan2(this.width, this.height);

        this.controlType = controlType;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType === "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this, sensorCount, sensorLength, sensorSpread);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls(controlType);
        this.lastOffsets = [];
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map((e) => (e === null ? 0 : 1 - e.offset));
            this.lastOffsets = offsets;
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.reverse = outputs[1];
                this.controls.left = outputs[2];
                this.controls.right = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (pollyIntersect(this.polygon, roadBorders[i])) return true;
        }
        for (let i = 0; i < traffic.length; i++) {
            if (Math.abs(this.y - traffic[i].y < this.height + traffic[i].height)) {
                if (pollyIntersect(this.polygon, traffic[i].polygon)) return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        points.push({
            x: this.x - Math.sin(this.angle - this.alpha) * this.rad,
            y: this.y - Math.cos(this.angle - this.alpha) * this.rad,
        });
        points.push({
            x: this.x - Math.sin(this.angle + this.alpha) * this.rad,
            y: this.y - Math.cos(this.angle + this.alpha) * this.rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - this.alpha) * this.rad,
            y: this.y - Math.cos(Math.PI + this.angle - this.alpha) * this.rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + this.alpha) * this.rad,
            y: this.y - Math.cos(Math.PI + this.angle + this.alpha) * this.rad,
        });
        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

        if (this.speed > 0) this.speed -= this.friction;
        if (this.speed < 0) this.speed += this.friction;

        if (Math.abs(this.speed) < this.friction) this.speed = 0;

        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) this.angle += 0.03 * flip;
            if (this.controls.right) this.angle -= 0.03 * flip;
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, color, drawSensors) {
        if (this.damaged) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if (this.sensor && drawSensors) {
            this.sensor.draw(ctx);
        }
    }

    #generateId() {
        if (typeof this.#generateId.currentId === "undefined") {
            this.#generateId.currentId = 0;
        }
        return ++this.#generateId.currentId;
    }
}
