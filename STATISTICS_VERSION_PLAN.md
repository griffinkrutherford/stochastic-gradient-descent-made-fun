# Statistics tab: high school worksheet plan

The Statistics lesson lives in the third tab of `index.html`, alongside Algebra II and Calculus. It is designed for a general high school statistics class and requires only averages, graph reading, and simple algebra. The core activity fits a 45–55 minute class period; the final challenge is optional.

## Learning sequence

1. Use a labeled fictional dataset of 12 students' study hours and quiz scores. Calculate the sample mean of the scores (76).
2. Compare an observed score with a prediction using a residual, then see why squared residuals measure misses on both sides of a prediction.
3. Calculate one update by moving a quarter of the way from 60 toward 80, yielding 65. Introduce *learning rate* after the concrete calculation.
4. Explain that SGD's randomness comes from selecting different rows of data. A full-data step always points toward the same sample mean; a small random group may point somewhere else.
5. Predict and test how batch size and learning rate affect a mean estimate. The simulator shows selected rows, their mean, full-data squared error, steps, and observations inspected.
6. Fit a line to the same dataset. Explore its starting height, slope, predictions, residuals, and a best-fit reference without requiring students to derive coefficient updates.
7. Distinguish optimizer variation on the same dataset from variation caused by sampling a different group of students.
8. Explain what a stable model fit does and does not establish. In particular, association does not prove causation, and a settled calculation does not prove the model is appropriate for a larger population.
9. Translate the same estimation ideas into the familiar marble bowl: position represents a candidate fit, height represents prediction error, and moving downhill represents an update. Reuse the original interactive marble bowl while explaining that its extra dents and physical shaking are illustrations, not the quiz-score objective or its sampler.
10. Connect the student table's numerical features to word vectors using the original lens/scanner animation, with its invented axes clearly identified.
11. Reuse the words-falling-into-place and bowl-shaping animations to explain learning from prediction errors. Distinguish the shaping story from the fixed error surface used by our actual estimator.
12. Reuse the output-word, trained-bowl, and probability-bar animations. Predict and observe how temperature changes output choices; distinguish that randomness from the selection of training rows. Finish with a written connection from statistics to AI.

The optional challenge asks how an unusually high score affects an estimate and whether a large step always lowers error. Written questions use “Compare with an explanation”; the three numeric checks accept answers within 0.05 point.

## Mathematical and interaction rules

The mean estimator starts at 60 and updates by `new estimate = old estimate + learning rate × (selected-group mean − old estimate)`. Each update samples a fresh uniform subset of the fixed 12 rows, with no repeated row within a batch. The displayed loss is the average squared error over all 12 scores, so it can rise after a small-batch update. A batch of 12 uses the whole dataset.

The line model predicts `intercept + slope × study hours`. Both parameters update from selected-row prediction errors, using centered and scaled hours internally for stable steps. The displayed line and residuals use the original study-hour and score units. A direct least-squares solution supplies the optional reference line. Random sequences use reproducible seeds for verification and a button to try another sequence.

Keep the original Algebra II and Calculus questions and interactions in their existing shared panel. Switching tabs must hide the other panel, preserve typed work, pause Statistics auto-runs when leaving, and retain keyboard-accessible radio buttons. The Statistics charts need nearby text summaries and labeled axes; no calculus notation is needed in the student lesson.

Move the existing animation widgets between their original positions and the Statistics ending when switching modes; do not duplicate canvas IDs, controls, or animation loops. Restore each original caption when returning to Algebra II or Calculus. A shared pause/play control freezes the bowl and word animations and respects reduced motion while leaving sliders and drag controls usable. Budget 30–35 minutes for the statistical foundation and 15–20 minutes for the shared ending.

## Verification

Run `node --test tests/statistics-core.test.js` to check the dataset, worked mean update, full-batch behavior, reproducible sampling, and line fitting against the direct least-squares solution. Check the three modes and Statistics controls in a browser at desktop and phone widths. Review the wording and pacing with a high school teacher or a small student group before classroom use.

Also check that every shared canvas animates in Statistics, its controls continue working after repeated mode changes, pause and reduced motion freeze the animation state, and the original captions return in the other modes. Publish and verify both the standalone repository and the live portfolio route.
