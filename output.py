import fitz
import os

def draw2shape(path, shape : fitz.Shape):
    for item in path['items']:
        if item[0] == 'l':  # 直線
            shape.draw_line(item[1], item[2])
        elif item[0] == 'c':  # 貝茲曲線
            shape.draw_bezier(item[1], item[2], item[3], item[4])
        elif item[0] == 're': # 矩形
            shape.draw_rect(item[1])
        else:
            print(f"未知的路徑元素：{item}")  # 處理未知元素
    

    shape.finish(color=path['color'], fill=path['fill'], fill_opacity=path['fill_opacity'])  # 設定顏色和填充

def extract_pdf_content(pdf_path, output_folder):
    """提取 PDF 檔案中的文字、圖片和向量圖形。

    Args:
        pdf_path: PDF 檔案路徑。
    """

    # 建立輸出資料夾
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    doc = fitz.open(pdf_path)

    for page in doc:
        # 提取圖片
        images = page.get_images(full=True)
        for i, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            if base_image:
                pix = fitz.Pixmap(doc, xref)
                pix.save(os.path.join(output_folder, f"page_{page.number}_image_{i}.png"))
        
        # 提取連結
        links = page.get_links()

        # 提取向量圖形 (轉換為 PNG)
        paths = page.get_drawings()
        matrix = fitz.Matrix(3, 3)
        for i, path in enumerate(paths):
            border = (-1, -1, 1, 1)
            pix = page.get_pixmap(matrix=matrix, clip=path['rect']+border)
            pix.save(os.path.join(output_folder, f"page_{page.number}_vector_{i}.png"))
        
        # 刪除所有向量圖
        page.add_redact_annot(page.rect)
        page._apply_redactions(2,0,1)
        
        # 插入想保留的向量圖
        for path in paths[2:35]:
            shape : fitz.Shape = page.new_shape()
            draw2shape(path, shape)
            shape.commit()
        
        # 復原連結
        for link in links:
            page.insert_link(link)
    
    doc.save(os.path.join(output_folder, f"output.pdf"))
    doc.close()

# 範例用法
pdf_path = "input.pdf"
extract_pdf_content(pdf_path, "output")