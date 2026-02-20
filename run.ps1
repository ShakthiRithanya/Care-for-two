# MaatriNet Start Script

Write-Host "Starting MaatriNet... 🚀" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py" -WindowStyle Normal

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "Done! Backend will be at http://localhost:8000 and Frontend at http://localhost:5173" -ForegroundColor Green
