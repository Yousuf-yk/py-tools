import sys
import os
import re
from io import BytesIO
from xml.sax.saxutils import escape

import pymupdf
from PIL import Image as PILImage, ImageOps

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm


def clean_text(text):
    """Normalize extracted text and replace unsupported bullet glyphs."""
    replacements = {
        "\u25a0": "-",   # black square
        "\u25aa": "-",   # small black square
        "\u25a1": "-",   # white square
        "\u25cf": "-",   # black circle
        "\u25cb": "-",   # white circle
        "\uf0a7": "-",   # common private-use bullet
        "\u2022": "-",   # bullet
        "\u00a0": " ",
        "\u200b": "",
        "\ufeff": "",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = "".join(
        char for char in text
        if char in "\n\t" or ord(char) >= 32
    )
    return text.strip()


def make_styles(is_bw):
    """Create consistent styles for body text, headings, and lists."""
    styles = getSampleStyleSheet()
    text_color = colors.black if is_bw else colors.HexColor("#222222")

    return {
        "body": ParagraphStyle(
            "BodyTextCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=text_color,
            spaceAfter=5,
            alignment=TA_LEFT,
            splitLongWords=1,
        ),
        "heading1": ParagraphStyle(
            "HeadingOneCustom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=text_color,
            spaceBefore=11,
            spaceAfter=7,
            keepWithNext=True,
        ),
        "heading2": ParagraphStyle(
            "HeadingTwoCustom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=text_color,
            spaceBefore=8,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "heading3": ParagraphStyle(
            "HeadingThreeCustom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=text_color,
            spaceBefore=6,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "bullet": ParagraphStyle(
            "BulletCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            leftIndent=14,
            firstLineIndent=-9,
            spaceAfter=4,
            textColor=text_color,
        ),
    }


def detect_heading(text, font_size, body_size, bold):
    """Guess heading level from original font metadata and text patterns."""
    text = text.strip()

    if not text or len(text) > 160:
        return None

    if font_size >= body_size * 1.55:
        return "heading1"

    if re.match(
        r"^(chapter|unit|module|contents)\b",
        text,
        re.IGNORECASE,
    ):
        return "heading1"

    if font_size >= body_size * 1.25:
        return "heading2"

    if re.match(r"^\d+(?:\.\d+)*[.)]?\s+\S", text):
        if bold or len(text) < 100:
            return "heading3"

    if bold and len(text) < 100:
        return "heading3"

    if text.isupper() and len(text) < 80 and len(text.split()) <= 12:
        return "heading2"

    return None


def get_block_text(block):
    """Extract text and inspect font size and bold metadata."""
    text_lines = []
    largest_size = 0
    is_bold = False

    for line in block.get("lines", []):
        spans = line.get("spans", [])
        line_text = "".join(span.get("text", "") for span in spans).strip()

        if line_text:
            text_lines.append(line_text)

        for span in spans:
            largest_size = max(largest_size, span.get("size", 0))
            font_name = span.get("font", "").lower()
            if "bold" in font_name or "black" in font_name:
                is_bold = True

    return "\n".join(text_lines), largest_size, is_bold


def extract_image(block, is_bw=False):
    """
    Decode a PDF image block with Pillow.
    Transparent pixels are composited over white to prevent black rectangles.
    """
    image_bytes = block.get("image")
    if not image_bytes:
        return None

    try:
        with PILImage.open(BytesIO(image_bytes)) as source:
            source.load()
            oriented = ImageOps.exif_transpose(source)
            converted = oriented.convert("RGBA")

            background = PILImage.new("RGBA", converted.size, "white")
            background.alpha_composite(converted)

            if is_bw:
                result = background.convert("L")
            else:
                result = background.convert("RGB")

            output = BytesIO()
            result.save(output, format="PNG")
            return output.getvalue()

    except Exception as error:
        print(f"Warning: could not decode an image block: {error}", file=sys.stderr)
        return None


def scaled_image(image_bytes, max_width, max_height):
    """Fit an image within a maximum box without stretching it."""
    try:
        with PILImage.open(BytesIO(image_bytes)) as source:
            width, height = source.size

        if width <= 0 or height <= 0:
            return None

        scale = min(max_width / width, max_height / height, 1.0)

        return Image(
            BytesIO(image_bytes),
            width=width * scale,
            height=height * scale,
            hAlign="CENTER",
        )

    except Exception as error:
        print(f"Warning: could not place an image: {error}", file=sys.stderr)
        return None


def create_flow_pdf(input_path, output_path, pages_per_sheet, is_bw):
    """
    Rebuild extracted text and image blocks, then arrange the rebuilt pages
    into a 2-up landscape or 4-up portrait output sheet.

    Note: this is a text/image reconstruction approach. Complex vector diagrams,
    tables, multi-column layouts, and scanned pages may not be reconstructed
    perfectly from extracted blocks.
    """
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input PDF does not exist: {input_path}")

    if pages_per_sheet not in (2, 4):
        raise ValueError("pages_per_sheet must be 2 or 4")

    output_dir = os.path.dirname(os.path.abspath(output_path))
    os.makedirs(output_dir, exist_ok=True)

    temp_path = output_path + ".temp.pdf"
    original = None

    try:
        original = pymupdf.open(input_path)

        if original.needs_pass:
            raise ValueError("The input PDF is password-protected.")

        # Estimate typical body font size.
        font_sizes = []
        for page in original:
            page_data = page.get_text("dict")
            for block in page_data.get("blocks", []):
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        if span.get("text", "").strip():
                            size = span.get("size", 0)
                            if size > 0:
                                font_sizes.append(size)

        if font_sizes:
            font_sizes.sort()
            body_size = font_sizes[len(font_sizes) // 2]
        else:
            body_size = 11

        styles = make_styles(is_bw)
        margin = 12 * mm
        page_width, page_height = A4
        max_width = page_width - 2 * margin
        max_height = page_height - 2 * margin
        story = []

        for page_number, page in enumerate(original):
            blocks = page.get_text("dict").get("blocks", [])

            # Approximate reading order by vertical then horizontal position.
            blocks = sorted(
                blocks,
                key=lambda block: (
                    round(block.get("bbox", [0, 0, 0, 0])[1], 1),
                    block.get("bbox", [0, 0, 0, 0])[0],
                ),
            )

            previous_bottom = None

            for block in blocks:
                bbox = block.get("bbox", [0, 0, 0, 0])
                x0, y0, x1, y1 = bbox

                if x1 <= x0 or y1 <= y0:
                    continue

                if previous_bottom is not None and y0 - previous_bottom > 25:
                    story.append(Spacer(1, 5))

                previous_bottom = y1

                # Images are decoded as images, never opened as PDFs.
                if block.get("type") == 1:
                    image_bytes = extract_image(block, is_bw)
                    if image_bytes:
                        picture = scaled_image(
                            image_bytes,
                            max_width,
                            max_height * 0.65,
                        )
                        if picture:
                            story.append(Spacer(1, 4))
                            story.append(picture)
                            story.append(Spacer(1, 7))
                    continue

                if block.get("type") != 0:
                    continue

                raw_text, font_size, is_bold = get_block_text(block)
                text = clean_text(raw_text)

                if not text:
                    continue

                # Do not emit standalone square/bullet-only blocks.
                if re.fullmatch(r"[-\s]+", text):
                    continue

                heading = detect_heading(
                    text,
                    font_size,
                    body_size,
                    is_bold,
                )

                if heading:
                    style_name = heading
                elif re.match(r"^\s*(?:[-*]|\d+[.)])\s+", text):
                    style_name = "bullet"
                else:
                    style_name = "body"

                # Escape HTML-sensitive characters before ReportLab Paragraph.
                safe_text = escape(text).replace("\n", "<br/>")

                if style_name == "bullet":
                    safe_text = re.sub(
                        r"^\s*(?:[-*]|\d+[.)])\s+",
                        "",
                        safe_text,
                    )
                    safe_text = "- " + safe_text

                story.append(Paragraph(safe_text, styles[style_name]))

            if page_number < len(original) - 1:
                story.append(Spacer(1, 10))

        if not story:
            story.append(
                Paragraph(
                    "No extractable text or images were found in this PDF.",
                    styles["body"],
                )
            )

        template = SimpleDocTemplate(
            temp_path,
            pagesize=A4,
            leftMargin=margin,
            rightMargin=margin,
            topMargin=margin,
            bottomMargin=margin,
            title="Reformatted Document",
            pageCompression=1,
        )
        template.build(story)

    finally:
        if original is not None:
            original.close()

    source = None
    output = None

    try:
        source = pymupdf.open(temp_path)
        output = pymupdf.open()
        a4_width, a4_height = pymupdf.paper_size("A4")

        for start in range(0, len(source), pages_per_sheet):
            if pages_per_sheet == 2:
                # Two portrait pages side by side on a landscape A4 sheet.
                target = output.new_page(width=a4_height, height=a4_width)
                slots = [
                    pymupdf.Rect(0, 0, a4_height / 2, a4_width),
                    pymupdf.Rect(a4_height / 2, 0, a4_height, a4_width),
                ]
            else:
                # Four pages in a 2-by-2 grid on portrait A4.
                target = output.new_page(width=a4_width, height=a4_height)
                half_w = a4_width / 2
                half_h = a4_height / 2
                slots = [
                    pymupdf.Rect(0, 0, half_w, half_h),
                    pymupdf.Rect(half_w, 0, a4_width, half_h),
                    pymupdf.Rect(0, half_h, half_w, a4_height),
                    pymupdf.Rect(half_w, half_h, a4_width, a4_height),
                ]

            for offset in range(pages_per_sheet):
                index = start + offset
                if index >= len(source):
                    break

                target.show_pdf_page(
                    slots[offset],
                    source,
                    index,
                    keep_proportion=True,
                )

        output.save(output_path, garbage=4, deflate=True)

    finally:
        if output is not None:
            output.close()
        if source is not None:
            source.close()
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(
            "Usage: python main.py "
            "<input.pdf> <output.pdf> <pages_per_sheet> <bw_mode>"
        )
        sys.exit(1)

    try:
        create_flow_pdf(
            sys.argv[1],
            sys.argv[2],
            int(sys.argv[3]),
            sys.argv[4].lower() == "true",
        )
        print(f"PDF created successfully: {sys.argv[2]}")

    except Exception as error:
        print(f"PDF generation failed: {error}", file=sys.stderr)
        sys.exit(1)
