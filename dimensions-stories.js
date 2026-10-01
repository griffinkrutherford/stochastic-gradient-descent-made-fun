/* Each visual argument has a prediction, an experiment, and a reason to trust it. */
window.DimensionsStories = {
    ladder: {
        title: 'A dimension is a new freedom',
        intro: 'Imagine a bead on a wire. One number locates it. Free it to move across a sheet and you need two numbers. Lift it off the sheet and you need three. The important idea is freedom to vary one coordinate while holding the others fixed.',
        limit: 'In the fourth step, w is an additional independent coordinate, not a diagonal made from x, y, and z. The screen displays two successive projections; its drawn directions need not look perpendicular.',
        prompt: 'Hold the old coordinates fixed. Which edges change only the newest coordinate?',
        principle: 'Count freedoms before trying to picture them.',
        reasoning: [
            ['Keep the address', 'A square corner has an address such as (1, −1). To build a cube, give that corner two addresses: (1, −1, −1) and (1, −1, +1). The old coordinates have not changed.'],
            ['Copy, then connect', 'Every old corner gets a partner differing only in the new coordinate. Pull the copies apart with the slider. Four square corners become eight cube corners; eight cube corners become sixteen tesseract corners.'],
            ['Let the rule do the seeing', 'The same construction works in any dimension: V(n + 1) = 2V(n), so V(n) = 2ⁿ. We can know that a 5D cube has 32 corners without pretending its drawing is a complete view.']
        ],
        quiz: ['A 5D cube follows the same copy-and-connect rule. How many corners?', ['20', '32', '64'], 1, 'Each of the sixteen 4D corners gets one partner. Sixteen times two is thirty-two. The rule survives even when our mental picture runs out.'],
        demos: [['Start with overlapping copies', {dimension: 4, growth: 0}], ['Pull them into a tesseract', {dimension: 4, growth: 1}], ['Try the same rule in 3D', {dimension: 3, growth: 1}]]
    },
    slice: {
        title: 'An apparent transformation can be a slice',
        intro: 'A Flatlander reports a disk that appears from nowhere, grows, shrinks, and vanishes. From above, we see one unchanged ball passing through the sheet. The mystery comes from confusing the part an observer can access with the whole object.',
        limit: 'The right-hand disk is a map of the Flatlander’s entire 2D section, drawn for us from above. It is not a literal picture of what their eyes would see. A single disk cannot identify the whole 3D shape.',
        prompt: 'Try the pole, the middle, and a point outside. What changed: the whole ball, or the section available to the observer?',
        principle: 'Fix one coordinate; keep the points satisfying that constraint.',
        reasoning: [
            ['Spend a distance budget', 'Inside our unit ball, x² + y² + z² ≤ 1. Fixing the sheet at z = a spends a² of that budget, leaving x² + y² ≤ 1 − a².'],
            ['Read the remaining shape', 'That inequality describes a disk with radius √(1 − a²). At a = 0.6, the remaining budget is 0.64, so the radius is 0.8. At |a| > 1, no points remain.'],
            ['Make a stronger inference', 'One disk could be a section of a ball, cylinder, or another solid. A labeled sequence of sections tells us much more. Scanning a rigid object is different from watching an object physically change size.']
        ],
        quiz: ['At z = 0.6, what is the disk’s radius?', ['0.4', '0.8', '1.0'], 1, 'The radius uses the square root of the remaining squared-distance budget: √(1 − 0.36) = √0.64 = 0.8. Subtracting lengths directly would give the wrong geometry.'],
        demos: [['At the pole', {slice: 1}], ['Spend 0.36 of the budget', {slice: .6}], ['The largest section', {slice: 0}]]
    },
    shadow: {
        title: 'A shadow loses an address',
        intro: 'Stack two beads directly above each other. Their heights differ, but their overhead shadows coincide. An ordinary shadow collects an entire vertical line of possible addresses into one position. The lost coordinate does not stop existing.',
        limit: 'This is orthographic projection: (x, y, z) → (x, y). Rotating the cube changes which coordinates reach the shadow, but a single flat view still cannot recover every depth. A slice selects points; a projection merges points.',
        prompt: 'At zero rotation, follow a cyan corner and its pink partner. Which address digit did the shadow erase?',
        principle: 'Different points can become one visible point.',
        reasoning: [
            ['Find a pair of witnesses', 'The corners (1, 1, −1) and (1, 1, +1) are two units apart. Dropping z sends both to (1, 1). Same shadow does not mean same point.'],
            ['Name the invisible freedom', 'All points (1, 1, z), for any z, share that shadow. This family is called a fiber of the projection. Moving within it is invisible to the map.'],
            ['Use views without trusting one view too much', 'A second view can reveal a separation hidden by the first. But an apparent crossing or coincidence in a drawing is not enough evidence of contact in the original space. We will need this caution for the tesseract.']
        ],
        quiz: ['Two cube corners share one shadow. Must they be the same corner?', ['Yes: one picture position means one point', 'No: their missing depth can differ'], 1, 'Their x and y addresses match, while z can differ. Projection is many-to-one; this is exactly what the overlapping cyan and pink corners demonstrate.'],
        demos: [['Erase the depth completely', {angle: 0}], ['Reveal a hidden separation', {angle: 35}]]
    },
    tesseract: {
        title: 'Turn two coordinates; preserve the object',
        intro: 'A 4D turn is easier to understand as a familiar 2D turn with an unfamiliar pair of axes. Track the white corner in the selected coordinate–w plane. It travels around a circle, just as a point rotates in x–y. Its other two coordinates stay fixed.',
        limit: 'The large view is a projected tesseract. The small circle is a coordinate diagram of the selected rotation plane, not another physical room. Apparent edge lengths and crossings can change in a projection; the actual 4D edge lengths remain two.',
        prompt: 'Turn through 90°. The projected object looks different. Which measurements can prove that the object itself stayed rigid?',
        principle: 'Separate the transformation from the way you display it.',
        reasoning: [
            ['Borrow a rotation you already know', 'For a turn in the a–w plane, a′ = a cos θ − w sin θ and w′ = a sin θ + w cos θ. Here a is whichever axis you selected. The other two coordinates do not change.'],
            ['Track an invariant', 'The selected corner has a² + w² = 2 before and after the turn. Its four-coordinate squared distance stays 4, so it remains two units from the origin. Every edge also remains length two in 4D.'],
            ['Then explain the changing picture', 'Only after rotating do we project to 3D. Perspective divides the first three coordinates by a factor involving w; orthographic projection simply erases w. A rigid object can therefore stretch, overlap, or look nested on screen without doing those things in 4D.']
        ],
        quiz: ['An edge grows longer in the picture during the turn. What can you conclude?', ['The 4D edge must have stretched', 'Its displayed length changed; check its 4D length'], 1, 'The rotation preserves every 4D distance. The projection can change displayed lengths. The live edge-length check measures the original four coordinates, before either screen projection.'],
        demos: [['Watch a quarter-turn', {angle: 90, plane: '0', projection: 'perspective', cell: 'all'}], ['Erase w at zero rotation', {angle: 0, plane: '0', projection: 'orthographic', cell: 'all'}], ['Restore depth-dependent perspective', {angle: 28, projection: 'perspective', cell: 'all'}]]
    },
    net: {
        title: 'The boundary has one fewer freedom',
        intro: 'Take an address inside a cube. It needs three coordinates. On one square face, a coordinate is fixed at +1 or −1, leaving two free. Apply that exact sentence to a tesseract: one of four coordinates is fixed, leaving a whole three-dimensional cube.',
        limit: 'A net lays out boundary pieces after cutting some joins. It is neither the solid’s interior nor a shadow of it. The gap control separates pieces for inspection; it does not animate a true 4D fold.',
        prompt: 'For every choice of a fixed coordinate, there are two signs. Use that to count the boundary cells before inspecting the net.',
        principle: 'A constraint removes a freedom; count coordinate choices and signs.',
        reasoning: [
            ['Understand a cube’s six faces', 'Choose x, y, or z and fix it at either −1 or +1. Three choices times two signs gives six square faces, each with two free coordinates.'],
            ['Count without relying on the drawing', 'For a tesseract, choose x, y, z, or w and fix its sign. Four choices times two gives eight cube cells. A 5D cube similarly has ten 4D boundary cells.'],
            ['Keep interior and boundary distinct', 'A cube cell on a tesseract boundary is a solid 3D region, just as a square face on a cube includes its interior. Eight “rooms” are a useful net analogy; ordinary 3D packing is not the 4D interior.']
        ],
        quiz: ['Why does a tesseract have eight cubic boundary cells?', ['Four coordinate choices × two fixed signs', 'It is made by putting eight cubes inside one another'], 0, 'Fix x, y, z, or w at either endpoint. Each constraint leaves the other three coordinates free. The projected cube-inside-cube picture is not a construction of nested solids.'],
        demos: [['A connected boundary net', {gap: 0}], ['Inspect the eight separate cells', {gap: .65}]]
    },
    hypersphere: {
        title: 'The same budget, one dimension higher',
        intro: 'The rule that explained Flatland carries directly into 4D. Fix w, subtract w² from the unit distance budget, and ask what ordinary 3D object fits the remaining coordinates.',
        limit: 'The green object is a solid 3D section, not a wire picture of the whole 4D ball. The violet unit sphere marks the largest possible section for comparison. w is a fourth spatial coordinate here, not time.',
        prompt: 'Compare w = 0 and w = 0.6. The radius loses only 20%. How much 3D slice volume remains?',
        principle: 'Algebra transports an intuition into a dimension you cannot directly see.',
        reasoning: [
            ['Change only one symbol', 'The 4D unit ball satisfies x² + y² + z² + w² ≤ 1. Fix w = a. The remaining inequality is x² + y² + z² ≤ 1 − a², an ordinary solid 3D ball.'],
            ['Reuse the earlier radius', 'Its radius is again √(1 − a²). At a = 0.6, r = 0.8. We have carried the same argument from a 2D section into a 3D section without needing to visualize a fourth perpendicular arrow.'],
            ['Notice that volume behaves differently', 'Scale a 3D ball by r and its volume scales by r³. A radius of 0.8 means 0.8³ = 0.512: only 51.2% of the central section’s volume. The same radius change has different area and volume consequences.']
        ],
        quiz: ['At w = 0.6, what fraction of the largest 3D section’s volume remains?', ['80%', '64%', '51.2%'], 2, 'The section radius is 0.8, but volume scales in three independent directions: 0.8 × 0.8 × 0.8 = 0.512. The 64% value would be a 2D disk’s area fraction.'],
        demos: [['The largest 3D section', {slice: 0}], ['Radius 0.8; volume 0.512', {slice: .6}], ['A point of contact', {slice: 1}]]
    },
    features: {
        title: 'A recipe is a point. An error is a height.',
        intro: 'Imagine six recipe knobs. One recipe is one address with six numbers. If the map shows only sweetness and sourness, changing crunch moves you through the recipe space while your visible dot stays still. That is a hidden direction, not a mysterious physical dimension.',
        limit: 'These are independently adjustable toy scores, scaled equally. Real features can be correlated and use different units. The radar chart is an encoding of values, not a literal view of 6D space. Our error function is a simple teaching model, not a claim about the best-tasting recipe.',
        prompt: 'Hide the crunch difference, then take a 25% improvement step. Can the full error fall while the map shows no movement?',
        principle: 'Many knobs define the space; error adds a scalar value, not another knob.',
        reasoning: [
            ['Write the whole address', 'The reference recipe is (0, 0, 0, 0, 0, 0). The map retains two coordinate entries. Every other entry still belongs to the recipe, even when the map ignores it.'],
            ['Account for the missing distance', 'With two different map axes, full distance² = visible distance² + hidden distance². The six colored bars account for every squared contribution. At (0, 0, 1, 0, 0, 0), the map distance is zero and the full distance is one.'],
            ['Connect it to learning', 'Our toy error is L = ½(v₁² + ⋯ + v₆²). Moving each knob 25% toward zero gives v_next = 0.75v. The error becomes 0.75² = 56.25% of its previous value. Six knobs mean a 6D parameter space; error is a number assigned to each setting. The graph adds a height coordinate, but that height is determined by the six inputs; it is not a seventh independent knob. A 3D bowl shows the same idea with only two knobs.']
        ],
        quiz: ['The 2D recipe dot stays still after an improvement step. Could the full error have fallen?', ['No: a still dot means nothing changed', 'Yes: hidden coordinates can move toward the target'], 1, 'The displayed axes omit four coordinates. A crunch-only step changes a hidden coordinate, reducing the six-coordinate error while leaving the sweetness–sourness dot fixed. SGD’s sampling randomness comes from selected data rows; hidden coordinates are a separate issue.'],
        demos: [['Hide a crunch-only difference', {values: [0,0,1,0,0,0], x: '0', y: '1'}], ['Make the hidden direction visible', {values: [0,0,1,0,0,0], x: '0', y: '2'}], ['Try six nonzero coordinates', {values: [.7,-.4,.8,.2,.5,-.6], x: '0', y: '1'}]]
    },
    escape: {
        title: 'A barrier depends on the allowed space',
        intro: 'A closed ink loop separates a sheet into inside and outside. A traveler forced to stay on the sheet must cross the ink to escape. Allow one more coordinate, and a continuous lift–travel–land path can go around the same loop without touching it.',
        limit: 'This boundary is an ink curve in z = 0, not a tall wall or a sealed 3D enclosure. The escape works because the allowed path can leave that sheet. A hypothetical fourth-direction escape from a 3D enclosure is an analogy, not a physical travel proposal.',
        prompt: 'Pause where the shadow crosses the ink. Check the actual traveler’s height: is the apparent crossing a real collision?',
        principle: 'An obstruction in a constrained space may disappear when the constraint is removed.',
        reasoning: [
            ['State the constraint', 'In Flatland, allowed positions satisfy z = 0. A continuous path from inside to outside a closed loop on that sheet meets the loop.'],
            ['Find the actual crossing', 'During horizontal travel, the traveler is at z = 1.2. Its shadow can be at the ink boundary’s x and y address, but the ink is at z = 0. Matching only two coordinates is not contact.'],
            ['Do not turn an analogy into a guarantee', 'If we extend the obstacle into a sealed 3D enclosure, or forbid leaving the sheet, the path no longer avoids it. Extra freedom can help only when the obstacle does not block that freedom too.']
        ],
        quiz: ['The traveler’s shadow crosses the ink. Did the traveler touch it?', ['Yes: every crossing in the map is a collision', 'No: compare the third coordinate too'], 1, 'At that moment the traveler’s z coordinate is 1.2, while every ink point has z = 0. Their shadows coincide, but the actual points do not. This is the same lost-coordinate idea as the earlier projection.'],
        demos: [['Start on the sheet', {progress: 0}], ['Pause above the ink crossing', {progress: .3 + .4 * .85 / 1.8}], ['Land beyond the boundary', {progress: 1}]]
    }
};
