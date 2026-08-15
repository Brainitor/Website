# Brainitor Protocol Lab

Static, dependency-free HTML demo of three visual memory protocols described in Polk et al. (2026):

- MDT-OS (Snapshot)
- ORR (Room Recall)
- CSR (Scene Memory)

## Run locally

From the repository root:

```bash
python3 -m http.server 4173 --directory Website/protocol-demo
```

Then open `http://127.0.0.1:4173`.

## Review scope

The phone view is a shortened interactive flow. The scientist inspector preserves the full protocol blueprint, distinguishes paper-verified details from demo assumptions, shows local event telemetry, and calculates review-only sample scores.

The scientific review guide opens when the demo loads and can be reopened from the header. It summarizes the three implemented flows, gives a recommended review sequence, explains the timing control, and states the boundaries of the demo.

This is not a validated assessment. The AI-generated stimuli, abbreviated trial counts, timing acceleration, hit boxes, and reviewer delay bypass exist only to review implementation mechanics.

Protocol timing is the default. The optional **Accelerated walkthrough** reduces MDT and ORR stimulus exposure for rapid interaction review. CSR inserts a 500 ms neutral interval between scenes; this is an explicitly labeled implementation assumption because the cited papers do not report an exact inter-image interval.

## Generated stimulus pipeline

- ORR rooms are assembled at runtime from three generated empty-room backplates and seven reusable transparent object layers.
- MDT exact repeats reuse the same pixels. Demo lure differences are deterministic CSS changes layered over the same source assets, so the diffusion model cannot introduce uncontrolled changes between a base and test image.
- CSR uses nine independent generated photographic scenes: six encoded images and three new recognition foils.
- Optimized JPEG derivatives are served for room and scene photographs; the original generated PNGs and keyed object source plates remain in the asset tree for review.
- `assets/generated/manifest.json` records the generator mode, source roles, prompt briefs, and scientific-use limitations.

## Suggested scientific review

1. Confirm the MDT one-back and interleaved two-back sequence, repeat/lure balance, and change-localization response.
2. Confirm ORR encoding, immediate recall, delayed recall, and the two distractor classes.
3. Confirm CSR cover judgment, 65-minute delay gate, and old/new/unsure recognition logic.
4. Check that no per-trial correctness or running score appears inside the participant view.
5. Check the distraction and concentration questions after both phases.
6. Inspect the Events tab for onset, response, reaction-time, timeout, delay, and context fields.
7. Inspect the Scoring tab for formulas and sample error typing.
8. Review every yellow DEMO label before treating its value as protocol-locked.
