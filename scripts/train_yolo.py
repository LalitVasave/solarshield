import argparse
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 on SolarShield dataset")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs to train")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--data", type=str, default="dataset/yolo/data.yaml", help="Path to data.yaml")
    args = parser.parse_args()

    print(f"Loading YOLOv8n model...")
    # Load a pretrained YOLOv8 nano model
    model = YOLO("yolov8n.pt")
    
    print(f"Starting training on {args.data} for {args.epochs} epochs...")
    # Train the model
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=640,
        project="models",
        name="yolov8_faults",
        exist_ok=True,     # Overwrite existing models/yolov8_faults
        device="cpu"       # Use CPU since we might not have a CUDA GPU setup. Change to 0 if CUDA is available.
    )
    
    print(f"Training complete! Best model saved to: models/yolov8_faults/weights/best.pt")

if __name__ == "__main__":
    main()
