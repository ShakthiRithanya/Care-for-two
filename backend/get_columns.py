import pandas as pd

try:
    df = pd.read_excel('../data/RCH_Maternal_Child_5000_Synthetic.xlsx', nrows=0)
    print("ALL_COLUMNS:")
    for col in df.columns.tolist():
        print(f"- {col}")
except Exception as e:
    print("Error:", e)
