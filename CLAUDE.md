Always use:
1. astro js, tailwind-4-docs, web-design-guidelines these 3 skills for this project
2. Design.md for designing this project

## MovingCostCalculator

### Region-adjusted pricing (`MovingCostCalculatorLogic.ts`)
- `COUNTRY_COST_MULTIPLIERS`: `{ US: 1.0, CA: 0.95, GB: 1.3, AU: 1.15, IN: 0.35 }`
- `getRegionMultiplier()` detects country from origin/destination and returns the multiplier
- `getRegionLabel()` returns the human-readable region name for display
- Applied inside `renderEstimates()`: base rates × multiplier before currency conversion
- Detected via `detectRegion()` (city/state/country parsing); falls back to 1.0 if unknown
