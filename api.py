from flask import Flask, jsonify, request
import numpy as np
from astropy.io import fits
from astropy.coordinates import SkyCoord, ICRS
import astropy.units as u
import pandas as pd

from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers="*",
    expose_headers="*",
    methods="*",
)


def csv_to_dict_list(file_path="exoplanets.csv"):
    df = pd.read_csv(file_path)
    df_filtered = df[["pl_name", "ra", "dec", "sy_dist"]]
    dict_list = df_filtered.to_dict(orient="records")

    final_list = []
    name_set = set()

    # change the key names to name, ra, dec, distance
    for index, item in enumerate(dict_list):
        item["id"] = index
        item["name"] = item["pl_name"]
        item["ra"] = item["ra"]
        item["dec"] = item["dec"]
        item["distance"] = item["sy_dist"]
        del item["pl_name"]
        del item["sy_dist"]

        # if none of the keys are none, add the item to the final list
        if (
            not any(value is None for value in item.values())
            and not np.isnan(item["distance"])
            and item["name"] not in name_set
        ):
            print(item["distance"])
            name_set.add(item["name"])
            final_list.append(item)

    return final_list


import sqlite3
from flask import g

DATABASE = "database.db"

EXOPLANETS = csv_to_dict_list()


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


# Route to serve star data as JSON for a specific exoplanet
@app.route("/stars/<int:exoplanet_id>", methods=["GET"])
def get_star_data(exoplanet_id):
    # Load the exoplanet with the given id
    exoplanet = next((e for e in EXOPLANETS if e["id"] == exoplanet_id), None)
    if not exoplanet:
        return jsonify({"error": "Exoplanet not found"}), 404

    # Create SkyCoord objects for Earth and the exoplanet
    earth_coord = SkyCoord(
        ra=0 * u.degree, dec=0 * u.degree, distance=0 * u.pc, frame="icrs"
    )
    exoplanet_coord = SkyCoord(
        ra=exoplanet["ra"] * u.degree,
        dec=exoplanet["dec"] * u.degree,
        distance=exoplanet["distance"] * u.pc,
        frame="icrs",
    )

    # Initialize list to hold transformed star data
    transformed_stars = []

    # Loop through each star and transform coordinates relative to the exoplanet
    for i in range(len(ra)):
        if parallax[i] <= 0:
            continue  # Skip stars with invalid parallax

        # Calculate distance from parallax (parsec)
        distance_pc = 1000 / parallax[i]  # parallax in mas to distance in parsec

        # Create SkyCoord object for the star
        star_coord = SkyCoord(
            ra=ra[i] * u.degree,
            dec=dec[i] * u.degree,
            distance=distance_pc * u.pc,
            frame="icrs",
        )

        # Transform star coordinates to the exoplanet's frame
        relative_coord = star_coord.transform_to(exoplanet_coord.frame)

        # Get the transformed RA, Dec, and distance relative to the exoplanet
        rel_ra = relative_coord.ra.degree
        rel_dec = relative_coord.dec.degree
        rel_distance = relative_coord.distance.value  # in parsec

        # Optional: Filter stars within a certain angular distance from the exoplanet
        # For example, within 180 degrees to cover the entire sky
        # You can adjust this based on your requirements
        separation = star_coord.separation(exoplanet_coord).degree
        if separation > 180:
            continue

        # Create a star object with necessary fields
        if any(
            value is None
            for value in [
                rel_ra,
                rel_dec,
                rel_distance,
                phot_g_mean_mag[i],
                bp_rp[i],
                g_rp[i],
                bp_g[i],
            ]
        ) or any(
            np.isnan(value)
            for value in [
                rel_ra,
                rel_dec,
                rel_distance,
                phot_g_mean_mag[i],
                bp_rp[i],
                g_rp[i],
                bp_g[i],
            ]
        ):
            continue
        star = {
            "ra": rel_ra,
            "dec": rel_dec,
            "distance": rel_distance,  # in parsec
            "brightness": phot_g_mean_mag[i],
            "bp_rp": bp_rp[i],
            "g_rp": g_rp[i],
            "bp_g": bp_g[i],
        }
        transformed_stars.append(star)

    # Serve the list of transformed stars as JSON
    return jsonify(transformed_stars)


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


# get exoplanet names and ids route
@app.route("/exoplanets", methods=["GET"])
def get_exoplanets():
    return jsonify(EXOPLANETS)


# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5001)
