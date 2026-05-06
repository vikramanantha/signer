#!/usr/bin/env python3
"""Generate VA stickers from the browser tool defaults.

This script mirrors the logic in `signer/index.html` + `signer/script.js` so it
can be called repeatedly from the terminal or imported from Python code.
Generated files are saved to `VA-stickers` by default.
"""

from __future__ import annotations

import argparse
import math
import re
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFilter, ImageFont

YEAR_COLORS = {
    "2026": "#306c54",
    "2025": "#2c2f73",
    "2024": "#834399",
    "2023": "#f5a623",
    "2022": "#87ceeb",
    "2021": "#4caf50",
    "2020": "#e74c3c",
}
DATE_COLOR = "#6d6e71"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "VA-stickers"
_FONT_SEARCH_PATHS = [
    Path.home() / "Library/Fonts",
    PROJECT_ROOT,
    SCRIPT_DIR,
    Path("/Library/Fonts"),
    Path("/System/Library/Fonts"),
]


def _find_font(name_variants: list[str]) -> Path:
    for directory in _FONT_SEARCH_PATHS:
        for name in name_variants:
            path = directory / name
            if not path.is_file():
                continue
            try:
                ImageFont.truetype(str(path), 20)
                return path
            except OSError:
                continue
    raise FileNotFoundError(
        f"Could not find any of these fonts: {', '.join(name_variants)}"
    )


FONT_BOLD_PATH = _find_font(
    ["productsans-bold.ttf", "ProductSans-Bold.ttf", "Product Sans Bold.ttf"]
)
FONT_REGULAR_PATH = _find_font(
    ["productsans.ttf", "ProductSans-Regular.ttf", "Product Sans Regular.ttf"]
)


@dataclass(slots=True)
class StickerParams:
    month: str = ""
    day: str = ""
    year: str = "2026"
    product: str = ""
    has_border: bool = True
    white_bg: bool = True
    long_form: bool = True
    w_ratio: float = 0.70
    bar_ratio: float = 0.130
    gap_ratio: float = 0.088
    v_slide: float = 0.19
    crossbar_pos: float = 0.60
    o_size: float = 0.80
    bar_gap: float = 0.127
    bar_weight: float = 0.130
    o_offset: float = -0.19
    text_size: int = 213
    padding_top: int = 46
    padding_right: int = 113
    padding_bottom: int = 46
    padding_left: int = 9
    nantha_offset: float = 0.18
    letter_spacing_factor: float = 0.135
    date_spacing_factor: float = 1.01
    ikram_offset_x: float = -0.10
    nantha_offset_x: float = 0.15
    border_thickness: int = 35
    border_radius: int = 52
    corner_tl: int = 0
    corner_tr: int = 6
    corner_v_inner_l: int = 6
    corner_v_inner_r: int = 6
    corner_bl: int = 6
    corner_br: int = 0
    corner_a_inner_l: int = 6
    corner_a_inner_r: int = 6


DEFAULT_PARAMS = StickerParams()


def get_font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD_PATH if bold else FONT_REGULAR_PATH
    return ImageFont.truetype(str(path), size)


def _bbox(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont):
    return draw.textbbox((0, 0), text, font=font)


def _bbox_wh(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont):
    x0, y0, x1, y1 = _bbox(draw, text, font)
    return x0, y0, x1, y1, x1 - x0, y1 - y0


def measure_spaced_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    letter_spacing: float,
) -> float:
    if not text:
        return 0.0
    width = 0.0
    for index, char in enumerate(text):
        _, _, _, _, char_w, _ = _bbox_wh(draw, char, font)
        width += char_w
        if index < len(text) - 1:
            width += letter_spacing
    return width


def measure_year_with_stylized_o(
    draw: ImageDraw.ImageDraw,
    year: str,
    font: ImageFont.FreeTypeFont,
    char_spacing: float,
) -> float:
    if not year:
        return 0.0
    year_head = year[0]
    year_tail = year[2:]
    head_width = measure_spaced_text(draw, year_head, font, char_spacing)
    tail_width = measure_spaced_text(draw, year_tail, font, char_spacing) if year_tail else 0
    _, _, _, _, zero_width, _ = _bbox_wh(draw, "0", font)
    gap_before_o = char_spacing
    gap_after_o = char_spacing if year_tail else 0
    return head_width + gap_before_o + zero_width + gap_after_o + tail_width


