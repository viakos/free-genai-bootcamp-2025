## Start Backend
```bash
cd listening-comp-v2
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

## Start Frontend
```bash
cd listening-comp-v2/frontend
streamlit run main.py
```