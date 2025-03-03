# /mnt/c/Users/lviva/Documents/TRAINING/AI/GenAI_Bootcamp/free-genai-bootcamp-2025/thai-streamlit-app/app.py
from typing import Literal, Tuple
import streamlit as st
from pathlib import Path
import pandas as pd
from streamlit_drawable_canvas import st_canvas
import numpy as np
from ocr_utils import ThaiOCR

# Initialize OCR
@st.cache_resource
def get_ocr() -> ThaiOCR:
    """Get or create OCR instance."""
    return ThaiOCR()

def load_thai_chars() -> pd.DataFrame:
    """Load Thai characters from CSV."""
    csv_path = Path(__file__).parent / "data" / "thai-consonants.csv"
    return pd.read_csv(csv_path, sep=';')

def load_css() -> None:
    """Load external CSS file."""
    css_file = Path(__file__).parent / "styles" / "main.css"
    with open(css_file) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def set_page_config() -> None:
    """Configure the Streamlit page settings."""
    st.set_page_config(
        page_title="Thai Language Learning",
        page_icon="🇹🇭",
        layout="wide"
    )
    load_css()

def initialize_session_state() -> None:
    """Initialize session state variables if they don't exist."""
    if 'current_page' not in st.session_state:
        st.session_state.current_page = "Learn Thai Letters"
    if 'current_char_index' not in st.session_state:
        st.session_state.current_char_index = 0
    if 'thai_chars' not in st.session_state:
        st.session_state.thai_chars = load_thai_chars()
    if 'settings' not in st.session_state:
        st.session_state.settings = {
            'stroke_width': 10,
            'confidence_threshold': 0.3,
            'show_target': False,
            'strict_matching': True
        }
    if 'canvas_key' not in st.session_state:
        st.session_state.canvas_key = 0
    if 'current_confidence' not in st.session_state:
        st.session_state.current_confidence = 0.0
    if 'thai_to_roman_index' not in st.session_state:
        st.session_state.thai_to_roman_index = 0
    if 'input_key' not in st.session_state:
        st.session_state.input_key = 0

def clear_canvas():
    """Clear the canvas by incrementing the key."""
    st.session_state.canvas_key += 1
    st.session_state.current_confidence = 0.0

def create_confidence_bar_html(confidence: float) -> str:
    """Create HTML for a gradient progress bar."""
    width_percent = confidence * 100
    return f"""
        <div style="
            width: 100%;
            height: 20px;
            background: linear-gradient(to right, #ff0000, #ffff00, #00ff00);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        ">
            <div style="
                width: {width_percent}%;
                height: 100%;
                background: white;
                float: right;
                opacity: 0.8;
            "></div>
        </div>
        <div style="text-align: center; margin-top: 5px;">
            Recognition Confidence: {width_percent:.1f}%
        </div>
    """

def show_settings() -> None:
    """Display and handle settings in the sidebar."""
    st.sidebar.markdown("---")
    st.sidebar.header("Settings")
    
    # Drawing settings
    st.sidebar.subheader("Drawing")
    stroke_width = st.sidebar.slider(
        "Stroke Width",
        min_value=5,
        max_value=30,
        value=st.session_state.settings['stroke_width'],
        step=1
    )
    st.session_state.settings['stroke_width'] = stroke_width
    
    # Recognition settings
    st.sidebar.subheader("Recognition")
    confidence = st.sidebar.slider(
        "Confidence Threshold",
        min_value=0.0,
        max_value=1.0,
        value=st.session_state.settings['confidence_threshold'],
        step=0.1,
        help="Lower value = easier recognition, Higher value = stricter recognition"
    )
    st.session_state.settings['confidence_threshold'] = confidence
    
    strict_matching = st.sidebar.checkbox(
        "Strict Character Matching",
        value=st.session_state.settings['strict_matching'],
        help="If enabled, the character must match exactly. If disabled, allows for some variation."
    )
    st.session_state.settings['strict_matching'] = strict_matching
    
    # Practice settings
    st.sidebar.subheader("Practice")
    show_target = st.sidebar.checkbox(
        "Show Target Character",
        value=st.session_state.settings['show_target'],
        help="Show the target Thai character while practicing"
    )
    st.session_state.settings['show_target'] = show_target

def show_learn_thai() -> None:
    """Display the Learn Thai Letters page content with tabbed interface."""
    st.header("Learn Thai Letters")
    
    # Create tabs
    tab1, tab2, tab3 = st.tabs(["Consonants", "Vowels", "Modern Script"])
    
    # Get the images directory path
    images_dir = Path(__file__).parent / "images"
    
    # Consonants tab
    with tab1:
        st.image(str(images_dir / "thai-consonants-classic.jpg"), 
                caption="Thai Consonants")
    
    # Vowels tab
    with tab2:
        st.image(str(images_dir / "thai-vowels-classic.jpg"),
                caption="Thai Vowels")
    
    # Modern script tab
    with tab3:
        st.image(str(images_dir / "modern-script.jpg"),
                caption="Modern Thai Script")