def draw_spaced_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: float,
    y: float,
    font: ImageFont.FreeTypeFont,
    fill,
    letter_spacing: float,
) -> float:
    if not text:
        return x
    cursor_x = x
    for index, char in enumerate(text):
        _, _, _, _, char_w, _ = _bbox_wh(draw, char, font)
        draw.text((cursor_x, y), char, font=font, fill=fill)
        cursor_x += char_w
        if index < len(text) - 1:
            cursor_x += letter_spacing
    return cursor_x


def get_monogram_metrics(
    height: float,
    w_ratio: float,
    bar_ratio: float,
    gap_ratio: float,
    v_slide: float,
    max_corner_radius: int = 6,
):
    width = height * w_ratio
    gap = height * gap_ratio
    diagonal_len = math.hypot(width, height)
    a_top_offset = gap * diagonal_len / width
    v_slide_y = v_slide * height
    v_slide_x = v_slide * width
    supersample = 4
    max_radius_ss = max(2, max_corner_radius * supersample)
    pad = math.floor((max_radius_ss * 3 + 4) / supersample)
    return {
        "v_top": 0.0,
        "v_slide_x": v_slide_x,
        "a_top": v_slide_y + a_top_offset,
        "total_height": height + v_slide_y,
        "total_width": width + v_slide_x,
        "pad": pad,
    }


def _threshold_mask(mask: Image.Image) -> Image.Image:
    return mask.point(lambda value: 255 if value > 128 else 0)


