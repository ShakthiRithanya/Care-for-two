import pandas as pd
import os

try:
    df = pd.read_excel('../data/RCH_Maternal_Child_5000_Synthetic.xlsx', nrows=5)
    print("Columns:", df.columns.tolist())
    print("\nFirst 5 Rows:")
    print(df.head().to_string())
except Exception as e:
    print("Error reading Excel:", e)
