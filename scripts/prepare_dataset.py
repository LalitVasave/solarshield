import os
import shutil
import csv
import random
from pathlib import Path
from PIL import Image

def create_dirs(base_path):
    for split in ["train", "val"]:
        for dtype in ["images", "labels"]:
            (base_path / dtype / split).mkdir(parents=True, exist_ok=True)

def process_hot_spots(csv_path: Path, img_dir: Path, out_images_dir: Path, out_labels_dir: Path):
    if not csv_path.exists():
        print(f"Skipping {csv_path}, not found.")
        return
        
    print(f"Processing hot spots from {csv_path}...")
    annotations = {}
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename = row['filename']
            width = float(row['width'])
            height = float(row['height'])
            xmin = float(row['xmin'])
            ymin = float(row['ymin'])
            xmax = float(row['xmax'])
            ymax = float(row['ymax'])
            
            x_center = ((xmin + xmax) / 2) / width
            y_center = ((ymin + ymax) / 2) / height
            w = (xmax - xmin) / width
            h = (ymax - ymin) / height
            
            # class 0 = hot_spot
            yolo_line = f"0 {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}\n"
            if filename not in annotations:
                annotations[filename] = []
            annotations[filename].append(yolo_line)
            
    for filename, lines in annotations.items():
        src_img = img_dir / filename
        if not src_img.exists():
            continue
            
        dst_img = out_images_dir / filename
        dst_txt = out_labels_dir / (src_img.stem + ".txt")
        
        shutil.copy2(src_img, dst_img)
        with open(dst_txt, "w") as f:
            f.writelines(lines)

def process_classification(src_dir: Path, out_base_dir: Path, class_id: int, is_dirty: bool):
    if not src_dir.exists():
        print(f"Skipping {src_dir}, not found.")
        return
        
    print(f"Processing classification images from {src_dir} (is_dirty={is_dirty})...")
    images = list(src_dir.glob("*.jpg"))
    random.shuffle(images)
    
    split_idx = int(len(images) * 0.8)
    train_imgs = images[:split_idx]
    val_imgs = images[split_idx:]
    
    for split, img_list in [("train", train_imgs), ("val", val_imgs)]:
        for src_img in img_list:
            # Prefix to avoid name collisions
            new_name = f"cls_{src_img.name}"
            dst_img = out_base_dir / "images" / split / new_name
            dst_txt = out_base_dir / "labels" / split / f"cls_{src_img.stem}.txt"
            
            shutil.copy2(src_img, dst_img)
            
            with open(dst_txt, "w") as f:
                if is_dirty:
                    # class 1 = dirty, box covering central 80% (x=0.5, y=0.5, w=0.8, h=0.8)
                    f.write(f"{class_id} 0.500000 0.500000 0.800000 0.800000\n")
                else:
                    # clean = empty file (background image)
                    f.write("")

def main():
    base_dir = Path(os.getcwd())
    dataset_dir = base_dir / "dataset"
    yolo_dir = dataset_dir / "yolo"
    
    print("Creating YOLO dataset directories...")
    create_dirs(yolo_dir)
    
    # 1. Process Hot Spots (Thermal)
    pvhsd_dir = dataset_dir / "PV-HSD-2025.v1i.tensorflow"
    process_hot_spots(
        csv_path=pvhsd_dir / "train" / "_annotations.csv",
        img_dir=pvhsd_dir / "train",
        out_images_dir=yolo_dir / "images" / "train",
        out_labels_dir=yolo_dir / "labels" / "train"
    )
    process_hot_spots(
        csv_path=pvhsd_dir / "valid" / "_annotations.csv",
        img_dir=pvhsd_dir / "valid",
        out_images_dir=yolo_dir / "images" / "val",
        out_labels_dir=yolo_dir / "labels" / "val"
    )
    
    # 2. Process Clean & Dirty (RGB)
    raw_dataset_dir = dataset_dir / "dataset"
    process_classification(raw_dataset_dir / "dirty", yolo_dir, class_id=1, is_dirty=True)
    process_classification(raw_dataset_dir / "clean", yolo_dir, class_id=-1, is_dirty=False)
    
    # 3. Create data.yaml
    yaml_path = yolo_dir / "data.yaml"
    yaml_content = f"""path: {yolo_dir.absolute().as_posix()}
train: images/train
val: images/val

# Classes
nc: 2
names: ['hot_spot', 'dirty']
"""
    with open(yaml_path, "w") as f:
        f.write(yaml_content)
        
    print(f"YOLO dataset successfully generated at: {yolo_dir}")

if __name__ == "__main__":
    main()
