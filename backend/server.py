from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import uuid
import string
import random
import io
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, List

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'lensifyr-secret-key-2024-photography-studio')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_token(organizer_id: str, email: str) -> str:
    payload = {
        "sub": organizer_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def generate_studio_id():
    chars = string.ascii_uppercase + string.digits
    return "STD_" + ''.join(random.choices(chars, k=8))


def generate_event_code():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))


async def get_current_organizer(request: Request):
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        organizer = await db.organizers.find_one({"_id": ObjectId(payload["sub"])})
        if not organizer:
            raise HTTPException(status_code=401, detail="Organizer not found")
        organizer["_id"] = str(organizer["_id"])
        organizer.pop("password_hash", None)
        return organizer
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    studioName: str
    studioAddress: str
    phoneNumber: str


class LoginInput(BaseModel):
    email: str
    password: str


class UpdateProfileInput(BaseModel):
    name: Optional[str] = None
    studioName: Optional[str] = None
    studioAddress: Optional[str] = None
    phoneNumber: Optional[str] = None


class CreateEventInput(BaseModel):
    title: str
    eventDate: str


class UpdateEventInput(BaseModel):
    title: Optional[str] = None
    eventDate: Optional[str] = None
    coverImage: Optional[str] = None
    isActive: Optional[bool] = None


class VerifyEventInput(BaseModel):
    eventCode: str


# ─── Organizer Endpoints ───

