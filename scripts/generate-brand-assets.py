from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.58, 0.5))


def contain(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGBA")
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    return image


def make_favicons() -> None:
    logo = Image.open(ASSETS / "monsta-squeeze-logo.png").convert("RGBA")
    side = max(logo.size)
    square = Image.new("RGBA", (side, side), (8, 8, 8, 255))
    square.alpha_composite(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
    square.thumbnail((512, 512), Image.Resampling.LANCZOS)
    square.save(ASSETS / "monsta-squeeze-icon.png", optimize=True)
    square.resize((180, 180), Image.Resampling.LANCZOS).save(ASSETS / "apple-touch-icon.png", optimize=True)
    square.resize((64, 64), Image.Resampling.LANCZOS).save(ASSETS / "favicon-64.png", optimize=True)
    square.resize((32, 32), Image.Resampling.LANCZOS).save(ASSETS / "favicon-32.png", optimize=True)
    square.save(ROOT / "public" / "favicon.ico", sizes=[(32, 32), (64, 64), (128, 128), (256, 256)])


def make_share_preview() -> None:
    size = (1200, 630)
    canvas = fit_cover(Image.open(ASSETS / "hero-atmosphere-v2.webp"), size).convert("RGBA")
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, 575, 630), fill=(3, 3, 3, 215))
    draw.rectangle((0, 0, 1200, 630), fill=(0, 0, 0, 28))
    canvas = Image.alpha_composite(canvas, overlay)

    for filename, x, y, max_size, angle in [
        ("strawberry-lemonade-cutout.webp", 690, 112, (205, 485), -7),
        ("classic-lemonade-cutout.webp", 845, 65, (230, 530), 2),
        ("half-half-cutout.webp", 1005, 118, (205, 480), 8),
    ]:
        bottle = contain(Image.open(ASSETS / filename), max_size)
        bottle = bottle.rotate(angle, Image.Resampling.BICUBIC, expand=True)
        canvas.alpha_composite(bottle, (x - bottle.width // 2, y))

    logo = contain(Image.open(ASSETS / "monsta-squeeze-logo.png"), (245, 210))
    canvas.alpha_composite(logo, (58, 34))

    draw = ImageDraw.Draw(canvas)
    display = "C:/Windows/Fonts/impact.ttf"
    bold = "C:/Windows/Fonts/arialbd.ttf"
    title = ImageFont.truetype(display, 82)
    yellow = ImageFont.truetype(display, 96)
    body = ImageFont.truetype(bold, 25)
    draw.text((58, 245), "SQUEEZE THE", font=title, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    draw.text((58, 322), "MONSTA", font=yellow, fill=(255, 212, 0), stroke_width=3, stroke_fill=(0, 0, 0))
    draw.text((62, 438), "Bold flavor. Fresh squeezed.", font=body, fill=(255, 255, 255))
    draw.text((62, 474), "Find your flavor near you.", font=body, fill=(255, 255, 255))
    draw.rounded_rectangle((58, 528, 342, 585), radius=28, fill=(255, 212, 0))
    draw.text((83, 543), "FIND A STORE  →", font=ImageFont.truetype(bold, 18), fill=(8, 8, 8))
    canvas.convert("RGB").save(ASSETS / "monsta-squeeze-share.jpg", quality=92, optimize=True, progressive=True)


if __name__ == "__main__":
    make_favicons()
    make_share_preview()
