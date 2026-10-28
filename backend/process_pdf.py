import sys
import fitz  # PyMuPDF
import cv2
import numpy as np

def process_image(pix, apply_ink_saver):
    # 1. Convert PyMuPDF pixmap to numpy array for OpenCV
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    
    # 2. Convert to grayscale if it is in color (RGB or RGBA)
    if pix.n == 3 or pix.n == 4:
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    else:
        gray = img

    # 3. Apply Ink-Saver Mode (Enhance text clarity, remove background shading)
    if apply_ink_saver:
        # Adaptive thresholding makes the background pure white and text pure black
        processed = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 15
        )
    else:
        processed = gray

    # 4. Crop Blank Margins
    # Invert image so text is white (255) and background is black (0)
    inverted = cv2.bitwise_not(processed)
    
    # Threshold to isolate the actual content
    _, thresh = cv2.threshold(inverted, 10, 255, cv2.THRESH_BINARY)
    
    # Find bounding box coordinates of all non-blank content
    coords = cv2.findNonZero(thresh)
    
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        # Add a small 10-pixel padding around the cropped content
        padding = 10
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(processed.shape[1] - x, w + (padding * 2))
        h = min(processed.shape[0] - y, h + (padding * 2))
        
        # Crop the image to exactly where the content is
        cropped = processed[y:y+h, x:x+w]
    else:
        # If the page is completely blank, return as is
        cropped = processed
        
    return cropped

def create_pdf(input_path, output_path, ink_saver, four_up):
    # Open the uploaded PDF
    doc = fitz.open(input_path)
    out_doc = fitz.open()  # Create a new empty PDF
    
    processed_images = []
    
    # Process every page one by one
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Render page to image (zoom scale 2.0 for higher resolution)
        zoom_matrix = fitz.Matrix(2.0, 2.0) 
        pix = page.get_pixmap(matrix=zoom_matrix)
        
        # Crop margins and apply filters
        cropped_img = process_image(pix, ink_saver)
        
        # Convert OpenCV image back to bytes format for PyMuPDF
        _, encoded_img = cv2.imencode('.png', cropped_img)
        processed_images.append(encoded_img.tobytes())
        
    doc.close()

    # Standard A4 size in points
    a4_width, a4_height = 595, 842 

    if four_up:
        # Group images in chunks of 4 to fit onto a single page
        for i in range(0, len(processed_images), 4):
            chunk = processed_images[i:i+4]
            page = out_doc.new_page(width=a4_width, height=a4_height)
            
            # Calculate coordinates for the 4 quadrants with a small margin
            margin = 20
            w = (a4_width - (margin * 3)) / 2
            h = (a4_height - (margin * 3)) / 2
            
            rects = [
                fitz.Rect(margin, margin, margin + w, margin + h),                                  # Top-Left
                fitz.Rect(margin * 2 + w, margin, margin * 2 + 2 * w, margin + h),                  # Top-Right
                fitz.Rect(margin, margin * 2 + h, margin + w, margin * 2 + 2 * h),                  # Bottom-Left
                fitz.Rect(margin * 2 + w, margin * 2 + h, margin * 2 + 2 * w, margin * 2 + 2 * h)   # Bottom-Right
            ]
            
            for j, img_bytes in enumerate(chunk):
                page.insert_image(rects[j], stream=img_bytes)
    else:
        # Place 1 image per page, stretched to fit inside the margins
        for img_bytes in processed_images:
            page = out_doc.new_page(width=a4_width, height=a4_height)
            rect = fitz.Rect(20, 20, a4_width - 20, a4_height - 20)
            page.insert_image(rect, stream=img_bytes)

    # Save the final compiled PDF
    out_doc.save(output_path)
    out_doc.close()

if __name__ == "__main__":
    # Get arguments passed from Node.js (server.js)
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    ink_mode = sys.argv[3] == "True"
    grid_mode = sys.argv[4] == "True"
    
    create_pdf(in_file, out_file, ink_mode, grid_mode)