def make_va_monogram(
    height: float,
    fill: str,
    w_ratio: float,
    bar_ratio: float,
    gap_ratio: float,
    v_slide: float,
    crossbar_pos: float,
    corner_radii: dict[str, int],
):
    width = height * w_ratio
    bar = height * bar_ratio
    gap = height * gap_ratio

    supersample = 4
    w_ss = width * supersample
    h_ss = height * supersample
    bar_ss = bar * supersample
    gap_ss = gap * supersample
    v_slide_y_ss = v_slide * h_ss
    v_slide_x_ss = v_slide * w_ss

    max_corner = max(max(corner_radii.values()), 1)
    pad_ss = max(2, max_corner * supersample) * 3 + 4
    image_w = math.floor(w_ss + v_slide_x_ss) + 2 * pad_ss
    image_h = math.floor(h_ss + v_slide_y_ss) + 2 * pad_ss
    pad = pad_ss

    diagonal_len = math.hypot(w_ss, h_ss)
    nx = h_ss / diagonal_len
    ny = w_ss / diagonal_len

    def lx(distance: float, y: float) -> float:
        return w_ss - w_ss * (y - distance * ny) / h_ss + distance * nx

    def ly(distance: float, x: float) -> float:
        return h_ss * (w_ss + distance * nx - x) / w_ss + distance * ny

    gap_upper = -gap_ss
    gap_lower = gap_ss
    v_inner = -(gap_ss + bar_ss)
    a_inner = gap_ss + bar_ss

    v_bar = [
        (pad + v_slide_x_ss, pad),
        (pad + v_slide_x_ss + bar_ss, pad),
        (pad + v_slide_x_ss + bar_ss, pad + ly(gap_upper, bar_ss)),
        (pad + v_slide_x_ss, pad + ly(gap_upper, 0)),
    ]
    v_diag = [
        (pad + v_slide_x_ss + max(bar_ss, lx(v_inner, 0)), pad),
        (pad + v_slide_x_ss + min(w_ss, lx(gap_upper, 0)), pad),
        (pad + v_slide_x_ss + bar_ss, pad + ly(gap_upper, bar_ss)),
        (pad + v_slide_x_ss + bar_ss, pad + ly(v_inner, bar_ss)),
    ]
    a_bar = [
        (pad + w_ss, pad + v_slide_y_ss + ly(gap_lower, w_ss)),
        (pad + w_ss, pad + v_slide_y_ss + h_ss),
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + h_ss),
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + ly(gap_lower, w_ss - bar_ss)),
    ]
    a_diag = [
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + ly(gap_lower, w_ss - bar_ss)),
        (pad + max(0, lx(gap_lower, h_ss)), pad + v_slide_y_ss + h_ss),
        (pad, pad + v_slide_y_ss + h_ss),
        (pad + min(w_ss - bar_ss, lx(a_inner, h_ss)), pad + v_slide_y_ss + h_ss),
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + ly(a_inner, w_ss - bar_ss)),
    ]

    free_top = ly(a_inner, w_ss - bar_ss)
    free_bottom = h_ss
    free_height = free_bottom - free_top
    crossbar_center = free_top + crossbar_pos * free_height
    crossbar_half = bar_ss / 2
    crossbar_y_top = max(free_top, crossbar_center - crossbar_half)
    crossbar_y_bottom = min(free_bottom, crossbar_center + crossbar_half)
    a_crossbar = [
        (pad + lx(a_inner, crossbar_y_top), pad + v_slide_y_ss + crossbar_y_top),
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + crossbar_y_top),
        (pad + w_ss - bar_ss, pad + v_slide_y_ss + crossbar_y_bottom),
        (pad + lx(a_inner, crossbar_y_bottom), pad + v_slide_y_ss + crossbar_y_bottom),
    ]

    sharp_mask = Image.new("L", (image_w, image_h), 0)
    mask_draw = ImageDraw.Draw(sharp_mask)
    for polygon in (v_bar, v_diag, a_bar, a_diag, a_crossbar):
        mask_draw.polygon([(round(x), round(y)) for x, y in polygon], fill=255)

    final_mask = sharp_mask.copy()
    corner_defs = [
        {"r": corner_radii["tl"], "x": pad + v_slide_x_ss, "y": pad},
        {"r": corner_radii["tr"], "x": pad + v_slide_x_ss + w_ss, "y": pad},
        {"r": corner_radii["vil"], "x": pad + v_slide_x_ss + bar_ss, "y": pad},
        {"r": corner_radii["vir"], "x": pad + v_slide_x_ss + max(bar_ss, lx(v_inner, 0)), "y": pad},
        {"r": corner_radii["bl"], "x": pad, "y": pad + v_slide_y_ss + h_ss},
        {"r": corner_radii["br"], "x": pad + w_ss, "y": pad + v_slide_y_ss + h_ss},
        {"r": corner_radii["ail"], "x": pad + min(w_ss - bar_ss, lx(a_inner, h_ss)), "y": pad + v_slide_y_ss + h_ss},
        {"r": corner_radii["air"], "x": pad + (w_ss - bar_ss), "y": pad + v_slide_y_ss + h_ss},
    ]

    for corner in corner_defs:
        if corner["r"] <= 0:
            continue
        radius_ss = corner["r"] * supersample
        clip_radius = radius_ss * 4
        blurred = sharp_mask.filter(ImageFilter.GaussianBlur(radius=radius_ss))
        rounded = _threshold_mask(blurred)

        clip = Image.new("L", sharp_mask.size, 0)
        clip_draw = ImageDraw.Draw(clip)
        x = corner["x"]
        y = corner["y"]
        clip_draw.ellipse((x - clip_radius, y - clip_radius, x + clip_radius, y + clip_radius), fill=255)
        final_mask = Image.composite(rounded, final_mask, clip)

    out_w = math.floor(image_w / supersample)
    out_h = math.floor(image_h / supersample)
    final_mask = final_mask.resize((out_w, out_h), Image.LANCZOS)

    r, g, b = ImageColor.getrgb(fill)
    out_image = Image.new("RGBA", final_mask.size, (r, g, b, 255))
    out_image.putalpha(final_mask)
    return {"image": out_image, "pad": math.floor(pad_ss / supersample)}


def sanitize_filename_part(value: str) -> str:
    value = re.sub(r"[\\/:\*\?\"<>\|]+", "-", value.strip())
    value = re.sub(r"\s+", " ", value)
    return value.strip(" .")


def build_default_filename(params: StickerParams) -> str:
    parts = ["VA"]
    for value in (params.month, params.day, params.year, params.product):
        cleaned = sanitize_filename_part(value)
        if cleaned:
            parts.append(cleaned)
    return "-".join(parts) + ".png"


