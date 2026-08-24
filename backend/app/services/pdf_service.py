import io
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

def build_pdf_header(styles):
    header_data = [
        [
            Paragraph("<b>V.S.B. ENGINEERING COLLEGE</b><br/><font size=9>NH-67, Karur-Trichy Main Road, Kovai Road, Karur - 639 111, Tamil Nadu</font><br/><font size=8 color='#666666'>Approved by AICTE, New Delhi & Affiliated to Anna University | Accredited by NAAC & NBA</font><br/><i><font size=9 color='#1e3a8a'>Motto: \"HARDWORK IS THE KEY TO SUCCESS\"</font></i>", styles['CenterHeader'])
        ]
    ]
    t = Table(header_data, colWidths=[520])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def generate_student_profile_pdf(student_data: dict) -> bytes:
    buffer = io.BytesIO()
    if not HAS_REPORTLAB:
        # Fallback raw byte text generator if ReportLab library is missing
        text_content = f"V.S.B. ENGINEERING COLLEGE\nOFFICIAL STUDENT PROFILE REPORT\n\nName: {student_data.get('full_name')}\nReg No: {student_data.get('register_number')}\nDept: {student_data.get('department_name')}\nCGPA: {student_data.get('cgpa')}\nAttendance: {student_data.get('attendance_percentage')}%\n"
        buffer.write(text_content.encode('utf-8'))
        buffer.seek(0)
        return buffer.getvalue()

    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='CenterHeader',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        alignment=1,
        textColor=colors.HexColor('#1e3a8a')
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name='FieldValue',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    ))

    # Header
    story.append(build_pdf_header(styles))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e3a8a'), spaceAfter=15))

    # Title
    story.append(Paragraph(f"<b>PERMANENT STUDENT DIGITAL PROFILE — {student_data.get('register_number', 'N/A')}</b>", styles['SectionHeader']))
    story.append(Spacer(1, 8))

    # General & Demographic Table
    info_table_data = [
        [Paragraph("<b>Full Name:</b>", styles['FieldValue']), Paragraph(str(student_data.get('full_name', '-')), styles['FieldValue']), Paragraph("<b>Register No:</b>", styles['FieldValue']), Paragraph(str(student_data.get('register_number', '-')), styles['FieldValue'])],
        [Paragraph("<b>Admission No:</b>", styles['FieldValue']), Paragraph(str(student_data.get('admission_number', '-')), styles['FieldValue']), Paragraph("<b>Roll No:</b>", styles['FieldValue']), Paragraph(str(student_data.get('roll_number', '-')), styles['FieldValue'])],
        [Paragraph("<b>Department:</b>", styles['FieldValue']), Paragraph(str(student_data.get('department_name', '-')), styles['FieldValue']), Paragraph("<b>Batch / Year:</b>", styles['FieldValue']), Paragraph(f"{student_data.get('batch', '-')} (Year {student_data.get('current_year', 1)})", styles['FieldValue'])],
        [Paragraph("<b>DOB / Gender:</b>", styles['FieldValue']), Paragraph(f"{student_data.get('dob', '-')} ({student_data.get('gender', '-')})", styles['FieldValue']), Paragraph("<b>Blood Group:</b>", styles['FieldValue']), Paragraph(str(student_data.get('blood_group', '-')), styles['FieldValue'])],
        [Paragraph("<b>Phone / Email:</b>", styles['FieldValue']), Paragraph(f"{student_data.get('phone', '-')} | {student_data.get('email', '-')}", styles['FieldValue']), Paragraph("<b>Parents:</b>", styles['FieldValue']), Paragraph(f"Father: {student_data.get('father_name', '-')}<br/>Mother: {student_data.get('mother_name', '-')}", styles['FieldValue'])],
        [Paragraph("<b>Category:</b>", styles['FieldValue']), Paragraph(f"{'Hosteller' if student_data.get('hosteller') else 'Day Scholar'} ({student_data.get('bus_route', 'No Bus')})", styles['FieldValue']), Paragraph("<b>Scholarship:</b>", styles['FieldValue']), Paragraph(str(student_data.get('scholarship', 'None')), styles['FieldValue'])],
    ]

    t_info = Table(info_table_data, colWidths=[100, 160, 100, 160])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    # Academic & Performance Table
    story.append(Paragraph("<b>ACADEMIC PERFORMANCE SUMMARY</b>", styles['SectionHeader']))
    acad_data = [
        [Paragraph("<b>CGPA</b>", styles['FieldValue']), Paragraph("<b>SGPA</b>", styles['FieldValue']), Paragraph("<b>Attendance %</b>", styles['FieldValue']), Paragraph("<b>Credits Earned</b>", styles['FieldValue']), Paragraph("<b>Placement Status</b>", styles['FieldValue'])],
        [Paragraph(f"<b><font size=12 color='#1e3a8a'>{student_data.get('cgpa', 0.0)}</font></b>", styles['FieldValue']),
         Paragraph(f"<b><font size=12 color='#16a34a'>{student_data.get('sgpa', 0.0)}</font></b>", styles['FieldValue']),
         Paragraph(f"<b><font size=12 color='#d97706'>{student_data.get('attendance_percentage', 100.0)}%</font></b>", styles['FieldValue']),
         Paragraph(str(student_data.get('credits_earned', 0)), styles['FieldValue']),
         Paragraph(str(student_data.get('placement_status', 'Preparing')), styles['FieldValue'])],
    ]
    t_acad = Table(acad_data, colWidths=[100, 100, 100, 100, 120])
    t_acad.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_acad)
    story.append(Spacer(1, 25))

    # Footer signature
    sig_data = [
        [Paragraph("Report Generated On: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"), styles['FieldValue']), Paragraph("<b>Authorized Signatory</b><br/>V.S.B Engineering College", styles['FieldValue'])]
    ]
    t_sig = Table(sig_data, colWidths=[300, 220])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
    ]))
    story.append(t_sig)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
