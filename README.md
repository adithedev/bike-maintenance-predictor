🚲 Bike Maintenance Prediction System

This project is a machine learning–based predictive maintenance system for a bike-sharing service. It uses real-world usage data (ride history, vibration levels, rain rides, service intervals, etc.) to predict whether a bike requires maintenance.

🔑 Features

Database Integration: Data is stored and fetched from a PostgreSQL database.

Data Preprocessing: Handles missing values, cleans features, and creates additional engineered features such as:

vibration_per_km = average vibration per km since last maintenance

rain_ratio = ratio of rainy rides to days since last serviced

Machine Learning Model: Trains a predictive model to classify whether a bike needs maintenance (needs_maintenance = 1) or not (0).

Modular Design: Easily extendable with new features or different ML algorithms.

📊 Tech Stack

Python (pandas, scikit-learn, psycopg2, matplotlib, seaborn)

PostgreSQL (bike data storage)

Jupyter Notebook (for model development & visualization)

⚙️ How It Works

Connects to PostgreSQL and loads bike feature data.

Drops rows with missing maintenance labels.

Performs feature engineering to enhance prediction accuracy.

Trains and evaluates ML models to predict bike maintenance needs.

🚀 Future Scope

Real-time prediction with a Flask/Django API.

Integration into a bike-sharing dashboard.

Automatic alerts when a bike is due for servicing.
