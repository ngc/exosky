import matplotlib.pyplot as plt
import numpy as np


# // const SELECTED_STARS_BIG_DIPPER: StarData[] = [
# //   { ra: 206.8843267, dec: 49.31320181, distance: 1882.8, brightness: 31.38 },
# //   { ra: 200.9823734, dec: 54.92525908, distance: 2361.6, brightness: 39.36 },
# //   { ra: 193.5081785, dec: 55.95978478, distance: 2370.6, brightness: 39.51 },
# //   { ra: 183.8573483, dec: 57.03265316, distance: 2430.6, brightness: 40.51 },
# //   { ra: 178.4583668, dec: 53.69479733, distance: 2352.6, brightness: 39.21 },
# //   { ra: 165.4609742, dec: 56.38257749, distance: 2454.0, brightness: 40.9 },
# //   { ra: 165.931965, dec: 61.751035, distance: 1592.4, brightness: 26.54 },
# //   { ra: 183.8573483, dec: 57.03265316, distance: 2430.6, brightness: 40.51 },
# // ];

BIG_DIPPER_STARS = [
    {"ra": 206.8843267, "dec": 49.31320181, "distance": 1882.8, "brightness": 31.38},
    {"ra": 200.9823734, "dec": 54.92525908, "distance": 2361.6, "brightness": 39.36},
    {"ra": 193.5081785, "dec": 55.95978478, "distance": 2370.6, "brightness": 39.51},
    {"ra": 183.8573483, "dec": 57.03265316, "distance": 2430.6, "brightness": 40.51},
    {"ra": 178.4583668, "dec": 53.69479733, "distance": 2352.6, "brightness": 39.21},
    {"ra": 165.4609742, "dec": 56.38257749, "distance": 2454.0, "brightness": 40.9},
    {"ra": 165.931965, "dec": 61.751035, "distance": 1592.4, "brightness": 26.54},
]
# Extract RA, Dec, and brightness
ra = np.array([star["ra"] for star in BIG_DIPPER_STARS])
dec = np.array([star["dec"] for star in BIG_DIPPER_STARS])
brightness = np.array([star["brightness"] for star in BIG_DIPPER_STARS])

# Calculate star sizes based on brightness
# Assuming lower magnitude (brightness) means a brighter star
max_brightness = max(brightness)
star_sizes = (
    max_brightness - brightness + 1
) * 80  # Adjust the multiplier for desired size

# Initialize the plot
fig, ax = plt.subplots(figsize=(8, 6))

# Set background color to black
ax.set_facecolor("black")
fig.patch.set_facecolor("black")

# Plot the stars
scatter = ax.scatter(ra, dec, s=star_sizes, c="white", edgecolors="none", zorder=2)

# Connect the stars in order
ax.plot(ra, dec, color="white", linewidth=1, zorder=1)

# Invert the RA axis to match astronomical convention (RA increases to the left)
ax.invert_xaxis()

# Remove axes and ticks for a cleaner look
ax.set_xticks([])
ax.set_yticks([])
ax.axis("off")

# Adjust plot limits with some padding
ra_padding = (max(ra) - min(ra)) * 0.05
dec_padding = (max(dec) - min(dec)) * 0.05
ax.set_xlim(max(ra) + ra_padding, min(ra) - ra_padding)
ax.set_ylim(min(dec) - dec_padding, max(dec) + dec_padding)

# Save the image with a transparent background
plt.savefig(
    "constellation.png", dpi=300, bbox_inches="tight", facecolor=fig.get_facecolor()
)
plt.show()
