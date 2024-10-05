from flask import Flask, jsonify, request
import numpy as np
from astropy.io import fits

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import sqlite3
from flask import g

DATABASE = "database.db"


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        # Check if the database exists, if not, create it
        db = sqlite3.connect(DATABASE)
        cursor = db.cursor()

        # Create the constellations table if it doesn't exist
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS constellations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                user_name TEXT,
                image_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        db.commit()
        db = g._database = sqlite3.connect(DATABASE)
    return db


# Load Gaia star data once when the app starts
with fits.open("gaia_stars.fits") as hdul:
    data = hdul[1].data
    # Convert RA, Dec, and other columns to a more manageable form
    ra = data["ra"].tolist()  # Right Ascension (in degrees)
    dec = data["dec"].tolist()  # Declination (in degrees)
    parallax = data["parallax"].tolist()  # Parallax (for distance)
    phot_g_mean_mag = data["phot_g_mean_mag"].tolist()  # G band magnitude
    bp_rp = data["bp_rp"].tolist()
    g_rp = data["g_rp"].tolist()
    bp_g = data["bp_g"].tolist()


# Route to serve star data as JSON
@app.route("/stars", methods=["GET"])
def get_star_data():
    stars = []
    for i in range(len(ra)):
        # Calculate distance from parallax
        if parallax[i] > 0:  # Avoid division by zero
            distance = 1000 / parallax[i]
        else:
            continue

        # Create a star object with necessary fields
        star = {
            "ra": ra[i],
            "dec": dec[i],
            "distance": distance,
            "brightness": phot_g_mean_mag[i],
            "bp_rp": bp_rp[i],
            "g_rp": g_rp[i],
            "bp_g": bp_g[i],
        }
        stars.append(star)

    # Serve the list of stars as JSON
    return jsonify(stars)


@app.route("/submit-constellation", methods=["POST"])
def submit_constellation():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO constellations (name, description, user_name, image_data) VALUES (?, ?, ?, ?)",
        (data["name"], data["description"], data["user_name"], data["image_data"]),
    )
    db.commit()

    return jsonify({"message": "Constellation submitted successfully"}), 200


@app.route("/get-constellations", methods=["GET"])
def get_constellations():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM constellations ORDER BY created_at DESC LIMIT 50")
    constellations = cursor.fetchall()

    # serialize the constellations
    serialized_constellations = []
    for constellation in constellations:
        serialized_constellations.append(
            {
                "id": constellation[0],
                "name": constellation[1],
                "description": constellation[2],
                "user_name": constellation[3],
                "image_data": constellation[4],
            }
        )
    return jsonify(serialized_constellations)


# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True)
