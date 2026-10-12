from PIL import Image

src_path = r"C:\Users\Arathy tp\.gemini\antigravity-ide\brain\73fbdf4e-a99c-4057-aad2-5ff1afad9be5\blush_sunshine_wide_1791803768390.jpg"
out_path = r"C:\Users\Arathy tp\OneDrive\Desktop\occasions\public\images\flower-bouquet\blush-sunshine-rose.jpg"
preview_path = r"C:\Users\Arathy tp\.gemini\antigravity-ide\brain\73fbdf4e-a99c-4057-aad2-5ff1afad9be5\scratch\blush_sunshine_square_final.jpg"

img = Image.open(src_path)
print(f"Source size: {img.size}")

target_w = 819
target_h = 1024
target_ratio = target_w / target_h
w, h = img.size

crop_h = int(w / target_ratio)
top = int((h - crop_h) * 0.45)
crop_box = (0, top, w, top + crop_h)
cropped = img.crop(crop_box)
final_img = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
final_img.save(out_path, quality=95)
print(f"Saved {out_path} at size {final_img.size}")

min_dim = min(final_img.size)
c_left = (final_img.width - min_dim) // 2
c_top = (final_img.height - min_dim) // 2
square_crop = final_img.crop((c_left, c_top, c_left + min_dim, c_top + min_dim))
square_crop.save(preview_path, quality=90)
print(f"Saved square preview {preview_path} at size {square_crop.size}")