def build_output_path(
    params: StickerParams,
    output: str | None = None,
    output_dir: str | Path | None = None,
) -> Path:
    if output:
        path = Path(output).expanduser()
        return path if path.is_absolute() else Path.cwd() / path

    target_dir = Path(output_dir).expanduser() if output_dir else DEFAULT_OUTPUT_DIR
    if not target_dir.is_absolute():
        target_dir = PROJECT_ROOT / target_dir
    return target_dir / build_default_filename(params)


def generate_sticker(params: StickerParams) -> Image.Image:
    va_height = 420
    small = params.text_size
    inner_gap = 14
    inner_radius = 38
    letter_gap = 5

    scratch = Image.new("RGBA", (1, 1))
    scratch_draw = ImageDraw.Draw(scratch)

    font_small = get_font(True, small)
    letter_spacing = small * params.letter_spacing_factor

    max_corner_radius = max(
        params.corner_tl,
        params.corner_tr,
        params.corner_v_inner_l,
        params.corner_v_inner_r,
        params.corner_bl,
        params.corner_br,
        params.corner_a_inner_l,
        params.corner_a_inner_r,
    )
    metrics = get_monogram_metrics(
        va_height,
        params.w_ratio,
        params.bar_ratio,
        params.gap_ratio,
        params.v_slide,
        max_corner_radius,
    )
    va_width = metrics["total_width"]
    va_height_total = metrics["total_height"]
    va_base_width = va_height * params.w_ratio
    v_xheight_y = metrics["v_top"]
    a_xheight_y = metrics["a_top"]

    if params.long_form:
        ik_bb = _bbox(scratch_draw, "ikram", font_small)
        na_bb = _bbox(scratch_draw, "nantha", font_small)
        ik_width = measure_spaced_text(scratch_draw, "ikram", font_small, letter_spacing)
        na_width = measure_spaced_text(scratch_draw, "nantha", font_small, letter_spacing)
    else:
        ik_bb = na_bb = (0, 0, 0, 0)
        ik_width = na_width = 0

    if params.long_form:
        line1_width = metrics["v_slide_x"] + va_base_width + letter_gap + ik_width
        line2_width = va_base_width + letter_gap + na_width
    else:
        line1_width = va_width
        line2_width = va_width
    text_block_width = max(line1_width, line2_width)

    va_x = 0.0
    va_y = 0.0
    anchor_top = va_y
    anchor_left = va_x
    anchor_bottom = va_y + va_height_total

    if params.long_form:
        ik_draw_y = va_y + v_xheight_y - ik_bb[1]
        ik_draw_x = va_x + metrics["v_slide_x"] + va_base_width + letter_gap + params.ikram_offset_x * small
        ik_rendered = (
            ik_draw_x + ik_bb[0],
            ik_draw_y + ik_bb[1],
            ik_draw_x + ik_bb[2],
            ik_draw_y + ik_bb[3],
        )

        na_draw_y = va_y + a_xheight_y - na_bb[1] + params.nantha_offset * small
        na_draw_x = va_x + va_base_width + letter_gap + params.nantha_offset_x * small
        na_rendered = (
            na_draw_x + na_bb[0],
            na_draw_y + na_bb[1],
            na_draw_x + na_bb[2],
            na_draw_y + na_bb[3],
        )
        anchor_right = na_rendered[2]
    else:
        ik_draw_x = ik_draw_y = 0.0
        na_draw_x = na_draw_y = 0.0
        ik_rendered = na_rendered = (0, 0, 0, 0)
        anchor_right = va_x + va_width

    a_rendered = (va_x, va_y + metrics["a_top"], va_x + va_base_width, va_y + va_height_total)
    va_rendered = (
        va_x - metrics["pad"],
        va_y - metrics["pad"],
        va_x + va_width + metrics["pad"],
        va_y + va_height_total + metrics["pad"],
    )

    if params.long_form:
        content_left = min(va_rendered[0], ik_rendered[0], na_rendered[0])
        content_top = min(va_rendered[1], ik_rendered[1], na_rendered[1])
        content_right = max(va_rendered[2], ik_rendered[2], na_rendered[2])
        content_bottom = max(va_rendered[3], ik_rendered[3], na_rendered[3])
    else:
        content_left = va_rendered[0]
        content_top = va_rendered[1]
        content_right = va_rendered[2]
        content_bottom = va_rendered[3]

    has_date = bool(params.long_form and (params.month or params.day or params.year))
    date_region_top = date_region_bottom = date_draw_y = 0.0
    date_font = None
    date_bbox = None
    date_font_size = 0
    date_text_without_year = ""

    if has_date and params.year:
        date_region_top = na_rendered[3] + 3
        date_region_bottom = a_rendered[3]
        date_available_height = date_region_bottom - date_region_top
        date_font_size = max(20, math.floor(date_available_height * 1.8))
        date_font = get_font(True, date_font_size)
        joined_date = f"{params.month}{params.day}{params.year}"
        date_bbox = _bbox(scratch_draw, joined_date, date_font)
        date_height = date_bbox[3] - date_bbox[1]
        while date_height > date_available_height and date_font_size > 20:
            date_font_size -= 1
            date_font = get_font(True, date_font_size)
            date_bbox = _bbox(scratch_draw, joined_date, date_font)
            date_height = date_bbox[3] - date_bbox[1]

        date_x_start = na_rendered[0]
        max_date_width = content_right - date_x_start + 10

        def measure_date_width() -> float:
            char_spacing = date_font_size * params.letter_spacing_factor
            token_gap = date_font_size * 0.33 * params.date_spacing_factor
            parts = []
            if params.month:
                parts.append(measure_spaced_text(scratch_draw, params.month, date_font, char_spacing))
            if params.day:
                parts.append(measure_spaced_text(scratch_draw, params.day, date_font, char_spacing))
            if params.year:
                parts.append(measure_year_with_stylized_o(scratch_draw, params.year, date_font, char_spacing))
            if not parts:
                return 0.0
            return sum(parts) + token_gap * (len(parts) - 1)

        date_width = measure_date_width()
        while date_width > max_date_width and date_font_size > 20:
            date_font_size -= 1
            date_font = get_font(True, date_font_size)
            date_bbox = _bbox(scratch_draw, joined_date, date_font)
            date_width = measure_date_width()

        gap_center = (date_region_top + date_region_bottom) / 2
        text_center = (date_bbox[1] + date_bbox[3]) / 2
        date_draw_y = gap_center - text_center

    elif has_date and not params.year:
        date_text_without_year = " ".join(part for part in (params.month, params.day) if part).strip()

    has_product = bool(params.product.strip())
    product_gap = 15
    product_font = None
    product_bbox = None
    product_height = 0

    if has_product:
        product_font_size = 110
        product_font = get_font(True, product_font_size)
        product_bbox = _bbox(scratch_draw, params.product, product_font)
        product_width = product_bbox[2] - product_bbox[0]
        while product_width > text_block_width and product_font_size > 20:
            product_font_size -= 2
            product_font = get_font(True, product_font_size)
            product_bbox = _bbox(scratch_draw, params.product, product_font)
            product_width = product_bbox[2] - product_bbox[0]
        product_height = (product_bbox[3] - product_bbox[1]) + product_gap

    border_total = (params.border_thickness + inner_gap) if params.has_border else 0
    anchor_width = anchor_right - anchor_left
    anchor_height = anchor_bottom - anchor_top + (product_height if has_product else 0)
    canvas_w = math.floor(
        anchor_width + params.padding_left + params.padding_right + 2 * border_total
    )
    canvas_h = math.floor(
        anchor_height + params.padding_top + params.padding_bottom + 2 * border_total
    )

    out = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)

    if params.has_border:
        border_color = YEAR_COLORS.get(params.year, "#333333")

        # Match the sticker asset style: a filled outer color band, then a
        # transparent moat, then the inner white panel.
        draw.rounded_rectangle(
            (0, 0, canvas_w, canvas_h),
            radius=params.border_radius + border_total,
            fill=border_color,
        )

        transparent_cutout = Image.new("L", (canvas_w, canvas_h), 0)
        cutout_draw = ImageDraw.Draw(transparent_cutout)
        cutout_draw.rounded_rectangle(
            (
                params.border_thickness,
                params.border_thickness,
                canvas_w - params.border_thickness,
                canvas_h - params.border_thickness,
            ),
            radius=params.border_radius,
            fill=255,
        )
        out.putalpha(ImageChops.subtract(out.getchannel("A"), transparent_cutout))
        draw = ImageDraw.Draw(out)

    if params.white_bg:
        inset = border_total if params.has_border else inner_gap
        draw.rounded_rectangle(
            (inset, inset, canvas_w - inset, canvas_h - inset),
            radius=inner_radius,
            fill=(255, 255, 255, 255),
        )

    offset_x = border_total + params.padding_left - anchor_left
    offset_y = border_total + params.padding_top - anchor_top

    va_result = make_va_monogram(
        va_height,
        "#000000",
        params.w_ratio,
        params.bar_ratio,
        params.gap_ratio,
        params.v_slide,
        params.crossbar_pos,
        {
            "tl": params.corner_tl,
            "tr": params.corner_tr,
            "vil": params.corner_v_inner_l,
            "vir": params.corner_v_inner_r,
            "bl": params.corner_bl,
            "br": params.corner_br,
            "ail": params.corner_a_inner_l,
            "air": params.corner_a_inner_r,
        },
    )
    paste_x = math.floor(va_x + offset_x) - va_result["pad"]
    paste_y = math.floor(va_y + offset_y) - va_result["pad"]
    out.alpha_composite(va_result["image"], (paste_x, paste_y))

    if params.long_form:
        draw_spaced_text(
            draw,
            "ikram",
            ik_draw_x + offset_x,
            ik_draw_y + offset_y,
            font_small,
            "#000000",
            letter_spacing,
        )
        draw_spaced_text(
            draw,
            "nantha",
            na_draw_x + offset_x,
            na_draw_y + offset_y,
            font_small,
            "#000000",
            letter_spacing,
        )

    if has_date and params.year and date_font and date_bbox:
        date_x = na_rendered[0] + offset_x
        date_char_spacing = date_font_size * params.letter_spacing_factor
        date_token_gap = date_font_size * 0.33 * params.date_spacing_factor
        cursor_x = date_x

        if params.month:
            cursor_x = draw_spaced_text(
                draw,
                params.month,
                cursor_x,
                date_draw_y + offset_y,
                date_font,
                DATE_COLOR,
                date_char_spacing,
            )
            if params.day or params.year:
                cursor_x += date_token_gap

        if params.day:
            cursor_x = draw_spaced_text(
                draw,
                params.day,
                cursor_x,
                date_draw_y + offset_y,
                date_font,
                DATE_COLOR,
                date_char_spacing,
            )
            if params.year:
                cursor_x += date_token_gap

        year_head = params.year[0]
        year_tail = params.year[2:]
        cursor_x = draw_spaced_text(
            draw,
            year_head,
            cursor_x,
            date_draw_y + offset_y,
            date_font,
            DATE_COLOR,
            date_char_spacing,
        )
        cursor_x += date_char_spacing

        o_font_size = math.floor(date_font_size * params.o_size)
        o_font = get_font(True, o_font_size)
        o_bbox = _bbox(scratch_draw, "o", o_font)
        zero_bbox = _bbox(scratch_draw, "0", date_font)
        zero_width = zero_bbox[2] - zero_bbox[0]
        o_width = o_bbox[2] - o_bbox[0]
        o_slot_x = cursor_x
        o_draw_y_default = date_draw_y + date_bbox[3] - o_bbox[3]
        o_draw_y = o_draw_y_default + math.floor(date_font_size * params.o_offset)
        o_x = o_slot_x + (zero_width - o_width) / 2
        draw.text((o_x, o_draw_y + offset_y), "o", font=o_font, fill=DATE_COLOR)

        o_bottom = o_draw_y + o_bbox[3] + offset_y
        underline_gap = max(1, math.floor(date_font_size * params.bar_gap))
        underline_y = o_bottom + underline_gap
        underline_width = max(2, math.floor(date_font_size * params.bar_weight))
        underline_center_x = o_slot_x + zero_width / 2
        underline_half_width = o_width / 2
        draw.line(
            (
                underline_center_x - underline_half_width,
                underline_y,
                underline_center_x + underline_half_width,
                underline_y,
            ),
            fill=DATE_COLOR,
            width=underline_width,
        )

        cursor_x = o_slot_x + zero_width
        if year_tail:
            cursor_x += date_char_spacing
            draw_spaced_text(
                draw,
                year_tail,
                cursor_x,
                date_draw_y + offset_y,
                date_font,
                DATE_COLOR,
                date_char_spacing,
            )

    elif has_date and date_text_without_year:
        date_x = na_rendered[0] + offset_x
        date_region_top = na_rendered[3] + 3
        date_region_bottom = a_rendered[3]
        date_available_height = date_region_bottom - date_region_top
        date_font_size = max(20, math.floor(date_available_height * 1.8))
        date_font = get_font(True, date_font_size)
        date_bbox = _bbox(scratch_draw, date_text_without_year, date_font)
        date_height = date_bbox[3] - date_bbox[1]
        while date_height > date_available_height and date_font_size > 20:
            date_font_size -= 1
            date_font = get_font(True, date_font_size)
            date_bbox = _bbox(scratch_draw, date_text_without_year, date_font)
            date_height = date_bbox[3] - date_bbox[1]

        date_y = (date_region_bottom + offset_y) - date_bbox[3]
        date_char_spacing = date_font_size * params.letter_spacing_factor
        date_token_gap = date_font_size * 0.33 * params.date_spacing_factor
        cursor_x = date_x
        if params.month:
            cursor_x = draw_spaced_text(
                draw,
                params.month,
                cursor_x,
                date_y,
                date_font,
                DATE_COLOR,
                date_char_spacing,
            )
            if params.day:
                cursor_x += date_token_gap
        if params.day:
            draw_spaced_text(
                draw,
                params.day,
                cursor_x,
                date_y,
                date_font,
                DATE_COLOR,
                date_char_spacing,
            )

    if has_product and product_font and product_bbox:
        product_y = (content_bottom + offset_y) + product_gap - product_bbox[1]
        draw.text(
            (border_total + params.padding_left, product_y),
            params.product,
            font=product_font,
            fill=DATE_COLOR,
        )

    if not params.white_bg and not params.has_border:
        alpha_bbox = out.getchannel("A").getbbox()
        if alpha_bbox:
            pad = 8
            alpha_bbox = (
                max(0, alpha_bbox[0] - pad),
                max(0, alpha_bbox[1] - pad),
                min(out.width, alpha_bbox[2] + pad),
                min(out.height, alpha_bbox[3] + pad),
            )
            out = out.crop(alpha_bbox)

    return out


