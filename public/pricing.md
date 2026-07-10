# Pricing — MoveCostMatrix

> All estimates are planning ranges based on national averages from the American Moving and Storage Association (AMSA), Federal Motor Carrier Safety Administration (FMCSA) data, and published provider rate schedules. Actual costs vary by weight, distance, season, and add-on services.

## DIY Truck Rental

- **Per-mile rate:** $0.80/mi
- **Base fee range:** $29.95 – $59.95 (truck rental, varies by size)
- **Typical local move (1-bedroom):** $150 – $300
- **Typical long-distance (2-bedroom, 1,000 mi):** $800 – $1,200
- **Typical cross-country (3-bedroom, 2,500 mi):** $2,000 – $3,500
- **Providers:** U-Haul, Budget Truck Rental, Penske
- **Best for:** DIY moves, local relocations, budget-conscious planning

## Moving Containers

- **Per-mile rate:** $1.50/mi
- **Base container fee:** $200 – $600 (includes delivery and pickup)
- **Typical local move (1-bedroom):** $500 – $1,000
- **Typical long-distance (2-bedroom, 1,000 mi):** $1,500 – $2,500
- **Typical cross-country (3-bedroom, 2,500 mi):** $3,500 – $6,000
- **Providers:** PODS, 1-800-PACK-RAT, U-Box (U-Haul)
- **Best for:** Flexible timing, no truck driving, storage-in-transit

## Professional Movers

- **Per-mile rate:** $2.50/mi
- **Base fee range:** $500 – $1,500 (includes packing crew, truck, loading)
- **Typical local move (1-bedroom):** $300 – $600
- **Typical long-distance (2-bedroom, 1,000 mi):** $3,500 – $5,500
- **Typical cross-country (3-bedroom, 2,500 mi):** $7,000 – $12,000
- **Providers:** United Van Lines, Atlas Van Lines, Mayflower, Allied Van Lines
- **Best for:** Full-service convenience, long-distance, fragile or high-value items

## Currency Conversion

All calculations are performed in USD. Display currencies (current market rates):

- USD — United States Dollar (base)
- EUR — Euro
- GBP — British Pound
- CAD — Canadian Dollar
- AUD — Australian Dollar
- INR — Indian Rupee
- JPY — Japanese Yen

## Distance Calculation

- **Method:** Haversine formula + 20% road-adjustment factor
- **Geocoding:** zippopotam.us API (US, CA, GB, AU postal codes) / deterministic fallback for city names
- **Slider range:** 15 – 2,800 miles
- **Unit toggle:** Miles (default) or kilometers (rate converted per-unit)