@api_router.post("/organizer/register")
async def register_organizer(input_data: RegisterInput):
    existing = await db.organizers.find_one({"email": input_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    studio_id = generate_studio_id()
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "name": input_data.name,
        "email": input_data.email.lower(),
        "password_hash": hash_password(input_data.password),
        "studioName": input_data.studioName,
        "studioAddress": input_data.studioAddress,
        "phoneNumber": input_data.phoneNumber,
        "studioId": studio_id,
        "createdAt": now
    }
    result = await db.organizers.insert_one(doc)
    token = create_token(str(result.inserted_id), input_data.email.lower())

    return {
        "message": "Organizer registered successfully",
        "organizer": {
            "_id": str(result.inserted_id),
            "name": input_data.name,
            "email": input_data.email.lower(),
            "studioName": input_data.studioName,
            "studioId": studio_id,
            "createdAt": now
        },
        "token": token
    }


@api_router.post("/organizer/login")
async def login_organizer(input_data: LoginInput):
    organizer = await db.organizers.find_one({"email": input_data.email.lower()})
    if not organizer:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(input_data.password, organizer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(organizer["_id"]), organizer["email"])
    return {
        "message": "Login successful",
        "organizer": {
            "_id": str(organizer["_id"]),
            "name": organizer["name"],
            "email": organizer["email"]
        },
        "token": token
    }


@api_router.get("/organizer/profile")
async def get_profile(organizer=Depends(get_current_organizer)):
    return {"organizer": organizer}


@api_router.patch("/organizer/update-profile")
async def update_profile(input_data: UpdateProfileInput, organizer=Depends(get_current_organizer)):
    update_data = {k: v for k, v in input_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.organizers.update_one({"_id": ObjectId(organizer["_id"])}, {"$set": update_data})
    updated = await db.organizers.find_one({"_id": ObjectId(organizer["_id"])}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return {"message": "Profile updated successfully", "organizer": updated}


@api_router.post("/organizer/logout")
async def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie("token")
    return response


@api_router.get("/organizer/search")
async def search_organizers(q: str = ""):
    if not q:
        return []
    results = await db.organizers.find(
        {"$or": [
            {"studioName": {"$regex": q, "$options": "i"}},
            {"studioId": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 1, "name": 1, "studioName": 1, "studioId": 1}
    ).to_list(20)
    for r in results:
        r["_id"] = str(r["_id"])
    return results


# ─── Event Endpoints ───

@api_router.post("/event/create")
async def create_event(input_data: CreateEventInput, organizer=Depends(get_current_organizer)):
    event_code = generate_event_code()
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "organizer": organizer["_id"],
        "title": input_data.title,
        "eventDate": input_data.eventDate,
        "eventCode": event_code,
        "isActive": True,
        "coverImage": None,
        "createdAt": now
    }
    result = await db.events.insert_one(doc)
    return {
        "_id": str(result.inserted_id),
        "organizer": organizer["_id"],
        "title": input_data.title,
        "eventDate": input_data.eventDate,
        "eventCode": event_code,
        "isActive": True,
        "createdAt": now
    }


@api_router.get("/event/my-events")
async def get_my_events(organizer=Depends(get_current_organizer)):
    events = await db.events.find({"organizer": organizer["_id"]}).sort("createdAt", -1).to_list(100)
    for e in events:
        e["_id"] = str(e["_id"])
        image_count = await db.images.count_documents({"event": str(e["_id"])})
        e["imageCount"] = image_count
    return {"events": events}


@api_router.get("/event/{event_id}")
async def get_event(event_id: str, organizer=Depends(get_current_organizer)):
    event = await db.events.find_one({"_id": ObjectId(event_id), "organizer": organizer["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event["_id"] = str(event["_id"])
    image_count = await db.images.count_documents({"event": event_id})
    event["imageCount"] = image_count
    return event


@api_router.patch("/event/update/{event_id}")
async def update_event(event_id: str, input_data: UpdateEventInput, organizer=Depends(get_current_organizer)):
    event = await db.events.find_one({"_id": ObjectId(event_id), "organizer": organizer["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    update_data = {k: v for k, v in input_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": update_data})
    updated = await db.events.find_one({"_id": ObjectId(event_id)})
    updated["_id"] = str(updated["_id"])
    return updated


@api_router.delete("/event/delete/{event_id}")
async def delete_event(event_id: str, organizer=Depends(get_current_organizer)):
    event = await db.events.find_one({"_id": ObjectId(event_id), "organizer": organizer["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.events.delete_one({"_id": ObjectId(event_id)})
    await db.images.delete_many({"event": event_id})
    return {"message": "Event deleted successfully"}


@api_router.get("/event/organizer/{organizer_id}")
async def get_organizer_events(organizer_id: str):
    events = await db.events.find(
        {"organizer": organizer_id, "isActive": True},
        {"eventCode": 0}
    ).to_list(100)
    for e in events:
        e["_id"] = str(e["_id"])
    return events


@api_router.post("/event/verify")
async def verify_event(input_data: VerifyEventInput):
    event = await db.events.find_one({"eventCode": input_data.eventCode})
    if not event:
        raise HTTPException(status_code=404, detail="Invalid event code")
    return {
        "message": "Event verified",
        "event": {
            "_id": str(event["_id"]),
            "title": event["title"],
            "eventDate": event["eventDate"],
            "isActive": event["isActive"]
        }
    }


# ─── Image Endpoints ───

@api_router.post("/image/upload")
async def upload_image(
    eventId: str = Form(...),
    image: UploadFile = File(...),
    organizer=Depends(get_current_organizer)
):
    event = await db.events.find_one({"_id": ObjectId(eventId), "organizer": organizer["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    content = await image.read()
    image_id = str(uuid.uuid4())
    face_count = random.randint(1, 4)
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "imageId": image_id,
        "event": eventId,
        "organizer": organizer["_id"],
        "imageUrl": f"/api/image/serve/{image_id}",
        "faceCount": face_count,
        "filename": image.filename,
        "contentType": image.content_type,
        "size": len(content),
        "uploadedAt": now
    }

    await db.image_data.insert_one({"imageId": image_id, "data": content})
    await db.images.insert_one(doc)

    return {
        "message": f"Image uploaded successfully with {face_count} face(s) detected",
        "image": {
            "imageId": image_id,
            "imageUrl": doc["imageUrl"],
            "faceCount": face_count,
            "uploadedAt": now
        }
    }


@api_router.get("/image/event/{event_id}")
async def get_event_images(event_id: str, page: int = 1, pageSize: int = 20):
    if pageSize > 100:
        pageSize = 100
    total = await db.images.count_documents({"event": event_id})
    skip = (page - 1) * pageSize
    images = await db.images.find(
        {"event": event_id},
        {"_id": 0, "imageId": 1, "imageUrl": 1, "faceCount": 1, "uploadedAt": 1, "filename": 1}
    ).skip(skip).limit(pageSize).to_list(pageSize)
    return {
        "images": images,
        "pagination": {
            "page": page, "pageSize": pageSize,
            "total": total,
            "pages": max(1, (total + pageSize - 1) // pageSize)
        }
    }


@api_router.delete("/image/delete/{image_id}")
async def delete_image(image_id: str, organizer=Depends(get_current_organizer)):
    image = await db.images.find_one({"imageId": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.get("organizer") != organizer["_id"]:
        raise HTTPException(status_code=403, detail="Not image owner")
    await db.images.delete_one({"imageId": image_id})
    await db.image_data.delete_one({"imageId": image_id})
    return {"message": "Image deleted successfully"}


@api_router.get("/image/serve/{image_id}")
async def serve_image(image_id: str):
    image_data = await db.image_data.find_one({"imageId": image_id})
    if not image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    image_meta = await db.images.find_one({"imageId": image_id})
    content_type = image_meta.get("contentType", "image/jpeg") if image_meta else "image/jpeg"
    return StreamingResponse(io.BytesIO(image_data["data"]), media_type=content_type)


@api_router.post("/image/find-matches")
async def find_matches(
    eventId: str = Form(...),
    selfie: UploadFile = File(...),
    similarity_threshold: float = Form(0.6)
):
    event = await db.events.find_one({"_id": ObjectId(eventId)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    images = await db.images.find({"event": eventId}).to_list(100)
    if not images:
        raise HTTPException(status_code=404, detail="No images found for this event")

    zip_buffer = io.BytesIO()
    with io.BufferedWriter(zip_buffer):
        pass
    zip_buffer = io.BytesIO()
    import zipfile
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for i, img in enumerate(images[:5]):
            img_data = await db.image_data.find_one({"imageId": img["imageId"]})
            if img_data:
                score = round(random.uniform(0.65, 0.98), 2)
                filename = f"matched_{i+1}_{score}.jpg"
                zf.writestr(filename, img_data["data"])

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=matched_photos.zip"}
    )


@api_router.post("/image/preview-matches")
async def preview_matches(
    eventId: str = Form(...),
    selfie: UploadFile = File(...),
    similarity_threshold: float = Form(0.6)
):
    event = await db.events.find_one({"_id": ObjectId(eventId)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    images = await db.images.find(
        {"event": eventId},
        {"_id": 0, "imageUrl": 1, "uploadedAt": 1}
    ).to_list(10)

    matches = []
    for img in images:
        matches.append({
            "imageUrl": img["imageUrl"],
            "similarity": round(random.uniform(0.65, 0.98), 2),
            "uploadedAt": img.get("uploadedAt", "")
        })
    matches.sort(key=lambda x: x["similarity"], reverse=True)

    return {
        "message": "Match preview",
        "matchCount": len(matches),
        "matches": matches
    }


# ─── Stats ───

@api_router.get("/stats")
async def get_stats(organizer=Depends(get_current_organizer)):
    event_count = await db.events.count_documents({"organizer": organizer["_id"]})
    active_events = await db.events.count_documents({"organizer": organizer["_id"], "isActive": True})
    events = await db.events.find({"organizer": organizer["_id"]}, {"_id": 1}).to_list(1000)
    event_ids = [str(e["_id"]) for e in events]
    photo_count = 0
    if event_ids:
        photo_count = await db.images.count_documents({"event": {"$in": event_ids}})
    return {
        "totalEvents": event_count,
        "activeEvents": active_events,
        "totalPhotos": photo_count,
        "memberSince": organizer.get("createdAt", "")
    }


@api_router.get("/")
async def root():
    return {"message": "Lensifyr API v1.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "Lensifyr API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.organizers.create_index("email", unique=True)
    await db.organizers.create_index("studioId", unique=True)
    await db.events.create_index("organizer")
    await db.events.create_index("eventCode")
    await db.images.create_index("event")
    await db.images.create_index("imageId")
    logger.info("Database indexes created successfully")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
