exoplanet_pos = {
    "ra": 217.4292,  # RA in degrees
    "dec": -62.6795,  # Dec in degrees
    "distance": 1.295,  # Distance in parsecs
}
import numpy as np
import matplotlib.pyplot as plt
from astropy.io import fits
from astropy.coordinates import SkyCoord
import astropy.units as u

# Load Gaia data (e.g., the file you downloaded as 'gaia_stars.fits')
with fits.open("gaia_stars.fits") as hdul:
    data = hdul[1].data
    ra = data["ra"]  # Right Ascension (in degrees)
    dec = data["dec"]  # Declination (in degrees)
    phot_g_mean_mag = data["phot_g_mean_mag"]  # Photometric G band mean magnitude

# Shift RA/Dec to the exoplanet's perspective (same as before)
ra_shifted = ra - exoplanet_pos["ra"]
dec_shifted = dec - exoplanet_pos["dec"]

# Normalize RA to [-180, 180] range
ra_shifted = np.mod(ra_shifted + 180, 360) - 180

# Brightness scaling
brightness = 10 ** (-0.4 * (phot_g_mean_mag - np.min(phot_g_mean_mag)))

# Create an equirectangular projection
fig = plt.figure(figsize=(12, 6), frameon=False)
ax = fig.add_subplot(111, projection="rectilinear")
ax.set_axis_off()

# Scatter plot stars on equirectangular projection


ax.scatter(
    np.radians(ra_shifted),
    np.radians(dec_shifted),
    s=brightness * 1.2,
    color="white",
    alpha=0.8,
)

# Set black background
ax.set_facecolor("black")

# Save the image as a high-res PNG
plt.savefig(
    "star_map_equirectangular.jpg",
    dpi=300,
    bbox_inches="tight",
    pad_inches=0,
)


# Show the plot
plt.show()