def save_sticker(
    params: StickerParams,
    output: str | None = None,
    output_dir: str | Path | None = None,
) -> Path:
    output_path = build_output_path(params, output=output, output_dir=output_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image = generate_sticker(params)
    image.save(output_path)
    return output_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate VA sticker PNGs.")
    parser.add_argument("--month", default=DEFAULT_PARAMS.month)
    parser.add_argument("--day", default=DEFAULT_PARAMS.day)
    parser.add_argument("--year", default=DEFAULT_PARAMS.year)
    parser.add_argument("--product", default=DEFAULT_PARAMS.product)
    parser.add_argument("--no-border", action="store_true")
    parser.add_argument("--transparent", action="store_true")
    parser.add_argument("--short", action="store_true", help="Use the VA-only layout.")
    parser.add_argument("-o", "--output", help="Full output file path.")
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory to save into when --output is not provided.",
    )

    parser.add_argument("--w-ratio", type=float, default=DEFAULT_PARAMS.w_ratio)
    parser.add_argument("--bar-ratio", type=float, default=DEFAULT_PARAMS.bar_ratio)
    parser.add_argument("--gap-ratio", type=float, default=DEFAULT_PARAMS.gap_ratio)
    parser.add_argument("--crossbar-pos", type=float, default=DEFAULT_PARAMS.crossbar_pos)
    parser.add_argument("--v-slide", type=float, default=DEFAULT_PARAMS.v_slide)
    parser.add_argument("--o-size", type=float, default=DEFAULT_PARAMS.o_size)
    parser.add_argument("--bar-gap", type=float, default=DEFAULT_PARAMS.bar_gap)
    parser.add_argument("--bar-weight", type=float, default=DEFAULT_PARAMS.bar_weight)
    parser.add_argument("--o-offset", type=float, default=DEFAULT_PARAMS.o_offset)
    parser.add_argument("--text-size", type=int, default=DEFAULT_PARAMS.text_size)
    parser.add_argument("--letter-spacing", type=float, default=DEFAULT_PARAMS.letter_spacing_factor)
    parser.add_argument("--date-spacing", type=float, default=DEFAULT_PARAMS.date_spacing_factor)
    parser.add_argument("--ikram-x", type=float, default=DEFAULT_PARAMS.ikram_offset_x)
    parser.add_argument("--nantha-x", type=float, default=DEFAULT_PARAMS.nantha_offset_x)
    parser.add_argument("--padding-top", type=int, default=DEFAULT_PARAMS.padding_top)
    parser.add_argument("--padding-right", type=int, default=DEFAULT_PARAMS.padding_right)
    parser.add_argument("--padding-bottom", type=int, default=DEFAULT_PARAMS.padding_bottom)
    parser.add_argument("--padding-left", type=int, default=DEFAULT_PARAMS.padding_left)
    parser.add_argument("--nantha-offset", type=float, default=DEFAULT_PARAMS.nantha_offset)
    parser.add_argument("--border-thickness", type=int, default=DEFAULT_PARAMS.border_thickness)
    parser.add_argument("--border-radius", type=int, default=DEFAULT_PARAMS.border_radius)
    parser.add_argument("--corner-tl", type=int, default=DEFAULT_PARAMS.corner_tl)
    parser.add_argument("--corner-tr", type=int, default=DEFAULT_PARAMS.corner_tr)
    parser.add_argument("--corner-v-inner-l", type=int, default=DEFAULT_PARAMS.corner_v_inner_l)
    parser.add_argument("--corner-v-inner-r", type=int, default=DEFAULT_PARAMS.corner_v_inner_r)
    parser.add_argument("--corner-bl", type=int, default=DEFAULT_PARAMS.corner_bl)
    parser.add_argument("--corner-br", type=int, default=DEFAULT_PARAMS.corner_br)
    parser.add_argument("--corner-a-inner-l", type=int, default=DEFAULT_PARAMS.corner_a_inner_l)
    parser.add_argument("--corner-a-inner-r", type=int, default=DEFAULT_PARAMS.corner_a_inner_r)
    return parser


