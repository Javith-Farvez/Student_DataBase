import os
import sys
import uvicorn

# Ensure app is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.init_db import init_db

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--init-only":
        print("Initializing database...")
        init_db()
        sys.exit(0)

    print("==================================================")
    print("      Starting Campus360 AI Backend Server        ")
    print("==================================================")
    print("Access URL: http://127.0.0.1:8000")
    print("Swagger UI: http://127.0.0.1:8000/docs")
    print("ReDoc UI:   http://127.0.0.1:8000/redoc")
    print("==================================================")
    
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

