/* Original lecture: visual arguments, testable toy models, and nearby primary sources. */
window.AttentionStories = {
    language: {
        title: 'Start with the bowl. What is learning?',
        intro: 'The trail was… steep? quiet? muddy? Our tiny language model has two adjustable scores. Its marble is one pair of settings; the height is how badly those settings predict ten fictional word examples. Take a step and watch the probabilities change.',
        principle: 'The marble is the model’s settings. The height is its training error.',
        legend: [['training error','#a39aff'],['current model','#ffd481'],['full-data optimum','#72e6ce']],
        limit: 'This is a calculated, convex two-score cross-entropy surface. It has no local traps. A language model has many more parameters and contexts; the bowl is a small slice of the training idea. The marble is not a word, a user, or a neuron.',
        prediction: ['If the loss falls, what has improved?', ['Agreement with the training examples', 'Proof that every answer is true'],0,'Lower loss means better performance on this objective and these examples. Truth and usefulness need additional evaluation.'],
        reasoning: [
            ['Build the address', 'Two scores a and b become probabilities through softmax(a, b, 0). The ten example endings are six “steep,” three “quiet,” and one “muddy.” The target proportions are 0.6, 0.3, and 0.1.'],
            ['Follow the actual discrepancy', 'For either adjustable score, gradient = current probability − selected examples’ frequency. Subtract a fraction of that discrepancy. A one-example update is noisy because its word may differ from the full-data proportions. The surface stays fixed while you sample the same ten rows.'],
            ['Connect to ChatGPT', 'Predicting tokens is a foundation of language-model training. Instruction following also needs additional training and evaluation; the 2022 InstructGPT paper describes demonstrations and human preference feedback. This toy models only token prediction, not every stage or the current proprietary training recipe. Generating a reply is a different operation from retraining the model.']
        ],
        evidence: 'Training connection: <a href="https://arxiv.org/abs/2203.02155">Ouyang et al., 2022 · InstructGPT</a>. The toy example and its numbers are ours.',
        prompt: 'Start at equal probabilities. Predict the direction of an all-ten-example step, then explain why a single “muddy” example can point elsewhere.'
    },
    objective: {
        title: 'Downhill toward… whose goal?',
        intro: 'Imagine two compass destinations: “keep watching” and “glad I spent that time.” A perfectly obedient optimizer follows the destination encoded in its objective. Move the goal-weight slider. The bowl’s lowest point moves even though the update rule stays the same.',
        principle: 'A good optimizer can faithfully optimize a poor proxy for your goal.',
        legend: [['watching target','#ff967f'],['reflection target','#72d6ff'],['weighted optimum','#72e6ce'],['current estimate','#ffd481']],
        limit: 'These are fictional objective targets in an abstract two-knob space, not measured psychological locations. We deliberately change the objective here. In the first studio, random sampling changed the step while leaving the objective fixed.',
        prediction: ['An optimizer reaches the minimum. Has it proved the goal was good?', ['Yes: convergence is the same as wellbeing', 'No: check what the height measures'],1,'Convergence answers a computational question. Choosing an objective is a separate question about what we want and what we can measure.'],
        reasoning: [
            ['Name the proxy', 'A watch, a comment, or a replay is observable. Understanding, enjoyment after the fact, and time spent as intended are harder to measure. A proxy can be informative without being identical to the goal.'],
            ['Move the destination explicitly', 'Our toy loss is a weighted average of squared distances to two target settings. Its minimum is the same weighted average of the targets. The gradient is current settings minus that weighted target; a 25% step moves a quarter of the remaining distance.'],
            ['Keep the machines distinct', 'A chatbot and a recommendation feed can both be trained by optimizing objectives, but they need not use the same data, architecture, or objective. Human preference training for an assistant is not evidence that ChatGPT is simply trained to maximize scrolling.']
        ],
        evidence: 'Engineering context: <a href="https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/">Covington et al., 2016 · candidate generation and ranking</a>. This is a historical example, not a specification of today’s feeds.',
        prompt: 'Give one situation where a long watch means interest and another where it means confusion or disagreement. What extra feedback would distinguish them?'
    },
    ranking: {
        title: 'A hate-watch still leaves a signal',
        intro: 'Welcome to Lunchbreak, a fictional feed with six clips: trail advice, a quiz-stealing goat, pottery, stars, a cliffhanger, and an absurd sock argument. Rank them using predicted watching and comments. Then add “glad I watched.” Which clips pass through the top-three gate?',
        principle: 'Observed engagement does not reveal why someone engaged.',
        legend: [['candidate towers: final score','#72d6ff'],['chosen top three','#ffd481']],
        limit: 'All six clips and scores are fictional and displayed below. Reflection is an assumed report in this toy, not a brain scan. Real feeds use many signals, constraints, and safeguards; “watch time only” is a teaching simplification.',
        prediction: ['A clip gets many comments. What does that establish?', ['People endorse it', 'People commented; their reasons remain uncertain'],1,'Comments can express agreement, correction, amusement, or anger. A single behavior is an ambiguous label.'],
        reasoning: [
            ['Separate prediction from serving', 'A predictor estimates a response. A ranking policy decides which candidates to show. The tower height here is the ranking score, not training loss. No gradient step is happening when you reorder these clips.'],
            ['Inspect the arithmetic', 'Engagement score = (1 − comment weight) × watching + comment weight × comments. Final score blends that result with reflection. These weighted averages use the table’s numbers; the top three really change when the weights change.'],
            ['Notice the ambiguity', 'If the sock argument attracts disagreement, a comments-heavy objective can promote it without knowing anyone enjoyed it. That is a possible mechanism, not proof that every real platform rewards every angry post.']
        ],
        evidence: 'Attention evidence: <a href="https://pubmed.ncbi.nlm.nih.gov/31486666/">Brady et al., 2020</a> found that moral/emotional material captured early visual attention in their experiments, with related patterns in political tweet sharing. That context does not cover every meme or viewer.',
        prompt: 'Compare the goat and the sock argument. Which wins under comments-heavy ranking? What would you ask a viewer before calling that a better recommendation?'
    },
    outrage: {
        title: 'When approval trains the loop',
        intro: 'Creators notice what earns approval. Viewers react. A ranker notices which posts draw a response. When a group rewards outrage, these feedback paths can reinforce one another. Follow one pulse around the loop, then weaken the group’s approval bonus.',
        principle: 'Feedback can amplify an expression without proving a stronger feeling inside.',
        legend: [['creator expectations','#b7a0ff'],['viewer feedback','#ffd481'],['ranker expectations','#72d6ff']],
        limit: 'The three nodes are a diagram, not three physical brain regions. Our bounded two-post-type model assumes an approval advantage for outrage. It demonstrates the consequences of that assumption, not a universal law or a fitted social network.',
        prediction: ['Outrage posts earn more approval in this toy. What might creators learn?', ['That outrage expression gets rewarded here', 'That every viewer secretly feels more anger'],0,'The learned signal concerns rewarded expression. Neither a like nor this simulation measures a viewer’s internal emotion.'],
        reasoning: [
            ['Keep the learners separate', 'A person can learn social expectations; a creator can adapt a posting strategy; a platform can update response predictions. These processes interact but are not one algorithm running inside everybody.'],
            ['Trace a real toy update', 'The chosen post receives a fictional reward. Creator expectation moves 30% toward it; ranker expectation moves 25% toward it. Their combined expectations determine the next type’s sampling probability. A new seed reproduces a different sequence under the same rule.'],
            ['Ask what the evidence measured', 'A 2021 study linked positive feedback to future outrage expression and tested feedback effects experimentally. It measured expression and social learning, not a diagnosis of addiction or a direct readout of anger. Social norms can matter alongside individual rewards.']
        ],
        evidence: '<a href="https://pubmed.ncbi.nlm.nih.gov/34389534/">Brady et al., 2021 · social learning and outrage expression</a>. Our two-type feedback loop is an illustration, not their fitted model.',
        prompt: 'Reset with zero approval bonus and compare two seeded runs. Why can short runs differ even when the expected rewards are the same?'
    },
    surprise: {
        title: 'The surprise lives in the gap',
        intro: 'One stream gives 0.4 reward every time. Another shuffled deck gives three 1.0 rewards and nine 0.2 rewards: the same mean over twelve cards. Their averages match, but their moment-to-moment surprises do not. A tiny clip can promise another laugh or an answer just one item away. Reveal a card and watch an expectation update.',
        principle: 'Reward prediction error is outcome minus expectation, not reward alone.',
        legend: [['predictable rewards','#72d6ff'],['variable rewards','#ffd481'],['learned expectation','#b7a0ff']],
        limit: 'Reward units are invented. The rail is a scalar learning model, not a dopamine meter. Equal average rewards do not imply equal experience, and a variable deck does not prove addiction or that variable content always beats predictable content.',
        prediction: ['Expected reward is 0.4; the card gives 1.0. With a 25% update, what is next?', ['0.55', '1.0', '0.25'],0,'Prediction error = 1.0 − 0.4 = 0.6. New expectation = 0.4 + 0.25 × 0.6 = 0.55.'],
        reasoning: [
            ['Compare outcome with expectation', 'The same outcome can be surprising or ordinary depending on what was expected. Our update is Q_next = Q + 0.25(reward − Q). It has the familiar “move partway toward an observation” structure.'],
            ['Distinguish this from the loss bowl', 'Here Q is a reward expectation. In the opening bowl, the settings predict word probabilities. Similar update shapes do not make human reinforcement learning, supervised model training, and generation identical.'],
            ['Use evidence at its actual scope', 'Lindström and colleagues found reward-learning patterns in social-media posting and experimentally tested social rewards. Applying that idea to anticipation while scrolling is an illustrative extension; their result does not establish that every swipe is conditioned in this exact way.']
        ],
        evidence: '<a href="https://pubmed.ncbi.nlm.nih.gov/33637702/">Lindström et al., 2021 · social rewards and posting behavior</a>. The deck, units, and 25% rate are teaching choices. <a href="https://pubmed.ncbi.nlm.nih.gov/34559816/">van Lieshout et al., 2021</a> also tested curiosity and willingness to wait for uncertain lottery outcomes. Applying that result to a cliffhanger is a hypothesis, not their measured scrolling effect.',
        prompt: 'Run the same twelve cards twice with different orders. Can the final expectation differ although the total reward is unchanged? Explain why recent observations matter.'
    },
    stopping: {
        title: 'A feed can remove the finish line',
        intro: 'A book has a last page. A clip can end while the feed immediately offers another. Our two lanes show identical opportunities, with a decision checkpoint after every fifth clip in one lane. Their height shows the chance of reaching each clip under a fictional continuation rule.',
        principle: 'The decision to continue depends on context as well as the next item.',
        legend: [['no checkpoints','#ff967f'],['decision checkpoints','#72e6ce'],['reach probability','#ffd481']],
        limit: 'This is an assumed mathematical decision rule, not an experimentally measured effect of pause screens. The model ends at twenty clips. People have goals, relationships, fatigue, and agency that a single probability cannot represent.',
        prediction: ['What does a checkpoint change in this experiment?', ['The content’s quality', 'The modeled continuation decision'],1,'Both lanes offer the same twenty opportunities. Only the continuation rule changes at the marked checkpoints.'],
        reasoning: [
            ['Make the missing boundary visible', 'For many feeds, one item ending need not be a natural stopping point. A moment to choose can introduce a boundary. That is a design hypothesis to test, not a guaranteed intervention.'],
            ['Multiply the chances', 'To reach clip six, our model must continue five times. The reach probability is the product of those continuation probabilities. Expected clips is the sum of the twenty reach probabilities; both lanes include the first clip.'],
            ['Translate “brain rot” carefully', 'Here “brain rot” is slang for low-effort, rapidly changing material or the feeling of watching more than intended. It is not a scientific diagnosis or a claim of permanent brain damage. Absurd humor can be enjoyable; the question is whether the time and experience match your intention.']
        ],
        evidence: 'This checkpoint comparison is a classroom hypothesis. Its formula and assumptions are shown in the explanation; it is not a claim of a published effect size.',
        prompt: 'Move effort cost and checkpoint friction separately. Which affects every transition, and which affects only clips 5, 10, and 15?'
    },
    exposure: {
        title: 'The feed teaches the feed',
        intro: 'If a ranker mostly shows the sock argument, it mostly collects evidence about sock arguments. The quiet clip becomes a missing-data direction. In the bowl, that direction is flat: many predictions fit equally well because nothing was observed there. Collect evidence from both types and watch the valley change.',
        principle: 'An unobserved choice is not a disliked choice.',
        legend: [['error to observed rates','#a39aff'],['current predictions','#ffd481'],['minimizing predictions','#72e6ce']],
        limit: 'The dataset changes only when you collect new toy observations. Fitting fixed observations moves the estimate on a fixed surface. The response generator has fixed fictional probabilities; people and real feeds can change over time.',
        prediction: ['Zero quiet clips were shown. What can we infer about their response rate?', ['It is zero', 'This dataset cannot estimate it'],1,'No exposure means no observed responses. That is missing evidence, not evidence of a zero response rate.'],
        reasoning: [
            ['Read the actual counts', 'Start with eight sock-argument exposures and six responses, but no quiet exposures. Our loss compares each prediction with that type’s observed response rate, weighted by its exposure count. It is error to those aggregate rates, not the irreducible variation of individual binary responses. With zero quiet observations, its prediction contributes zero to the objective.'],
            ['Change the data, not the shaking', 'Collecting balanced observations gives the previously flat direction curvature. The fitting update then has evidence for both coordinates. This is why “more shaking” cannot manufacture information absent from the dataset.'],
            ['Keep the inference modest', 'Our generator’s true rates are 0.65 for quiet and 0.75 for the argument. A finite observed rate can differ from either. Balanced exploration reveals evidence; it does not automatically correct every bias or prove that a displayed item is beneficial.']
        ],
        evidence: 'This is an original missing-data demonstration. A ranking system’s choices affect which response labels become observable; that logic is separate from claims about a particular proprietary algorithm.',
        prompt: 'Fit before collecting quiet examples. Why can the loss shrink while the quiet prediction remains arbitrary? Then collect ten observations of each type and refit.'
    },
    redesign: {
        title: 'Choose the bowl before choosing the downhill step',
        intro: 'You are the designer now. Add reflection to the ranking objective, add decision checkpoints, and set an intended clip budget. Explore the design landscape, then search all 121 settings. Compare the resulting feed with the engagement-first baseline.',
        principle: 'Better optimization cannot replace a better definition of success.',
        legend: [['toy design loss','#a39aff'],['your design','#ffd481'],['best of 121 settings','#72e6ce']],
        limit: 'This landscape compares design choices, not neural-network weights. Its reflection scores, penalties, and behavior rule are invented. A numerical winner is the winner of this toy objective; it is not a universal prescription for healthy technology.',
        prediction: ['The grid search finds the best of 121 settings. What still needs testing?', ['Whether people actually prefer and benefit from that design', 'Nothing: the minimum settles it'],0,'The model’s assumptions and omitted goals still need real evaluation. A computed minimum alone cannot establish that a design serves people.'],
        reasoning: [
            ['Make trade-offs inspectable', 'Ranking can balance predicted engagement with a reflective response. Checkpoints can change opportunities to stop. In this model these choices affect different quantities, so the two controls should not be confused.'],
            ['Read the height honestly', 'Toy design loss = (1 − mean reflection)² + 0.06(1 − mean engagement)² + 0.08 × excess expected clips². The clip excess is zero within the budget. Ranking changes discretely, so this surface has steps. We use a finite grid search, not a pretend smooth gradient.'],
            ['Return to ChatGPT', 'The shared lesson is objective design plus evaluation. A fluent token predictor still needs checks for truth and usefulness; an accurate engagement predictor still needs checks for whether its recommendations serve people. The algorithms differ, but neither can answer “what should we want?” from optimization alone.']
        ],
        evidence: '<a href="https://pubmed.ncbi.nlm.nih.gov/42203878/">Brady et al., 2026</a> randomized 2,000 participants to custom feeds over eight weeks. Engagement ranking amplified moralized/emotional material, but did not significantly change users’ own engagement behavior. A different ranking reduced such exposure with comparable enjoyment. These results support testing design alternatives, not this toy’s numerical predictions.',
        prompt: 'Propose one personal choice and one platform design change. Explain the mechanism, what you would measure, and one outcome your model misses.'
    }
};