def params_from_args(args: argparse.Namespace) -> StickerParams:
    return StickerParams(
        month=args.month.strip(),
        day=args.day.strip(),
        year=args.year.strip(),
        product=args.product.strip(),
        has_border=not args.no_border,
        white_bg=not args.transparent,
        long_form=not args.short,
        w_ratio=args.w_ratio,
        bar_ratio=args.bar_ratio,
        gap_ratio=args.gap_ratio,
        v_slide=args.v_slide,
        crossbar_pos=args.crossbar_pos,
        o_size=args.o_size,
        bar_gap=args.bar_gap,
        bar_weight=args.bar_weight,
        o_offset=args.o_offset,
        text_size=args.text_size,
        padding_top=args.padding_top,
        padding_right=args.padding_right,
        padding_bottom=args.padding_bottom,
        padding_left=args.padding_left,
        nantha_offset=args.nantha_offset,
        letter_spacing_factor=args.letter_spacing,
        date_spacing_factor=args.date_spacing,
        ikram_offset_x=args.ikram_x,
        nantha_offset_x=args.nantha_x,
        border_thickness=args.border_thickness,
        border_radius=args.border_radius,
        corner_tl=args.corner_tl,
        corner_tr=args.corner_tr,
        corner_v_inner_l=args.corner_v_inner_l,
        corner_v_inner_r=args.corner_v_inner_r,
        corner_bl=args.corner_bl,
        corner_br=args.corner_br,
        corner_a_inner_l=args.corner_a_inner_l,
        corner_a_inner_r=args.corner_a_inner_r,
    )


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    params = params_from_args(args)
    output_path = save_sticker(params, output=args.output, output_dir=args.output_dir)
    print(f"Saved {output_path}")
    print(f"Using params: {asdict(params)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
