const test = require('node:test');
const assert = require('node:assert/strict');
const { check, calculate } = require('../answer-feedback');

test('Algebra slope formulas accept equivalent notation and reject reversed ratios', () => {
    for (const answer of ['(y2-y1)/(x2-x1)', 'm = (y₁-y₂)/(x₁-x₂)', '(y_2-y_1)/(x_2-x_1)', 'rise over run', 'Δy/Δx', 'the change in y divided by the change in x']) {
        assert.equal(check(1, 'algebra', answer).status, 'correct', answer);
    }
    for (const answer of ['(x2-x1)/(y2-y1)', '(y2-y1)/(x1-x2)', 'y2-y1/x2-x1', 'derivative']) {
        assert.equal(check(1, 'algebra', answer).status, 'retry', answer);
    }
});

test('Calculus checks the slope at a point instead of the Algebra answer', () => {
    for (const answer of ["f'(x)", 'dy/dx', 'the derivative', 'instantaneous rate of change']) {
        assert.equal(check(1, 'calculus', answer).status, 'correct', answer);
    }
    for (const answer of ['rise/run', 'not a derivative', "f'(x)=0"]) {
        assert.equal(check(1, 'calculus', answer).status, 'retry', answer);
    }
});

test('vertex formulas distinguish equivalent expressions from missing denominator grouping', () => {
    for (const answer of ['-b/(2a)', 'x = -(b)/(2*a)', '-0.5*b/a', '\\frac{-b}{2a}', '(-b/2)/a']) {
        assert.equal(check(3, 'algebra', answer).status, 'correct', answer);
    }
    for (const answer of ['b/(2a)', '-b/2*a', '-b/2a', '-2a/b']) {
        assert.equal(check(3, 'calculus', answer).status, 'retry', answer);
    }
});

test('zero slope accepts short explanations and catches vertical-line confusion', () => {
    for (const answer of ['horizontal', 'flat', 'horizontal, not vertical']) assert.equal(check(2, 'algebra', answer).status, 'correct');
    for (const answer of ['vertical', 'undefined', 'not horizontal']) assert.equal(check(2, 'calculus', answer).status, 'retry');
    for (const answer of ['0', 'zero', 'The slope is zero.', 'm=0', '1-1', '0 because the line is horizontal']) assert.equal(check(4, 'calculus', answer).status, 'correct', answer);
    assert.equal(check(4, 'algebra', '5').status, 'retry');
});

test('written feedback responds to included and missing ideas without assigning a grade', () => {
    const complete = check(5, 'algebra', 'Negative on the left, zero at the vertex, positive on the right.');
    assert.equal(complete.status, 'review');
    assert.equal(complete.ideas.length, 3);
    const partial = check(10, 'calculus', 'Use the gradient.');
    assert.ok(partial.message.includes('repeated small steps'));
    assert.equal(check(5, 'algebra', 'Positive on the left and negative on the right.').status, 'retry');
    assert.equal(check(7, 'algebra', 'A maximum because more pollution is better.').status, 'retry');
    assert.ok(check(12, 'calculus', 'Shaking always improves accuracy.').message.includes('guarantees'));
    assert.ok(check(13, 'algebra', 'Temperature trains the model.').message.includes('does not train'));
    const temperature = check(13, 'calculus', 'Higher temperature increases variety; lower temperature concentrates the probabilities.');
    assert.equal(temperature.ideas.length, 2);
    assert.ok(check(14, 'algebra', 'Slope helps us update an AI model to reduce error.').ideas.length === 2);
});

test('empty input does not get credit and arithmetic never executes supplied code', () => {
    for (const mode of ['algebra', 'calculus']) {
        for (let question = 1; question <= 14; question++) assert.equal(check(question, mode, '  ').status, 'empty');
    }
    for (const expression of ['process.exit()', 'globalThis.exposed = 1', 'a.constructor', '1/0', '2**3', '(() => 0)()']) {
        assert.throws(() => calculate(expression, { a: 1 }));
    }
    assert.equal(calculate('2(3+4)'), 14);
    assert.equal(calculate('-2^2'), -4);
});
