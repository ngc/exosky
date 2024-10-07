from astroquery.gaia import Gaia

# Example query for stars within a certain distance


job = Gaia.launch_job_async(
    """
SELECT TOP 10000
    source_id, ra, dec, parallax, phot_g_mean_mag, bp_rp, g_rp, bp_g, random_index
FROM gaiadr3.gaia_source 
WHERE phot_g_mean_mag < 7
ORDER BY random_index
    """
)
results = job.get_results()

# Save the results to a file
results.write("gaia_stars.fits", format="fits", overwrite=True)
