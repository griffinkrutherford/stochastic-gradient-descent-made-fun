/* Local practice feedback: safely check short formulas and identify ideas in written answers. */
(function (root) {
    'use strict';

    function normalize(value) {
        const subscripts = '₀₁₂₃₄₅₆₇₈₉';
        return String(value).toLowerCase().replace(/[₀-₉]/g, digit => subscripts.indexOf(digit))
            .replace(/([xy])_(?:\{([12])\}|([12]))/g, (_, variable, braced, plain) => variable + (braced || plain))
            .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/')
            .replace(/[’‘]/g, "'").replace(/²/g, '^2').replace(/\s+/g, ' ').trim();
    }

    // A small arithmetic parser, never eval/Function. Unknown names and non-arithmetic syntax fail.
    function calculate(expression, variables = {}) {
        const source = normalize(expression).replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
            .replace(/[{}]/g, match => match === '{' ? '(' : ')').replace(/\s/g, '');
        if (source.length > 250) throw new Error('Expression too long.');
        const tokens = source.match(/[a-z][a-z0-9]*|(?:\d+(?:\.\d*)?|\.\d+)|[()+*/^\-]/g) || [];
        if (!tokens.length || tokens.join('') !== source || tokens.length > 100) throw new Error('Use an arithmetic expression.');
        let position = 0;
        function atom() {
            const token = tokens[position++];
            if (token === '(') {
                const value = sum();
                if (tokens[position++] !== ')') throw new Error('Missing parenthesis.');
                return value;
            }
            if (/^(?:\d|\.)/.test(token || '')) return Number(token);
            if (Object.hasOwn(variables, token)) return variables[token];
            throw new Error('Unknown name.');
        }
        function power() {
            let value = atom();
            if (tokens[position] === '^') { position++; value **= unary(); }
            return value;
        }
        function unary() {
            if (tokens[position] === '+') { position++; return unary(); }
            if (tokens[position] === '-') { position++; return -unary(); }
            return power();
        }
        function product() {
            let value = unary();
            while (position < tokens.length) {
                const token = tokens[position];
                if (token === '*' || token === '/') {
                    position++;
                    const next = unary();
                    value = token === '*' ? value * next : value / next;
                } else if (/^(?:[a-z\d.]|\()/.test(token)) value *= unary();
                else break;
            }
            return value;
        }
        function sum() {
            let value = product();
            while (tokens[position] === '+' || tokens[position] === '-') {
                const token = tokens[position++];
                const next = product();
                value = token === '+' ? value + next : value - next;
            }
            return value;
        }
        const value = sum();
        if (position !== tokens.length || !Number.isFinite(value)) throw new Error('Invalid expression.');
        return value;
    }

    function formulaMatches(text, cases, expected) {
        const expression = text.replace(/^(?:m|slope|x|vertex|x-coordinate)\s*=\s*/, '')
            .split(/\s+(?:because|since)\b/)[0].replace(/[.!]$/, '');
        try {
            return cases.every(values => Math.abs(calculate(expression, values) - expected(values)) < 1e-8);
        } catch { return false; }
    }

    function result(status, message, ideas = []) {
        const titles = { empty: 'Enter your answer first', correct: 'That checks out',
            retry: 'Try another approach', review: 'Feedback on your explanation' };
        return { status, title: titles[status], message, ideas };
    }

    function check(question, mode, answer) {
        const text = normalize(answer);
        if (!text) return result('empty', 'Write a formula or explanation, then check it. You can also open the example explanation below.');
        question = Number(question);
        if (question === 1) {
            if (mode === 'calculus') {
                const derivative = /f\s*'\s*\(\s*x\s*\)|dy\s*\/\s*dx|d\s*\/\s*dx\s*\(?f\s*\(x\)|derivative|instantaneous rate/.test(text);
                if (derivative && !/not (?:the |a )?derivative|isn't (?:the |a )?derivative|=\s*[-\d]|always (?:zero|0)/.test(text)) {
                    return result('correct', 'You identified the derivative: it gives the slope at a point. Common notation is f′(x) or dy/dx.');
                }
                return result('retry', 'For a slope at one point, use derivative notation such as f′(x) or dy/dx. Rise over run describes the slope between two points.');
            }
            const cases = [{ x1: 1, x2: 4, y1: 2, y2: 8 }, { x1: -3, x2: 2, y1: 7, y2: -4 },
                { x1: 5, x2: -2, y1: -9, y2: 6 }, { x1: 0, x2: 8, y1: 3, y2: 3 }];
            if (formulaMatches(text, cases, v => (v.y2 - v.y1) / (v.x2 - v.x1)) ||
                /^(?:slope\s*=\s*)?(?:rise\s*(?:\/|over|divided by)\s*run|(?:the )?(?:change in y|delta y|δy)\s*(?:\/|over|divided by)\s*(?:the )?(?:change in x|delta x|δx))[.!]?$/.test(text)) {
                return result('correct', 'Your expression gives the change in y divided by the change in x. Keep the subtraction order consistent in both parts.');
            }
            return result('retry', 'Put the change in y on top and the change in x underneath. Use the same point order in both differences; parentheses help group them.');
        }
        if (question === 3) {
            const cases = [{ a: 2, b: 6 }, { a: -3, b: 9 }, { a: 0.5, b: -4 }, { a: 7, b: 3 }];
            if (formulaMatches(text, cases, v => -v.b / (2 * v.a))) return result('correct', 'Your expression is equivalent to −b/(2a). The whole 2a belongs in the denominator.');
            return result('retry', 'For ax² + bx + c, the vertex x-coordinate is −b divided by the whole quantity 2a. Try writing it with parentheses.');
        }
        if (question === 4) {
            const value = text.replace(/^(?:(?:the |its |it is )?slope\s*(?:is|equals|=)\s*|it is\s*)/, '')
                .split(/\s+(?:because|since)\b/)[0].replace(/[.!]$/, '');
            if (/^(?:(?:m|slope)\s*=\s*)?(?:zero|horizontal|flat)(?: slope)?$/.test(value)) {
                return result('correct', 'Yes: the line is horizontal, so its slope is zero.');
            }
            if (formulaMatches(value, [{}], () => 0)) return result('correct', 'Yes: zero rise gives slope 0. In Calculus this is the horizontal tangent at the vertex.');
            return result('retry', 'Both equally spaced points have the same height; the tangent at the vertex is also horizontal. What is the rise for a horizontal line?');
        }
        if (question === 2) {
            const direction = text.replace(/(?:not|isn't) (?:a |the )?vertical(?: line)?/g, '');
            if (/vertical|undefined|infinite|not (?:\w+ )?(?:horizontal|flat)/.test(direction)) {
                return result('retry', 'A vertical line has undefined slope. Zero slope means no change in height as you move across: a horizontal line or tangent.');
            }
            if (/horizontal|flat|no (?:vertical )?change|constant (?:height|y)|parallel to (?:the )?x/.test(text)) {
                return result('correct', 'You described a horizontal line or tangent: its height does not change as x changes. A zero slope alone does not always imply a maximum or minimum.');
            }
            return result('retry', 'Describe the direction of the line or tangent. A maximum or minimum may have zero slope, but zero slope by itself only tells us it is horizontal.');
        }
        if (question === 5) {
            const left = /(?:left[^.;]{0,35}(?:negative|decreas|down)|(?:negative|decreas|down)[^.;]{0,35}left|negative[^.;]{0,20}x\s*<\s*0|x\s*<\s*0[^.;]{0,20}negative)/.test(text);
            const right = /(?:right[^.;]{0,35}(?:positive|increas|up)|(?:positive|increas|up)[^.;]{0,35}right|positive[^.;]{0,20}x\s*>\s*0|x\s*>\s*0[^.;]{0,20}positive)/.test(text);
            const middle = /zero|\b0\b|flat|horizontal/.test(text);
            if (/(?:left(?:(?!right|negative|zero).){0,35}positive|positive(?:(?!right|negative|zero).){0,35}left|right(?:(?!left|positive|zero).){0,35}negative|negative(?:(?!left|positive|zero).){0,35}right)/.test(text)) {
                return result('retry', 'Moving from left to right, the curve goes down before the vertex and up afterward. Check the sign on each side.');
            }
            if (left && right && middle) return result('review', 'I found all three parts: negative on the left, zero at the vertex, and positive on the right. Compare your wording with the example.', ['Left: negative', 'Vertex: zero', 'Right: positive']);
            return result('review', 'Describe all three locations: the left side, the vertex, and the right side. Say whether each slope is negative, zero, or positive.', [left && 'Left: negative', middle && 'Vertex: zero', right && 'Right: positive'].filter(Boolean));
        }
        if (question === 7 && /maximum|maximiz|highest|more pollution/.test(text) && !/not (?:the )?maximum|rather than (?:a )?maximum/.test(text)) {
            return result('retry', 'A maximum would mean more pollution. Choose the lower value and explain why that is desirable.');
        }
        if ([11, 12].includes(question) && /always|guarantee|more (?:noise|shaking).*better/.test(text)) {
            return result('review', 'Check the claim that randomness guarantees a better result. Shaking can help in this bowl illustration, but sustained movement can prevent settling. Actual SGD gets randomness from selected training examples.');
        }
        if (question === 13 && /(?:temperature|heat).{0,25}(?:train|learn)|(?:train|learn).{0,25}(?:temperature|heat)/.test(text) && !/does not|doesn't|not retrain|without/.test(text)) {
            return result('review', 'Separate training from output generation. Temperature changes the probabilities used to choose an output; it does not train the model again.');
        }
        const rubrics = {
            6: [['an optimization goal', /minimi|maximi|optimi|cost|profit|pollution|resource|best|lowest|highest/], ['a reason the goal matters', /save|saving|reduc|less|more|improv|efficient|because|benefit/]],
            7: [['a minimum', /minimum|minimiz|lowest|least|lower/], ['less pollution', /pollution|clean|environment|contamin|less|reduc/]],
            8: [['several inputs', /multiple|many|several|more than one|multivari|different (?:factors|variables)/], ['variables that affect a result', /variable|factor|input|depend|dimension|temperature|pressure|time|cost/]],
            9: [['a downhill direction', /downhill|down|decreas|lower|negative gradient|opposite (?:the )?gradient/], ['slope as a guide', /slope|gradient|derivative|steep/], ['repeated steps', /step|repeat|iterat|little|small|keep/]],
            10: [['a downhill update', /downhill|decreas|lower|opposite|negative|subtract/], ['slope or gradient', /slope|gradient|derivative/], ['repeated small steps', /step|repeat|iterat|small|learning rate/]],
            11: [['random movement', /random|shak|noise|stochastic|sample/], ['leaving a shallow dent', /escap|stuck|trap|shallow|local/]],
            12: [['varying updates', /random|shak|noise|sample|stochastic/], ['a possible benefit', /escap|explor|trap|stuck|local/], ['a limit on that benefit', /not always|does not guarantee|doesn't guarantee|too much|settle|decay|fade|less|small|reduce/]],
            13: [['how output variety changes', /variety|variat|divers|creativ|random|predictab|concentrat|spread|probabil/], ['the effect of temperature', /higher|lower|increase|decrease|raise|reduce|hot|cold|up|down/]],
            14: [['a classroom concept', /slope|derivative|gradient|minimum|maximum|parabola|probabil|average|mean|statistic/], ['a connection to the new lesson', /learn|train|predict|optimi|error|loss|ai\b|bowl|marble|model|step/]]
        };
        const rubric = rubrics[question];
        if (!rubric) return result('review', 'Compare your reasoning with the example explanation.');
        const found = rubric.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
        const missing = rubric.filter(([, pattern]) => !pattern.test(text)).map(([name]) => name);
        const message = missing.length
            ? `Try adding ${missing.join(' and ')}. Use the animation or a concrete example to explain the connection.`
            : 'I found the main ideas this question asks about. Check how they connect in your explanation, then compare with the example. Written feedback identifies ideas; it does not assign a grade.';
        return result('review', message, found);
    }

    const api = { check, calculate };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.WorksheetFeedback = api;
})(typeof window !== 'undefined' ? window : globalThis);
