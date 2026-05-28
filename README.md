# Gaze-Aware Scatterplots

**Designing Implicit Gaze-Aware Interactions for Scatterplot Analysis**  
Tania Sanai Shimabukuro, Feiyang Wang, Mariana Shimabukuro, Christopher Collins  
*ETRA '26 — 2026 Symposium on Eye Tracking Research and Applications*

[![DOI](https://img.shields.io/badge/DOI-10.1145%2F3797246.3803027-blue)](https://doi.org/10.1145/3797246.3803027)

---

## Overview

A task-driven approach to designing implicit gaze-aware interactions for scatterplot analysis. Building on scatterplot task taxonomies, this work presents four interaction techniques — Rendering Order, Reference Axis, Hover Speed, and Click Accuracy — that adapt the visualization interface in real time using a gaze-based interest model, without requiring explicit input from the user.

**[Project Website](https://vialab.github.io/GazeAwareScatterplots/website/)**

---

## Repository Structure

```
GazeAwareScatterplots/
├── website/              # Project website (HTML, CSS, JS)
├── NASA-TLX-Data/        # User study results
│   ├── NASA-TLX-Data.xlsx
│   ├── NASA-TLX-Average-CSV.csv
│   └── NASA-TLX-Responses-Raw-CSV.csv
├── QuestionnaireItems.xlsx  # Study questionnaire items
├── images/               # Figures and teaser image
└── videos/               # Technique demonstration videos
```

---

## Supplemental Materials

### Results

The `NASA-TLX-Data/` folder contains workload assessment data collected from 24 participants across all conditions:

- **`NASA-TLX-Data.xlsx`** — full dataset with raw responses per participant
- **`NASA-TLX-Average-CSV.csv`** — averaged scores per condition
- **`NASA-TLX-Responses-Raw-CSV.csv`** — raw responses in CSV format

### System Code

The system implementation will be made available in this repository.

---

## Citation

```bibtex
@inproceedings{shimabukuro2026gaze,
  title={Designing Implicit Gaze-Aware Interactions for Scatterplot Analysis},
  author={Shimabukuro, Tania Sanai and Wang, Feiyang and Shimabukuro, Mariana and Collins, Christopher},
  booktitle={Proceedings of the 2026 Symposium on Eye Tracking Research and Applications (ETRA '26)},
  year={2026},
  month={June},
  address={Marrakesh, Morocco},
  publisher={ACM},
  doi={10.1145/3797246.3803027},
  numpages={8}
}
```

---

## License

© 2026 Ontario Tech University. All rights reserved.
