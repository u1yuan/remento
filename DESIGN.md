# Reusable product design workflow

Use this workflow for any project direction in this workspace. Begin with the current problem and evidence in [RESEARCH.md](RESEARCH.md), then design the smallest experience that tests the riskiest assumption. Keep product-specific decisions in a separate brief, such as [PASA-DESIGN.md](PASA-DESIGN.md), so this workflow remains reusable when the idea changes.

## 1. Set the design brief

Write down the target user, the situation in which the problem occurs, the current workaround, and the cost of the problem. State the one user action the first prototype should make easier. Identify the nearest existing solution and the specific gap the design will test. Mark claims that have not been checked with users as assumptions.

Define a small, observable success condition before drawing screens. Record the constraints that matter to trust, accessibility, privacy, or source accuracy. The brief should be short enough to guide one prototype slice.

## 2. Map the task and states

Draw the shortest path from the user's starting point to a useful outcome. For each step, note what the user knows, what they can do, what the system changes, and how they can recover from a mistake. Include the main path plus the important pending, empty, error, and conflicting states for this problem. Keep the underlying state understandable without animation.

Turn this map into a small set of realistic fixtures and a task a user can attempt without coaching. Give every fixture an expected visible result.

## 3. Explore and select a direction

Sketch multiple ways to organize the same task. Vary the information hierarchy, layout, controls, and visual character rather than only changing colors. When visual exploration is useful, use `product-design:ideate` and select a direction before building it. Record why the selected direction helps the target user and what tradeoff it makes.

Use `emil-design-eng` to assess clarity, feedback, and craft. Use `apple-design` when direct manipulation, immediate response, continuity, or interruptible transitions matter. These are design principles; they do not require an Apple-like appearance. Establish readable typography, clear labels, visible focus, contrast, and layouts that work at the sizes users will actually use.

## 4. Prototype the smallest useful loop

Build the chosen direction with just enough real interaction to complete the task. Preserve the important constraints from the brief, and make sample data clearly recognizable as sample data. Verify every fixture end to end in the rendered interface. Inspect keyboard and touch use, narrow screens, focus order, contrast, and error recovery. Use current documentation through Context7 when a specific library, framework, SDK, API, CLI, or cloud service enters the build.

## 5. Decide where motion belongs

Name any proposed effect precisely with `animation-vocabulary`. For each motion idea, state its purpose: feedback, spatial continuity, state explanation, or smoothing a jarring change. Check how often the user will see it. Keep repeated actions quick and let users act while motion runs. Respect reduced-motion preferences, and ensure words, layout, and controls communicate the same information when motion is absent.

Once an interactive screen exists, use `find-animation-opportunities` to identify justified additions and explicitly reject decorative ones. Once motion code exists, use `improve-animations` for a read-only audit and self-contained improvement plans. Use `review-animations` on motion changes before handoff. Implement any chosen fixes through normal development work, then inspect the rendered behavior. A decision to use no additional motion is valid when it makes the task clearer.

## 6. Test, learn, and revise

Ask users about a recent real instance of the problem before showing the prototype. Then give them the task from step 2 and observe where they hesitate, misread a state, or take an unexpected path. Record what happened separately from what they say they would do. Compare the result with the success condition and the current workaround. Revise the smallest part of the flow that addresses the evidence, then test again before expanding scope.

## Design handoff

For each prototype slice, leave a short project brief with:

- The user, problem, workaround, assumption, and success condition.
- The task flow, fixtures, states, and expected outcomes.
- The selected visual direction and interaction rules.
- The purpose of each animation, or a decision to omit it.
- Results of rendered checks and user observations.
- Open questions and the next smallest change.

## Project-local skill map

The six skills in `.agents/skills` were copied from [adrianabelarde/design-exploration](https://github.com/adrianabelarde/design-exploration/tree/e1fd91427da3e768a5e025b77a5a34e0589c93b9/.agents/skills), commit `e1fd91427da3e768a5e025b77a5a34e0589c93b9`. That repository credits [emilkowalski/skills](https://github.com/emilkowalski/skills) as their source. Apply each when its stage is reached; a code review requires code to inspect.

| Skill | Role in the workflow |
| --- | --- |
| `emil-design-eng` | Shape and review interface details and motion decisions during exploration and prototyping. |
| `apple-design` | Check responsiveness, continuity, gestures, and interruptibility when those interactions exist. |
| `animation-vocabulary` | Give a proposed motion effect a precise name for discussion and implementation. |
| `find-animation-opportunities` | Scan a built interface for justified motion and rejected candidates. |
| `improve-animations` | Audit existing motion and write implementation plans without editing source code. |
| `review-animations` | Review motion code changes against craft, performance, and accessibility criteria. |
