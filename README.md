# Start AI Services
Start-Process powershell -ArgumentList "cd ai-services; .\venv\Scripts\activate; uvicorn app.main:app --port 8000 --reload"

# Start API Services
Start-Process powershell -ArgumentList "cd api-services; npm run dev"

# Start Frontend
Start-Process powershell -ArgumentList "cd frontend; npm run dev"