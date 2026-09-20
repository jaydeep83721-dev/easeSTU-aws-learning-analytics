"""Review-first local extractor for aligned, calibrated scans. Never assigns grades."""
import argparse,json
import cv2,numpy as np,pypdfium2 as pdfium

def run(pdf_path,mapping_path,layout_path):
    mapping=json.load(open(mapping_path));sheets={s['id']:s for s in mapping['sheets']};layout=json.load(open(layout_path));doc=pdfium.PdfDocument(pdf_path);out=[];seen=set()
    for page_number in range(len(doc)):
        page=doc[page_number];gray=cv2.cvtColor(np.array(page.render(scale=2).to_pil().convert('RGB')),cv2.COLOR_RGB2GRAY)
        sheet_id,_,_=cv2.QRCodeDetector().detectAndDecode(gray)
        if sheet_id not in sheets or sheet_id in seen:
            out.append({'page':page_number+1,'status':'REVIEW_REQUIRED','reason':'Unknown, unreadable or duplicate QR'});page.close();continue
        seen.add(sheet_id);answers=[];flags=[];h,w=gray.shape
        for index,row in enumerate(layout['rows']):
            values=[]
            for x,y,r in row:
                xx,yy,rr=int(x*w),int(y*h),max(1,int(r*min(w,h)*.65));crop=gray[max(0,yy-rr):yy+rr,max(0,xx-rr):xx+rr];values.append(float(np.mean(crop<140)) if crop.size else 0)
            marked=[i for i,v in enumerate(values) if v>.45];answers.append(marked[0] if len(marked)==1 else None)
            if len(marked)!=1 or any(.18<v<=.45 for v in values):flags.append(index+1)
        out.append({'sheetId':sheet_id,'studentId':sheets[sheet_id]['studentId'],'testId':sheets[sheet_id]['testId'],'answers':answers,'reviewQuestions':flags,'status':'REVIEW_REQUIRED'});page.close()
    doc.close();return out
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('pdf');p.add_argument('mapping');p.add_argument('output');p.add_argument('--layout',required=True);a=p.parse_args()
    with open(a.output,'w') as f:json.dump(run(a.pdf,a.mapping,a.layout),f,indent=2)
