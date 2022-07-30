class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
        // console.log("neuronCounts: ", neuronCounts);
        // console.log("neuralNetwork: ", this.levels);
    }

    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }

    static mutate(brain, config) {
        // console.log("config: ", config);
        brain.levels.forEach((level) => {
            if (config.mutateBiases) {
                if (brain.levels.indexOf(level) == brain.levels.length - 1) {
                    level.biases[0] = lerp(
                        level.biases[0],
                        Math.random() * 2 - 1,
                        config.forwardAlpha
                    );
                    level.biases[1] = lerp(
                        level.biases[1],
                        Math.random() * 2 - 1,
                        config.reverseAlpha
                    );
                    level.biases[2] = lerp(
                        level.biases[2],
                        Math.random() * 2 - 1,
                        config.leftAlpha
                    );
                    level.biases[3] = lerp(
                        level.biases[3],
                        Math.random() * 2 - 1,
                        config.rightAlpha
                    );
                } else {
                    for (let i = 0; i < level.biases.length; i++) {
                        level.biases[i] = lerp(
                            level.biases[i],
                            Math.random() * 2 - 1,
                            config.biasesAlpha
                        );
                    }
                }
            }
            if (config.mutateWeights) {
                for (let i = 0; i < level.weights.length; i++) {
                    for (let j = 0; j < level.weights[i].length; j++) {
                        let alpha = config.weightsAlpha;
                        if (i === 0) {
                            alpha = config.sensorAlphas[i];
                        }
                        level.weights[i][j] = lerp(
                            level.weights[i][j],
                            Math.random() * 2 - 1,
                            alpha
                        );
                    }
                }
            }
        });
    }
}

class Level {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        // biases are the firing thresholds
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}
