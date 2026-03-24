from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io
import cv2
import time

app = Flask(__name__)
CORS(app)
DEBUG_PREDICT_LOG = False

CLASSES = [
    "ADBHUTA", "BHAYANAKA", "BIBHATSA",
    "HASYA", "KARUNA", "RAUDRA",
    "SHANTA", "SHRINGARA", "VEERA"
]

print("Loading model...")
model = tf.keras.models.load_model("saved_model")
print("Model loaded successfully!")
print("Model input shape:", model.input_shape)
try:
    # Warm up one inference to reduce first-request latency.
    _warmup = np.zeros((1, 48, 48, 1), dtype=np.float32)
    _ = model.predict(_warmup, verbose=0)
    print("Model warmup complete.")
except Exception as warmup_error:
    print("Model warmup skipped:", warmup_error)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

def clamp01(value):
    return max(0.0, min(1.0, float(value)))

def calibrated_confidence(raw_confidence, margin, face_quality):
    """
    Confidence calibration:
    - raw confidence: model certainty for predicted class
    - margin: separation from second-best class
    - face_quality: lighting/focus/face-size quality indicator
    """
    raw = clamp01(raw_confidence)
    mrg = clamp01(margin)
    quality = clamp01(face_quality)
    blend = 0.64 * raw + 0.21 * mrg + 0.15 * quality
    gamma = 0.65 if blend >= 0.45 else 0.82
    # Lift low-confidence floor slightly so UI does not collapse into 10-30 ranges.
    return clamp01(0.12 + 0.88 * pow(blend, gamma))

def decode_base64_image(image_value):
    raw = str(image_value or "").strip()
    if not raw:
        return None
    payload = raw.split(",", 1)[1] if "," in raw else raw
    image_bytes = base64.b64decode(payload, validate=False)
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("L")
    return np.array(pil_image)

