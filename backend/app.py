from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

app = FastAPI()

# Enable CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Bike Management API"}

@app.get("/predictions")
def get_predictions():
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

    # Create a cursor and execute query
    query = "SELECT bike_id, latitude, longitude, failure_probability FROM bike_predictions ORDER BY failure_probability DESC;"
    df = pd.read_sql(query, conn)

    # Close the connection
    conn.close()

    # Replace inf/-inf and fill NaNs
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)

    # Debug: check data returned
    print(df.head())

    return df.to_dict(orient="records")