def show_romanization_to_thai() -> None:
    """Display the Romanization to Thai conversion page content."""
    st.header("Practice Writing Thai Letters")
    
    try:
        # Get current character
        df = st.session_state.thai_chars
        current_char = df.iloc[st.session_state.current_char_index]
        
        # Display the romanization
        st.subheader(f"Write the Thai character for: {current_char['romanization'].strip()}")
        
        # Show the target character based on settings
        if st.session_state.settings['show_target']:
            st.caption(f"Target character: {current_char['thai']}")
        
        # Create columns for the canvas and buttons
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Create canvas for drawing
            canvas_result = st_canvas(
                stroke_width=st.session_state.settings['stroke_width'],
                stroke_color="black",
                background_color="white",
                height=400,
                width=400,
                drawing_mode="freedraw",
                key=f"canvas_{st.session_state.canvas_key}",
            )
            
            # Show confidence bar
            st.markdown(create_confidence_bar_html(st.session_state.current_confidence), unsafe_allow_html=True)
        
        with col2:
            st.markdown("### Controls")
            if st.button("Clear Canvas"):
                clear_canvas()
            
            if st.button("Check Character"):
                if canvas_result.image_data is not None:
                    try:
                        # Get target character
                        target_char = current_char['thai']
                        
                        # Get OCR prediction
                        ocr = get_ocr()
                        detected_char, confidence = ocr.process_image(canvas_result.image_data, target_char)
                        
                        # Update confidence in session state
                        st.session_state.current_confidence = confidence
                        
                        # Compare with target
                        is_match = ocr.compare_characters(
                            detected_char, 
                            target_char,
                            strict=st.session_state.settings['strict_matching']
                        )
                        
                        # Check confidence threshold
                        if confidence < st.session_state.settings['confidence_threshold']:
                            st.warning("Recognition confidence too low. Try writing more clearly.")
                        elif is_match:
                            st.success(f"Correct! You wrote: {target_char}")
                        else:
                            st.error(f"Not quite. The correct character is: {target_char}")
                            if detected_char:
                                st.info(f"OCR detected: {detected_char}")
                    except Exception as e:
                        st.error(f"Error processing character: {str(e)}")
            
            st.markdown("### Navigation")
            col3, col4 = st.columns(2)
            
            with col3:
                if st.button("◀ Previous"):
                    st.session_state.current_char_index = (st.session_state.current_char_index - 1) % len(df)
                    clear_canvas()
                    st.rerun()
            
            with col4:
                if st.button("Next ▶"):
                    st.session_state.current_char_index = (st.session_state.current_char_index + 1) % len(df)
                    clear_canvas()
                    st.rerun()
                
    except Exception as e:
        st.error(f"Error loading character data: {str(e)}")
        if st.button("Reset"):
            st.session_state.current_char_index = 0
            st.rerun()

def next_thai_char():
    """Move to next character in Thai to Romanization."""
    st.session_state.thai_to_roman_index = (st.session_state.thai_to_roman_index + 1) % len(st.session_state.thai_chars)
    st.session_state.input_key += 1  # Change the input key to force a fresh input

def show_thai_to_romanization() -> None:
    """Display the Thai to Romanization page content."""
    st.header("Thai to Romanization Practice")
    
    try:
        # Get current character
        df = st.session_state.thai_chars
        current_char = df.iloc[st.session_state.thai_to_roman_index]
        
        # Display the Thai character
        st.markdown(f"<h1 style='font-size: 72px; text-align: center;'>{current_char['thai']}</h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center;'>Write the romanization for this character:</p>", unsafe_allow_html=True)
        
        # Create columns for input and buttons
        col1, col2, col3 = st.columns([2, 1, 1])
        
        with col1:
            # Use a dynamic key for the text input
            user_input = st.text_input("Your answer:", key=f"romanization_input_{st.session_state.input_key}", max_chars=10)
        
        with col2:
            if st.button("Submit"):
                if user_input.strip().lower() == current_char['romanization'].strip().lower():
                    st.success("Correct! 🎉")
                else:
                    st.error(f"Not quite. The correct romanization is: {current_char['romanization']}")
        
        with col3:
            if st.button("Next Character ▶"):
                next_thai_char()
                st.rerun()
                
    except Exception as e:
        st.error(f"Error in Thai to Romanization: {str(e)}")

def main() -> None:
    """Main application function."""
    set_page_config()
    initialize_session_state()

    # Create sidebar with navigation
    with st.sidebar:
        st.title("Thai Language Learning")
        st.markdown("---")
        
        # Navigation menu
        pages = ["Learn Thai Letters", "Romanization to Thai", "Thai to Romanization"]
        selected_page = st.radio("Navigation", pages, index=pages.index(st.session_state.current_page))
        
        if selected_page != st.session_state.current_page:
            st.session_state.current_page = selected_page
            st.rerun()
        
        # Show settings for the drawing page
        if selected_page == "Romanization to Thai":
            show_settings()

    # Display the selected page content
    if st.session_state.current_page == "Learn Thai Letters":
        show_learn_thai()
    elif st.session_state.current_page == "Romanization to Thai":
        show_romanization_to_thai()
    else:
        show_thai_to_romanization()

if __name__ == "__main__":
    main()
