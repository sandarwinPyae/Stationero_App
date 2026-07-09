from db.database import SessionLocal, engine
from db.models import Product, Category, Base

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        category = db.query(Category).filter(Category.category_name == "Stationery").first()
        if not category:
            category = Category(category_name="Stationery")
            db.add(category)
            db.commit()
            db.refresh(category)

        # 🌟 Description တွေပါ တစ်ခါတည်း ထည့်ထားပါတယ် 🌟
        products_data = [
            {"name": "Sticky Notes", "price": 4200, "img": "stickyNotes.jpg", "desc": "Keep your thoughts organized and never miss a reminder with these vibrant, easy-to-stick notes."},
            {"name": "Desk Organizer", "price": 23000, "img": "deskOrganizer.jpg", "desc": "Declutter your workspace and keep your essentials neatly arranged with this sleek desk organizer."},
            {"name": "Gel Pens", "price": 3300, "img": "pen.jpg", "desc": "Experience ultra-smooth writing with these high-quality gel pens, perfect for daily notes and journaling."},
            {"name": "Paper clips", "price": 4500, "img": "paperClips.jpg", "desc": "Keep your documents tidy and secure with these durable, rust-resistant classic paper clips."},
            {"name": "Pencils", "price": 3200, "img": "pencils.jpg", "desc": "A timeless essential for writing, sketching, and drawing, featuring a comfortable grip for all-day use."},
            {"name": "Eraser", "price": 2000, "img": "eraser.jpg", "desc": "Clean, smudge-free erasing for all your pencil work; essential for students and professionals alike."},
            {"name": "File Folders", "price": 5300, "img": "folder.jpg", "desc": "Organize your important documents and protect your files from wear and tear with these sturdy folders."},
            {"name": "Pen Holder", "price": 6500, "img": "penHolder.jpg", "desc": "A stylish and functional addition to any desk, keeping your favorite pens and pencils always within reach."},
            {"name": "Calculator", "price": 32000, "img": "calculator.jpg", "desc": "Designed for accuracy and speed, this reliable calculator is a must-have for all your mathematical needs."},
            {"name": "Humidifier", "price": 38000, "img": "humidifier.jpg", "desc": "Maintain a comfortable environment in your office with this compact humidifier, promoting focus and well-being."},
            {"name": "Tape", "price": 3500, "img": "tapeOffer.jpg", "desc": "Strong, transparent, and versatile—perfect for all your light-duty binding and crafting needs."},
            {"name": "Mini Trash Can", "price": 12000, "img": "miniTrashCan.jpg", "desc": "Keep your workspace spotless with this cute and convenient mini bin, perfect for small scraps and debris."},
            {"name": "Correction Tapes", "price": 4000, "img": "correctionTapeOffer.jpg", "desc": "Make quick, clean corrections with this fast-drying tape, leaving your pages looking neat and professional."},
            {"name": "Highlighters", "price": 3500, "img": "highlighter.jpg", "desc": "Brighten up your study notes with these vivid, long-lasting highlighters that don't bleed through paper."},
            {"name": "Notebook", "price": 4500, "img": "notebookOffer.jpg", "desc": "Your perfect companion for capturing ideas, sketches, and daily goals on premium-quality paper."}
        ]

        for item in products_data:
            existing_product = db.query(Product).filter(Product.product_name == item["name"]).first()
            if not existing_product:
                new_product = Product(
                    category_id=category.category_id,
                    product_name=item["name"],
                    unit_price=item["price"] - 500,
                    selling_price=item["price"],
                    current_qty=50, 
                    product_img_url=item["img"],
                    description=item["desc"] # 🌟 အသစ်ထည့်ထားတဲ့ Field 🌟
                )
                db.add(new_product)

        db.commit()
        print("✅ Database အားလုံး အဆင်သင့် ဖြစ်ပါပြီ!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()