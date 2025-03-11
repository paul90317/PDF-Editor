from fastapi import FastAPI
# uvicorn main:app --reload --port 3000

app = FastAPI()
@app.get("/")
def home():
    return "Hello FastAPI"