<p align="center">
  <img src="assets/logo.png" alt="TTTWorks" width="260">
</p>

# TTT Google Maps for Elementor

**A Google Maps widget for Elementor** — custom marker, marker animation, full styling controls.

---

## What it does

- Elementor widget with a native controls panel (no shortcodes)
- Custom logo as the map marker
- Marker animation toggle
- Address / coordinates input with live preview
- Map type, zoom and control configuration

---

## Iteration record

**v1.0.0 → v1.3.1.** The interesting part is a mid-cycle rewrite that cut the JavaScript
from **1,024 lines down to 518** while *adding* controls — the earlier version had grown
by accretion, so it was rebuilt around a clearer separation between map init, marker
handling and control binding.

---

## What this repository is

**Production code, published to show how we build.**

- This is a **snippet**, not an installable plugin. No activation flow, no wp.org release.
- **No installation guide. No support. No portability guarantee.**
- Code assumes an Elementor-based WordPress stack and our own conventions.

---

## License

Apache License 2.0 — permissive, **commercial use permitted**, trademark rights not granted. See [LICENSE](LICENSE).

---

**[TTTWorks](https://tttworks.com)** — Production WordPress engineering.
