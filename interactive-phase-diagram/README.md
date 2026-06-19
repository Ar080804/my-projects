# Cu–Ag Binary Phase Oracle (by Aditya Raunak)

An interactive Cu–Ag (copper–silver) binary phase diagram explorer. Pick any composition and temperature, and the tool classifies the phase region, applies the lever rule, draws the tie-line, and renders an estimated microstructure.

## Features

- **Interactive diagram** — click anywhere on the SVG phase diagram, or drag the composition/temperature sliders, to pick a state point.
- **Phase classification** — determines whether the point falls in the liquid, α, β, α + L, β + L, or α + β region, including the eutectic isotherm and eutectic point.
- **Lever rule calculations** — automatically computes phase fractions and equilibrium compositions (C_L, C_S or Cα, Cβ) for any two-phase point, with the tie-line drawn on the diagram.
- **Microstructure preview** — a canvas rendering gives a stylized impression of the expected microstructure (e.g. proeutectoid grains + eutectic mixture) for the selected point.
- **Boundary detection** — highlights and labels when the selected point sits on the liquidus, solidus, solvus, eutectic isotherm, or eutectic point.

## Tech stack

Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies. The phase diagram itself is rendered as inline SVG generated at runtime from digitized curve data; the microstructure preview uses the HTML `<canvas>` API.

## Running locally

Clone the repo and open `index.html` directly in a browser, or serve it locally:

```bash
git clone https://github.com/YOUR_USERNAME/cu-ag-phase-oracle.git
cd cu-ag-phase-oracle
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```
.
├── index.html          # Page structure / markup
├── style.css           # All styling
├── script.js           # Diagram data, phase logic, rendering, and interactivity
├── cu_ag_dataset.csv   # Digitized curve data for all phase boundaries
└── README.md
```

## Background

### The Cu–Ag eutectic system

Cu–Ag is a classic binary eutectic system: copper and silver are completely miscible in the liquid state but have limited mutual solid solubility. At equilibrium, the α phase is an FCC solid solution of Ag in a Cu matrix, and the β phase is an FCC solid solution of Cu in an Ag matrix.

The eutectic point sits at approximately **71.9 wt% Ag and 767 °C** (as used in this tool's dataset). Below the eutectic isotherm, any alloy in the two-phase field decomposes into a lamellar or divorced mixture of α and β. Hypoeutectic alloys (< 71.9 wt% Ag) form proeutectoid α grains surrounded by eutectic colonies; hypereutectic alloys (> 71.9 wt% Ag) form proeutectoid β grains instead.

### Phase boundaries represented

| Boundary | Description |
|---|---|
| Liquidus | L → α + L or L → β + L; marks the onset of solidification on cooling |
| Solidus (Cu-rich) | Lower bound of the α + L two-phase field; terminates at the eutectic isotherm |
| Solidus (Ag-rich) | Lower bound of the β + L two-phase field; terminates at the eutectic isotherm |
| Solvus (Cu-rich) | α / (α + β) boundary; marks the limit of Ag solubility in the α phase |
| Solvus (Ag-rich) | β / (α + β) boundary; marks the limit of Cu solubility in the β phase |
| Eutectic isotherm | Horizontal invariant line at T_eut from C_α,max (8.0 wt% Ag) to C_β,min (91.7 wt% Ag) |

### Implementation notes

The diagram curves were digitized from a published Cu–Ag phase diagram and stored as (wt% Ag, T) coordinate arrays in `script.js` and `cu_ag_dataset.csv`. A global temperature shift of **S = 80 °C** is subtracted from all raw digitized temperatures before plotting, calibrating the eutectic isotherm to 767 °C on screen.

The liquidus is not monotone in temperature (it dips to the eutectic minimum and rises again on the Ag-rich side), so the Cu-rich and Ag-rich halves are treated as separate curves and sorted independently before T-based interpolation. The solvus curves are extrapolated linearly beyond the last digitized point down to the display minimum of 220 °C so they close cleanly against the composition axis.

Boundary detection uses minimum pixel-distance from the selected point to each polyline, with a configurable tolerance, rather than a simple temperature comparison — this makes "on liquidus" detection robust to the non-monotone shape and avoids false positives near the eutectic.

### Lever rule

In any two-phase region, the tool computes equilibrium compositions of the two phases by interpolating the bounding curves at the selected temperature, then applies the lever rule:

```
f_right = (C0 - C_left) / (C_right - C_left)
f_left  = 1 - f_right
```

where C_left and C_right are the compositions of the left and right bounding curves at temperature T, and C0 is the overall alloy composition.

## Dataset

The raw digitized curve data is provided separately in `cu_ag_dataset.csv` for reproducibility and reuse. The file contains five curve types — `liquidus`, `solidus_cu`, `solidus_ag`, `solvus_cu`, `solvus_ag` — plus a small table of invariant features (eutectic point, isotherm termini, pure-metal melting points). Each row carries both the raw digitized temperature (`T_raw_C`) and the shifted plot temperature (`T_plot_C = T_raw_C - 80`) so the data can be used independently of the tool's internal shift constant.

See [`cu_ag_dataset.csv`](cu_ag_dataset.csv) for the full tables.
