import logging
from urllib.parse import urlparse
from docx import Document
from django.conf import settings
from texsnippets.models import TexSnippet
from docx.oxml.ns import qn
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH  # 居中
from docx.enum.section import WD_ORIENT  # 设置纸张 横纵向
from docx.shared import Inches  # 边距

logger = logging.getLogger(__name__)

# 全局变量设置 页面大小 边距 字体
# 字体
FONT_NAME_SONGTI = '宋体'
FONT_NAME_KAITI = '楷体'
FONT_SIZE_XS = 12  # 小四
FONT_SIZE_SH = 16  # 三号

# 行距
LINESPACINT = 1.5

# a3
PAGE_WIDTH = 29.7
PAGE_HEIGHT = 42

# 左右上下边距
LEFT_RIGHT_MARGIN = 3.18
TOP_BOTTOM_MARGIN = 2.54

def render_paragraph(document, block, data, prefix=''):
    p = document.add_paragraph(prefix)  # add_paragraph: 添加新段落
    p.paragraph_format.line_spacing = LINESPACINT  # 行距
    run = p.add_run()
    run.font.name = FONT_NAME_SONGTI
    run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME_SONGTI)
    run.font.size = Pt(FONT_SIZE_XS)
    run.bold = False
    text = block['text']

    offset = 0
    for entity in block['entityRanges']:
        # inline entity
        run.add_text(text[offset: entity['offset']])
        offset = entity['offset'] + entity['length']

        key = entity['key']
        entityObj = data['entityMap'][str(key)]
        if entityObj['type'] == 'IMG':
            run.add_picture(parse_image(entityObj['data']['src']))

        elif entityObj['type'] == 'TEX':
            img = TexSnippet.objects.get_img(entityObj['data']['content'])
            if img:
                run.add_picture(img)

    run.add_text(text[offset:])


def parse_image(url):
    src = urlparse(url)
    src = settings.BASE_DIR / src.path[1:]
    return str(src)


def render_draft(document, data):
    for block in data['blocks']:
        if block['type'] == 'atomic':
            key = block['entityRanges'][0]['key']
            entity = data['entityMap'][str(key)]

            if entity['type'] == 'IMG':
                src = urlparse(entity['data']['src'])
                src = settings.BASE_DIR / src.path[1:]
                try:
                    document.add_picture(str(src))
                except Exception as e:
                    print(e)

            elif entity['type'] == 'OPTION':
                document = render_draft(document, entity['data']['content'])
        else:
            document = render_block(document, block, data)

    return document



def render_atomic(document, block, data):
    key = block['entityRanges'][0]['key']
    entity = data['entityMap'][str(key)]

    if entity['type'] == 'IMG':
        src = urlparse(entity['data']['src'])
        src = settings.BASE_DIR / src.path[1:]
        try:
            document.add_picture(str(src))
        except Exception as e:
            print(e)

    elif entity['type'] == 'OPTION':
        document = render_draft(document, entity['data']['content'])

    return document


def render_block(document, block, data):
    """
    render one block
    """
    if block['type'] == 'header-one':
        # print(block['text'], '大标题')
        # 设置题目宋体，三号，加粗，行间距1.5倍，
        # document.add_heading(block['text'], 1)
        p = document.add_paragraph()
        run = p.add_run(block['text'])
        run.font.name = FONT_NAME_SONGTI
        run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME_SONGTI)
        run.font.bold = True
        run.font.size = Pt(FONT_SIZE_SH)  # 三号
        p.paragraph_format.line_spacing = LINESPACINT  # 行距
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 居中

    elif block['type'] == 'header-two':
        # 副标题 ：楷体三号
        # document.add_heading(block['text'], 2)
        p = document.add_paragraph()
        run = p.add_run(block['text'])
        run.font.name = FONT_NAME_KAITI
        run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME_KAITI)
        run.font.size = Pt(FONT_SIZE_SH)
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER

    elif block['type'] == 'header-three':
        # 题目的标题：宋体，小四，加粗，行间距：1.5倍
        # document.add_heading(block['text'], 3)
        p = document.add_paragraph()
        run = p.add_run(block['text'])
        run.font.name = FONT_NAME_SONGTI
        run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME_SONGTI)
        run.font.bold = True  # 加粗
        run.font.size = Pt(FONT_SIZE_XS)  # 小四-》12
        p.paragraph_format.line_spacing = LINESPACINT  # 行距

    elif block['type'] == 'unstyled':
        render_paragraph(document, block, data, '')

    return document


