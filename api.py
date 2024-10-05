from flask import Flask, jsonify
import numpy as np
from astropy.io import fits

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load Gaia star data once when the app starts
with fits.open("gaia_stars.fits") as hdul:
    data = hdul[1].data
    # Convert RA, Dec, and other columns to a more manageable form
    ra = data["ra"].tolist()  # Right Ascension (in degrees)
    dec = data["dec"].tolist()  # Declination (in degrees)
    parallax = data["parallax"].tolist()  # Parallax (for distance)
    phot_g_mean_mag = data["phot_g_mean_mag"].tolist()  # G band magnitude


# Route to serve star data as JSON
@app.route("/stars", methods=["GET"])
def get_star_data():
    stars = []
    for i in range(len(ra)):
        # Calculate distance from parallax
        if parallax[i] > 0:  # Avoid division by zero
            distance = 1000 / parallax[i]
        else:
            distance = None

        # Create a star object with necessary fields
        star = {
            "ra": ra[i],
            "dec": dec[i],
            "distance": distance,
            "brightness": phot_g_mean_mag[i],
        }
        stars.append(star)

    # Serve the list of stars as JSON
    return jsonify(stars)


# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True)