def detect_faces(gray_image):
    img_h, img_w = gray_image.shape[:2]
    min_side = max(40, min(img_h, img_w) // 8)
    passes = [
        {"scaleFactor": 1.2, "minNeighbors": 6},
        {"scaleFactor": 1.15, "minNeighbors": 5},
        {"scaleFactor": 1.1, "minNeighbors": 4},
    ]
    for params in passes:
        faces = face_cascade.detectMultiScale(
            gray_image,
            scaleFactor=params["scaleFactor"],
            minNeighbors=params["minNeighbors"],
            minSize=(min_side, min_side),
        )
        if len(faces):
            return faces
    return []

def preprocess_face(gray_image, box):
    x, y, w, h = [int(v) for v in box]
    pad = int(0.12 * max(w, h))
    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(gray_image.shape[1], x + w + pad)
    y1 = min(gray_image.shape[0], y + h + pad)

    face = gray_image[y0:y1, x0:x1]
    face = cv2.resize(face, (48, 48), interpolation=cv2.INTER_AREA)
    face = cv2.GaussianBlur(face, (3, 3), 0)
    return face

def estimate_face_quality(gray_image, box):
    img_h, img_w = gray_image.shape[:2]
    x, y, w, h = [int(v) for v in box]
    x = max(0, min(x, img_w - 1))
    y = max(0, min(y, img_h - 1))
    w = max(1, min(w, img_w - x))
    h = max(1, min(h, img_h - y))
    face = gray_image[y:y + h, x:x + w]

    brightness = np.mean(face) / 255.0
    brightness_score = clamp01(1.0 - abs(brightness - 0.56) / 0.56)
    sharpness_var = cv2.Laplacian(face, cv2.CV_64F).var() if face.size else 0.0
    sharpness_score = clamp01(sharpness_var / 450.0)
    face_area_ratio = (w * h) / float(max(1, img_w * img_h))
    size_score = clamp01(face_area_ratio / 0.16)

    return clamp01(0.40 * brightness_score + 0.35 * sharpness_score + 0.25 * size_score)

def predict_with_tta(face_48, fast_mode=True):
    if fast_mode:
        variants = [
            face_48,
            cv2.flip(face_48, 1),
        ]
    else:
        variants = [
            face_48,
            cv2.equalizeHist(face_48),
            clahe.apply(face_48),
            cv2.flip(face_48, 1),
        ]
    preds = []
    for variant in variants:
        arr = variant.astype("float32") / 255.0
        arr = np.expand_dims(arr, axis=-1)
        arr = np.expand_dims(arr, axis=0)
        preds.append(model.predict(arr, verbose=0)[0])
    mean_pred = np.mean(preds, axis=0)
    denom = float(np.sum(mean_pred))
    if denom <= 0:
        return np.full((len(CLASSES),), 1.0 / len(CLASSES), dtype=np.float32)
    return (mean_pred / denom).astype(np.float32)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        start_time = time.time()
        body = request.get_json(silent=True) or {}
        data = body.get("image", None)
        target_emotion = str(body.get("targetEmotion", "") or "").strip().upper()
        fast_mode = bool(body.get("fast", True))

        if not data:
            return jsonify({"emotion": "NO_IMAGE", "confidence": 0.0})

        # Decode image
        open_cv_image = decode_base64_image(data)
        if open_cv_image is None:
            return jsonify({"emotion": "NO_IMAGE", "confidence": 0.0})

        # Face detection
        faces = detect_faces(open_cv_image)

        if len(faces) == 0:
            return jsonify({"emotion": "NO_FACE", "confidence": 0.0})

        # Take largest face (better than first)
        faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
        (x, y, w, h) = faces[0]
        face = preprocess_face(open_cv_image, (x, y, w, h))
        face_quality = estimate_face_quality(open_cv_image, (x, y, w, h))

        # Predict (test-time augmentation)
        prediction = predict_with_tta(face, fast_mode=fast_mode)

        top_indices = np.argsort(prediction)[::-1]
        emotion_index = int(top_indices[0])
        second_index = int(top_indices[1]) if len(top_indices) > 1 else emotion_index
        raw_confidence = clamp01(float(prediction[emotion_index]))
        second_raw_confidence = clamp01(float(prediction[second_index]))
        margin = clamp01(raw_confidence - second_raw_confidence)
        confidence = calibrated_confidence(raw_confidence, margin, face_quality)

        emotion = CLASSES[emotion_index]
        probabilities = {CLASSES[i]: float(prediction[i]) for i in range(len(CLASSES))}
        top_three = top_indices[:3]
        top_predictions = [
            {
                "emotion": CLASSES[int(i)],
                "raw_confidence": clamp01(float(prediction[int(i)])),
                "confidence": calibrated_confidence(
                    float(prediction[int(i)]),
                    max(0.0, float(prediction[int(i)]) - float(prediction[int(top_indices[1] if len(top_indices) > 1 else i)])),
                    face_quality,
                ),
            }
            for i in top_three
        ]

        target_raw = clamp01(float(probabilities.get(target_emotion, 0.0)))
        if target_emotion and target_emotion in CLASSES:
            target_idx = CLASSES.index(target_emotion)
            best_other = max(
                [float(prediction[i]) for i in range(len(CLASSES)) if i != target_idx],
                default=0.0,
            )
            target_margin = float(target_raw - best_other)
            target_confidence = calibrated_confidence(target_raw, max(0.0, target_margin), face_quality)
            target_gap = clamp01(best_other - target_raw)
            target_rank = int(np.where(top_indices == target_idx)[0][0]) + 1
        else:
            target_margin = 0.0
            target_confidence = 0.0
            target_gap = 1.0
            target_rank = len(CLASSES)

        if DEBUG_PREDICT_LOG:
            print(
                "Detected:", emotion,
                "Raw:", round(raw_confidence, 4),
                "Calibrated:", round(confidence, 4),
                "Margin:", round(margin, 4),
                "FaceQ:", round(face_quality, 4),
                "Target:", target_emotion or "-",
                "TargetRaw:", round(target_raw, 4),
                "Fast:", fast_mode,
            )

        return jsonify({
            "emotion": emotion,
            "confidence": confidence,
            "raw_confidence": raw_confidence,
            "margin": margin,
            "face_quality": face_quality,
            "target_emotion": target_emotion,
            "target_confidence": target_confidence,
            "target_raw_confidence": target_raw,
            "target_margin": target_margin,
            "target_gap": target_gap,
            "target_rank": target_rank,
            "top_predictions": top_predictions,
            "probabilities": probabilities,
            "inference_ms": int((time.time() - start_time) * 1000),
            "face_box": {
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h)
            }
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"emotion": "ERROR", "confidence": 0.0})

@app.route("/")
def home():
    return "Navarasa AI Service Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