def export_docx(obj):
    """
    export draft.js to docx
    """
    document = Document('./template_docx/template.docx')
    data = obj.data
    if not data:
        res = settings.BASE_DIR / f'media/exports/{obj.title}.docx'
        document.save(res)
        return res

    index = 1
    for block in data['blocks']:
        if block['type'] == 'atomic':
            key = block['entityRanges'][0]['key']
            entity = data['entityMap'][str(key)]
            if entity['type'] == 'QUESTION':
                first_line = False
                try:
                    for line in entity['data']['data']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['data'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['data'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['data'], '')
                        else:
                            document = render_block(document, line, entity['data']['data'])
                except Exception as e:
                    logger.debug(e)
                index += 1
            else:
                document = render_atomic(document, block, data)

        else:
            document = render_block(document, block, data)

    res = settings.BASE_DIR / f'media/exports/{obj.title}.docx'

    # print(len(document.sections), 'num')
    section = document.sections[-1]
    # 设置纸张横向，A3
    # section.orientation = WD_ORIENT.LANDSCAPE  
    # section.page_width = Cm(PAGE_WIDTH)
    # section.page_height = Cm(PAGE_HEIGHT)
    # 页面左右边距：
    section.left_margin = Inches(LEFT_RIGHT_MARGIN)
    section.right_margin = Inches(LEFT_RIGHT_MARGIN)
    # 上下边距
    section.top_margin = Inches(TOP_BOTTOM_MARGIN)
    section.bottom_margin = Inches(TOP_BOTTOM_MARGIN)
    # 分栏, 分页，在初始模板中已设置
    # section._sectPr.xpath('./w:cols')[0].set(qn('w:num'),'2')
    document.save(res)
    return res


def export_docx_answer(obj):
    """
    export draft.js to answer docx
    """
    document = Document('./template_docx/template.docx')
    data = obj.data

    if not data:
        res = settings.BASE_DIR / f'media/exports/{obj.title}.docx'
        document.save(res)
        return res

    index = 1
    for block in data['blocks']:
        if block['type'] == 'atomic':
            key = block['entityRanges'][0]['key']  # 题目的特殊字符所占的位数， 
            entity = data['entityMap'][str(key)]
            if entity['type'] == 'QUESTION':
                first_line = False

                # 导出答案
                try:
                    for line in entity['data']['answer']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['answer'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['answer'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['answer'], '')
                        else:
                            document = render_block(document, line, entity['data']['answer'])
                except Exception as e:
                    logger.debug(e)
                    line = {'key': 'a6hb5', 'text': '{}'.format('答案：') + '略', 'type': 'unstyled', 
                    'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {}}
                    render_paragraph(document, line, entity['data']['explain'], '')

                # 导出解析
                try:
                    for line in entity['data']['explain']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['explain'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['explain'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['explain'], '')
                        else:
                            document = render_block(document, line, entity['data']['explain'])
                except Exception as e:
                    logger.debug(e)
                    line = {'key': 'a6hb5', 'text': '{}'.format('解析：') + '略', 'type': 'unstyled', 
                    'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {}}
                    render_paragraph(document, line, entity['data']['explain'], '')

                index += 1
            else:
                document = render_atomic(document, block, data)

        else:
            document = render_block(document, block, data)

    res = settings.BASE_DIR / 'media/exports/{}{}.docx'.format(obj.title, '_答案及解析')

    section = document.sections[-1]
    # 设置纸张横向，A3
    # section.orientation = WD_ORIENT.LANDSCAPE  
    # section.page_width = Cm(PAGE_WIDTH)
    # section.page_height = Cm(PAGE_HEIGHT)
    # 页面左右边距：
    section.left_margin = Inches(LEFT_RIGHT_MARGIN)
    section.right_margin = Inches(LEFT_RIGHT_MARGIN)
    # 上下边距
    section.top_margin = Inches(TOP_BOTTOM_MARGIN)
    section.bottom_margin = Inches(TOP_BOTTOM_MARGIN)

    document.save(res)
    return res


def export_all_docx_answer(obj):
    """
    export draft.js to all answer docx
    """
    document = Document('./template_docx/template.docx')
    data = obj.data

    if not data:
        res = settings.BASE_DIR / f'media/exports/{obj.title}.docx'
        document.save(res)
        return res

    index = 1
    for block in data['blocks']:
        if block['type'] == 'atomic':
            key = block['entityRanges'][0]['key']  # 题目的特殊字符所占的位数， 
            entity = data['entityMap'][str(key)]
            if entity['type'] == 'QUESTION':
                first_line = False

                # 导出题目
                try:
                    for line in entity['data']['data']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['data'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['data'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['data'], '')
                        else:
                            document = render_block(document, line, entity['data']['data'])
                except Exception as e:
                    logger.debug(e)
                # 导出答案
                try:
                    for line in entity['data']['answer']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['answer'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['answer'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['answer'], '')
                        else:
                            document = render_block(document, line, entity['data']['answer'])
                except Exception as e:
                    logger.debug(e)
                    line = {'key': 'a6hb5', 'text': '{}'.format('答案：') + '略', 'type': 'unstyled',
                    'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {}}
                    render_paragraph(document, line, entity['data']['explain'], '')

                # 导出解析
                try:
                    for line in entity['data']['explain']['blocks']:
                        if line['type'] == 'atomic':
                            document = render_atomic(document, line, entity['data']['explain'])
                        elif line['type'] == 'unstyled':
                            if not first_line:
                                render_paragraph(document, line, entity['data']['explain'], f'{index}. ')
                                first_line = True
                            else:
                                render_paragraph(document, line, entity['data']['explain'], '')
                        else:
                            document = render_block(document, line, entity['data']['explain'])
                except Exception as e:
                    logger.debug(e)
                    line = {'key': 'a6hb5', 'text': '{}'.format('解析：') + '略', 'type': 'unstyled',
                    'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {}}
                    render_paragraph(document, line, entity['data']['explain'], '')

                index += 1
            else:
                document = render_atomic(document, block, data)

        else:
            document = render_block(document, block, data)

    res = settings.BASE_DIR / 'media/exports/{}{}.docx'.format(obj.title, '试题_附答案及解析')

    section = document.sections[-1]
    # 设置纸张横向，A3
    # section.orientation = WD_ORIENT.LANDSCAPE  
    # section.page_width = Cm(PAGE_WIDTH)
    # section.page_height = Cm(PAGE_HEIGHT)
    # 页面左右边距：
    section.left_margin = Inches(LEFT_RIGHT_MARGIN)
    section.right_margin = Inches(LEFT_RIGHT_MARGIN)
    # 上下边距
    section.top_margin = Inches(TOP_BOTTOM_MARGIN)
    section.bottom_margin = Inches(TOP_BOTTOM_MARGIN)

    document.save(res)
    return res