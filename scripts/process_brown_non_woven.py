from PIL import Image

src_path = r"C:\Users\Arathy tp\.gemini\antigravity-ide\brain\73fbdf4e-a99c-4057-aad2-5ff1afad9be5\.user_uploaded\media_1791805282184.jpg"
out_path = r"C:\Users\Arathy tp\OneDrive\Desktop\occasions\public\images\flower-bouquet\brown-non-woven-pink-ribbon.jpg"
preview_path = r"C:\Users\Arathy tp\.gemini\antigravity-ide\brain\73fbdf4e-a99c-4057-aad2-5ff1afad9be5\scratch\brown_non_woven_square.jpg"

img = Image.open(src_path)
print(f"Source size: {img.size}")

img.save(out_path, quality=95)
print(f"Saved full image to {out_path}")

min_dim = min(img.size) # 819
c_left = 0
c_top = int((img.height - min_dim) * 0.35)
sq = img.crop((c_left, c_top, c_left + min_dim, c_top + min_dim))
sq.save(preview_path, quality=90)
print(f"Saved square preview to {preview_path} at size {sq.size}")
