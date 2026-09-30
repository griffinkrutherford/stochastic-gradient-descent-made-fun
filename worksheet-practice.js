(function () {
    'use strict';
    const storageKey = 'sgd-worksheet-practice-v1';
    let saved = {};
    let storageAvailable = true;
    let mode = 'algebra';
    try {
        const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
    } catch { storageAvailable = false; }

    const entries = [...document.querySelectorAll('#original-worksheet .submit-answer')].map(button => {
        const number = button.dataset.question;
        const input = button.closest('.question').querySelector('input[type="text"], textarea');
        const feedback = document.getElementById(`answer-${number}`);
        input.id = `practice-input-${number}`;
        const label = document.createElement('label');
        label.className = 'practice-label';
        label.htmlFor = input.id;
        label.textContent = `Your answer to Question ${number}`;
        input.before(label);
        feedback.setAttribute('aria-live', 'polite');
        input.setAttribute('aria-describedby', feedback.id);
        button.textContent = 'Check answer';
        button.type = 'button';
        const explanation = document.createElement('details');
        explanation.className = 'practice-explanation';
        const summary = document.createElement('summary');
        summary.textContent = 'Compare with an explanation';
        const example = document.createElement('div');
        explanation.append(summary, example);
        feedback.after(explanation);
        const entry = { number, input, feedback, example, explanation };
        button.addEventListener('click', () => submit(entry));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter' && (input.tagName === 'INPUT' || event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                submit(entry);
            }
        });
        input.addEventListener('input', () => {
            drafts()[number] = { text: input.value, checked: false };
            feedback.classList.remove('visible');
            persist();
        });
        return entry;
    });

    function drafts() {
        if (!saved[mode] || typeof saved[mode] !== 'object' || Array.isArray(saved[mode])) saved[mode] = {};
        return saved[mode];
    }

    function progress() {
        const checked = entries.filter(({ number }) => {
            const draft = drafts()[number];
            return draft?.checked && typeof draft.text === 'string' && draft.text.trim();
        }).length;
        document.getElementById('practice-progress').textContent = `${checked} of ${entries.length} responses checked. ` +
            (storageAvailable ? 'Answers are saved in this browser, separately for each version.' : 'Answers are kept while this page is open.');
    }

    function persist() {
        try { localStorage.setItem(storageKey, JSON.stringify(saved)); }
        catch { storageAvailable = false; }
        progress();
    }

    function renderFeedback(entry) {
        const result = window.WorksheetFeedback.check(entry.number, mode, entry.input.value);
        entry.feedback.replaceChildren();
        entry.feedback.dataset.result = result.status;
        const title = document.createElement('strong');
        title.textContent = result.title;
        const message = document.createElement('p');
        message.textContent = result.message;
        entry.feedback.append(title, message);
        if (result.ideas.length) {
            const ideas = document.createElement('p');
            ideas.className = 'practice-recognized';
            ideas.textContent = `Ideas recognized: ${result.ideas.join('; ')}.`;
            entry.feedback.append(ideas);
        }
        entry.feedback.classList.add('visible');
        return result;
    }

    function submit(entry) {
        const result = renderFeedback(entry);
        drafts()[entry.number] = { text: entry.input.value, checked: result.status !== 'empty' };
        persist();
    }

    window.restoreWorksheetPractice = (selectedMode, examples) => {
        mode = selectedMode;
        for (const entry of entries) {
            const draft = drafts()[entry.number];
            entry.input.value = typeof draft?.text === 'string' ? draft.text : '';
            entry.example.innerHTML = examples[entry.number];
            entry.explanation.open = false;
            entry.feedback.classList.remove('visible');
            if (draft?.checked && entry.input.value.trim()) renderFeedback(entry);
        }
        progress();
    };
})();
