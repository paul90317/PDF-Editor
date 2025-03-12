import os
import uuid
import fitz  # PyMuPDF
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse, Response
import pymongo
from pymongo.results import InsertOneResult
import datetime
import io
from dotenv import load_dotenv
from bson.objectid import ObjectId
# uvicorn main:app --reload --port 3000

# 載入 .env 檔案
load_dotenv()

# 從環境變數讀取 MongoDB 設定
mongo_host = os.getenv('MONGO_HOST')
mongo_port = int(os.getenv('MONGO_PORT'))
mongo_db_name = os.getenv('MONGO_DB_NAME')
mongo_user = os.getenv('MONGO_USER')
mongo_password = os.getenv('MONGO_PASSWORD')

# MongoDB 連線
client = pymongo.MongoClient(
    mongo_host,
    mongo_port,
    username=mongo_user,
    password=mongo_password,
    authSource='admin'  # 或您的驗證資料庫名稱
)
db = client[mongo_db_name]
collection_img = db['img']
collection_pdf = db['pdf']

app = FastAPI()

# 儲存上傳的 PDF 檔案
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def draw2shape(path, shape: fitz.Shape):
    """將路徑繪製到 shape 上"""
    for item in path["items"]:
        if item[0] == "l":  # 直線
            shape.draw_line(item[1], item[2])
        elif item[0] == "c":  # 貝茲曲線
            shape.draw_bezier(item[1], item[2], item[3], item[4])
        elif item[0] == "re":  # 矩形
            shape.draw_rect(item[1])
        else:
            print(f"未知的路徑元素：{item}")  # 處理未知元素

    shape.finish(
        color=path["color"], fill=path["fill"], fill_opacity=path["fill_opacity"]
    )  # 設定顏色和填充

def modify_pdf_content(pdfid, selecteds: list[list[bool]]):
    """提取 PDF 檔案中的文字、圖片和向量圖形"""
    data = collection_pdf.find_one(ObjectId(pdfid))
    doc = fitz.open(stream=data['data'], filetype='pdf')

    for page, selected in list(zip(doc, selecteds)):
        # extract the links
        links = page.get_links()

        # 提取向量圖形 (轉換為 PNG)
        paths = page.get_drawings()

        # 刪除所有向量圖
        page.add_redact_annot(page.rect)
        page._apply_redactions(2, 0, 1)

        # 插入想保留的向量圖
        for i, path in enumerate(paths):
            if selected[i]:
                shape: fitz.Shape = page.new_shape()
                draw2shape(path, shape)
                shape.commit()

        # 復原連結
        for link in links:
            page.insert_link(link)

    # 將修改後的 PDF 儲存到記憶體中的位元組串流
    output_buffer = io.BytesIO()
    doc.save(output_buffer)
    doc.close()
    result = output_buffer.getvalue()
    output_buffer.close()
    return result


def extract_pdf_content(blob):
    """提取 PDF 檔案中的文字、圖片和向量圖形"""
    doc = fitz.open(stream=blob, filetype='pdf')
    pages = []
    for page in doc:
        # 提取向量圖形 (轉換為 PNG)
        paths = page.get_drawings()
        matrix = fitz.Matrix(3, 3)
        
        pixs = []
        pix : fitz.Pixmap = page.get_pixmap(matrix=matrix, clip=page.rect)
        bytes = pix.tobytes("png")
        imgid : InsertOneResult = collection_img.insert_one({
            'data': bytes,
            'expireAt': datetime.datetime.utcnow() + datetime.timedelta(
                seconds=60 # seconds
            )    
        })
        pixs.append(str(imgid.inserted_id))

        for path in paths:
            border = (-1, -1, 1, 1)
            pix : fitz.Pixmap = page.get_pixmap(matrix=matrix, clip=path["rect"] + border)
            bytes = pix.tobytes("png")
            imgid : InsertOneResult = collection_img.insert_one({
                'data': bytes,
                'expireAt': datetime.datetime.utcnow() + datetime.timedelta(
                    seconds=60 # seconds
                )    
            })
            pixs.append(str(imgid.inserted_id))
        pages.append(pixs)

    doc.close()
    pdfid = collection_pdf.insert_one({
        'data': blob,
        'expireAt': datetime.datetime.utcnow() + datetime.timedelta(
            seconds=60 # seconds
        )
    })
    return str(pdfid.inserted_id), pages

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """上傳 PDF 檔案並生成唯一檔案名稱"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="僅支持 PDF 檔案")

    data = await file.read()
    id, pages = extract_pdf_content(data)
    return JSONResponse(content={"id": id, "pages": pages})

@app.post("/process/{file_id}")
async def process_pdf(file_id: str, selecteds: list[list[bool]] = Body(...)):
    """處理 PDF 檔案並返回結果"""
    try:
        data = modify_pdf_content(file_id, selecteds)
    except:
        raise HTTPException(status_code=404, detail="檔案不存在")

    return Response(
        content=data, 
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={file_id}.pdf"}
    )

@app.get("/img/{img_id}")
async def fetch_img(img_id: str):
    """處理 PDF 檔案並返回結果"""
    try:
        document = collection_img.find_one(ObjectId(img_id))
        if document:
            blob_data = document['data']
            return Response(
                content=blob_data,
                media_type="application/octet-stream",
                headers={"Content-Disposition": f"attachment; filename={img_id}.png"}
            )
        else:
            raise HTTPException(status_code=404, detail="找不到 BLOB 資料")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"檢索 BLOB 資料時發生錯誤：{e}")