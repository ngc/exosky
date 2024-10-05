from astroquery.gaia import Gaia

# Example query for stars within a certain distance


job = Gaia.launch_job_async(
    """
SELECT TOP 100000 
    source_id, ra, dec, parallax, phot_g_mean_mag, bp_rp
FROM gaiadr3.gaia_source 
WHERE phot_g_mean_mag < 6
ORDER BY phot_g_mean_mag ASC
    """
)
results = job.get_results()

# Save the results to a file
results.write("gaia_stars.fits", format="fits", overwrite=True)
