## Start Backend
```bash
cd listening-comp
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

## Start Frontend
```bash
cd listening-comp/frontend
streamlit run main.py
```