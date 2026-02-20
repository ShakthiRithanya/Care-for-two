import pandas as pd
df = pd.read_excel('../data/RCH_Maternal_Child_5000_Synthetic.xlsx')
col = 'Immunization_Birth_Dose_Status'
print('Value counts:')
print(df[col].value_counts(dropna=False).to_string())
print(f'\nTotal rows: {len(df)}')
delivered = df[df['Delivered'] == 'Yes']
print(f'Delivered rows: {len(delivered)}')
print('\nBirth dose among delivered:')
print(delivered[col].value_counts(dropna=False).to_string())
