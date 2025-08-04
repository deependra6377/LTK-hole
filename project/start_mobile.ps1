# -------------------------------
# start_mobile.ps1
# Runs backend, frontend, and ngrok tunnels for mobile testing
# -------------------------------

Write-Host "🚀 Starting Hole Detection Project (Frontend + Backend + ngrok)..."

# Step 1: Start backend (FastAPI)
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"cd '$PSScriptRoot\backend'; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

# Step 2: Start frontend (Vite dev server)
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"cd '$PSScriptRoot\frontend'; npm run dev -- --host"

Start-Sleep -Seconds 3

# Step 3: Start ngrok tunnel for backend
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"ngrok http 8000"

# Step 4: Start ngrok tunnel for frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"ngrok http 5173"

Write-Host "✅ All services started! Check ngrok console for HTTPS links."
Write-Host "👉 Use the frontend HTTPS ngrok URL on your mobile browser."