"""
PDF Report Service — Phase 6

Generates a professional inspection report PDF using ReportLab.

Report structure:
  Page 1 — Inspection header (panel, date, GPS, status)
  Page 2 — RGB fault detection (annotated image + classification)
  Page 3 — Thermal analysis (metrics + severity gauge)
  Page 4 — Fusion decision + recommendation
"""
import io
import logging
from pathlib import Path
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


def generate_pdf(inspection) -> bytes:
    """
    Generate a PDF report for a completed inspection.

    Args:
        inspection: Inspection ORM object with .result populated

    Returns:
        PDF bytes
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, Image as RLImage, PageBreak
    )

    result = inspection.result
    panel  = inspection.panel
    buf    = io.BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2*cm
    )

    styles  = getSampleStyleSheet()
    W, H    = A4

    # ── Custom styles ────────────────────────────────────────────────────────
    title_style = ParagraphStyle("title", parent=styles["Title"],
        fontSize=20, textColor=colors.HexColor("#1a1a2e"), spaceAfter=6)
    h2_style = ParagraphStyle("h2", parent=styles["Heading2"],
        fontSize=13, textColor=colors.HexColor("#16213e"), spaceAfter=4)
    body = styles["BodyText"]
    body.fontSize = 10

    # Severity colours
    SEV_COLOUR = {"NONE": "#27ae60", "LOW": "#f39c12", "MEDIUM": "#e67e22", "HIGH": "#e74c3c"}
    sev_hex  = SEV_COLOUR.get(result.severity, "#95a5a6")

    elements = []

    # ── Page 1 — Header ──────────────────────────────────────────────────────
    elements.append(Paragraph("☀ SolarShield Inspection Report", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1a1a2e")))
    elements.append(Spacer(1, 0.4*cm))

    fault_label = result.fault_type.upper() if result.fault_type else "NONE"
    status_colour = colors.HexColor(sev_hex)

    header_data = [
        ["Panel ID",      inspection.panel_id,    "Farm",         panel.farm_id if panel else "—"],
        ["Inspection ID", inspection.id[:16] + "…","Date",        inspection.inspected_at.strftime("%d %b %Y %H:%M")],
        ["Status",        inspection.status.upper(),"GPS",        f"{float(panel.lat):.6f}, {float(panel.lng):.6f}" if panel else "—"],
        ["Fault Detected",str(result.fault_detected), "Fault Type", fault_label],
        ["Severity",      result.severity,         "Confidence",   f"{float(result.confidence)*100:.1f}%" if result.confidence else "—"],
    ]

    header_table = Table(header_data, colWidths=[3.5*cm, 6*cm, 3.5*cm, 4.5*cm])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#ecf0f1")),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("PADDING",    (0, 0), (-1, -1), 6),
        # Severity cell colour
        ("TEXTCOLOR",  (1, 3), (1, 3), colors.HexColor(sev_hex)),
        ("FONTNAME",   (1, 3), (1, 3), "Helvetica-Bold"),
    ]))
    elements.append(header_table)
    elements.append(PageBreak())

    # ── Page 2 — RGB Analysis ────────────────────────────────────────────────
    elements.append(Paragraph("RGB Fault Detection", h2_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#bdc3c7")))
    elements.append(Spacer(1, 0.3*cm))

    # Annotated image
    if result.annotated_image_path:
        img_path = Path(settings.image_storage_path) / result.annotated_image_path
        if img_path.exists():
            try:
                img = RLImage(str(img_path), width=14*cm, height=9*cm)
                elements.append(img)
            except Exception as e:
                logger.warning(f"Could not embed annotated image: {e}")
                elements.append(Paragraph(f"[Image unavailable: {e}]", body))
        else:
            elements.append(Paragraph("[Annotated image not found]", body))
    else:
        elements.append(Paragraph("[No annotated image available]", body))

    elements.append(Spacer(1, 0.4*cm))

    rgb_data = [
        ["Fault Type",      fault_label],
        ["Confidence",      f"{float(result.confidence)*100:.1f}%" if result.confidence else "—"],
        ["Detection Count", str(result.detection_count)],
    ]
    rgb_table = Table(rgb_data, colWidths=[5*cm, 8*cm])
    rgb_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    elements.append(rgb_table)
    elements.append(PageBreak())

    # ── Page 3 — Thermal Analysis ────────────────────────────────────────────
    elements.append(Paragraph("Thermal Analysis", h2_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#bdc3c7")))
    elements.append(Spacer(1, 0.3*cm))

    thermal_data = [
        ["Severity",        result.severity],
        ["Delta-T (°C)",    str(result.delta_t) if result.delta_t else "—"],
        ["Max Temp (°C)",   str(result.max_temp) if result.max_temp else "—"],
        ["Median Temp (°C)",str(result.median_temp) if result.median_temp else "—"],
        ["Hotspot Count",   str(result.hotspot_count)],
    ]
    thermal_table = Table(thermal_data, colWidths=[5*cm, 8*cm])
    thermal_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
        ("BACKGROUND", (1, 0), (1, 0), colors.HexColor(sev_hex)),
        ("TEXTCOLOR",  (1, 0), (1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME",   (1, 0), (1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    elements.append(thermal_table)
    elements.append(PageBreak())

    # ── Page 4 — Recommendation ──────────────────────────────────────────────
    elements.append(Paragraph("Fusion Decision & Recommendation", h2_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#bdc3c7")))
    elements.append(Spacer(1, 0.3*cm))

    recommendation = _get_recommendation(result.severity, result.fault_type)
    elements.append(Paragraph(f"<b>Recommendation:</b> {recommendation}", body))
    elements.append(Spacer(1, 0.5*cm))

    fusion_data = [
        ["Fault Detected",  "YES" if result.fault_detected else "NO"],
        ["Final Fault Type", fault_label],
        ["Final Severity",  result.severity],
        ["Action Required", recommendation],
        ["Report Generated", datetime.utcnow().strftime("%d %b %Y %H:%M UTC")],
    ]
    fusion_table = Table(fusion_data, colWidths=[5*cm, 12*cm])
    fusion_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("PADDING",    (0, 0), (-1, -1), 6),
        ("TEXTCOLOR",  (1, 0), (1, 0), colors.HexColor(sev_hex)),
        ("FONTNAME",   (1, 0), (1, 0), "Helvetica-Bold"),
    ]))
    elements.append(fusion_table)
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(
        "<i>Generated by SolarShield AI Inspection System. "
        "This report is auto-generated and should be reviewed by a qualified engineer "
        "before maintenance action is taken.</i>",
        ParagraphStyle("footer", parent=body, fontSize=8, textColor=colors.grey)
    ))

    doc.build(elements)
    return buf.getvalue()


def _get_recommendation(severity: str, fault_type: str | None) -> str:
    if severity == "HIGH":
        return "URGENT: Schedule maintenance within 24–48 hours. Risk of panel damage or fire."
    if severity == "MEDIUM":
        return "Schedule maintenance within 7 days. Fault is impacting energy output."
    if severity == "LOW":
        if fault_type in ("dirt", "shadow"):
            return "Clean panel surface at next scheduled maintenance. Minor efficiency loss."
        return "Monitor at next inspection. Low-severity fault detected."
    return "No action required. Panel is operating normally."
