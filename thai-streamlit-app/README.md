# Thai Language Learning App 🇹🇭

An interactive Streamlit-based web application for learning Thai characters, featuring OCR recognition and drawing capabilities.

## 🌟 Features

### 1. Learn Thai Letters
- Visual display of Thai consonants and vowels
- Modern script examples
- Organized in easy-to-navigate tabs

### 2. Romanization to Thai Practice
- Interactive drawing canvas for practicing Thai characters
- Real-time OCR recognition with confidence scoring
- Visual feedback on accuracy
- Progress tracking with saved practice images
- Adjustable settings for drawing and recognition

### 3. Thai to Romanization Practice
- Test your knowledge of Thai character pronunciation
- Type romanized versions of displayed Thai characters
- Immediate feedback on correctness
- Progressive learning with character navigation

## 🛠️ Technical Components

- **Frontend**: Streamlit
- **OCR Engine**: EasyOCR
- **Image Processing**: OpenCV
- **Data Management**: Pandas

## 📦 Dependencies

```
streamlit==1.31.1
streamlit-drawable-canvas==0.9.3
easyocr==1.7.1
pillow==10.2.0
pandas==2.2.0
numpy==1.26.3
opencv-python-headless==4.9.0.80
```

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thai-streamlit-app
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## 💻 Usage

1. Start the application:
```bash
streamlit run app.py
```

2. Navigate to the displayed URL (typically `http://localhost:8501`)

3. Use the sidebar to switch between different learning modes:
   - **Learn Thai Letters**: Browse through Thai characters
   - **Romanization to Thai**: Practice writing Thai characters
   - **Thai to Romanization**: Practice pronunciation

## ⚙️ Settings

### Drawing Settings
- **Stroke Width**: Adjust pen thickness (5-30)
- **Canvas Size**: Fixed at 400x400 pixels
- **Background**: White with black stroke

### Recognition Settings
- **Confidence Threshold**: Set minimum recognition confidence
- **Strict/Flexible Matching**: Toggle character matching precision
- **Show Target**: Option to display target character while practicing

## 📊 Progress Tracking

- Practice drawings are saved in `image-logs/` directory
- Each saved image includes:
  - The target Thai character
  - Recognition confidence score
  - Timestamp
- Console logs track recognition accuracy and progress

## 🔧 Troubleshooting

If you encounter issues:
1. Ensure all dependencies are correctly installed
2. Check that your Python version is compatible (3.8+)
3. Verify that your system has sufficient memory for OCR operations
4. For GPU acceleration, ensure CUDA is properly configured

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug fixes
- New features
- Documentation improvements
- Performance enhancements

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
