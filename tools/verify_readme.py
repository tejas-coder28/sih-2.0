import re
import json
from pathlib import Path

readme_path = Path("README.md")
readme_text = readme_path.read_text(encoding="utf-8")

print("=== 1. VERIFYING LOCAL LINKS & IMAGES ===")
# Match markdown links: [text](link) and images: ![alt](link)
links = re.findall(r'!?\[.*?\]\((.*?)\)', readme_text)

broken_links = []
valid_links = []

for link in links:
    link = link.split('#')[0].strip()  # remove fragment
    if not link or link.startswith('http') or link.startswith('https') or link.startswith('mailto'):
        continue
    target = Path(link)
    if target.exists():
        valid_links.append(link)
    else:
        broken_links.append(link)

print(f"Total local targets checked: {len(valid_links) + len(broken_links)}")
print(f"Valid targets: {len(valid_links)}")
if broken_links:
    print(f"BROKEN TARGETS FOUND: {broken_links}")
else:
    print("ALL local links and image paths are VALID!")

print("\n=== 2. CROSS-CHECKING METRICS AGAINST evidence_pack/metrics.json ===")
with open("evidence_pack/metrics.json", "r", encoding="utf-8") as f:
    metrics = json.load(f)

# Extract key values from metrics.json
source_values = {
    "Tuning Seed": metrics["harness_metadata"]["tuning_set_seed"],
    "Test Seed": metrics["harness_metadata"]["test_set_seed"],
    "Held-Out Institutions": metrics["development_set_threshold_tuning"]["development_institutions_count"],
    "Documents in Dataset": metrics["development_set_threshold_tuning"]["development_documents_evaluated"],
    "Planted Positive Cases": metrics["anomaly_flag_detection"]["true_positives"] + metrics["anomaly_flag_detection"]["false_negatives"],
    "True Positives (TP)": metrics["anomaly_flag_detection"]["true_positives"],
    "False Positives (FP)": metrics["anomaly_flag_detection"]["false_positives"],
    "True Negatives (TN)": metrics["anomaly_flag_detection"]["true_negatives"],
    "False Negatives (FN)": metrics["anomaly_flag_detection"]["false_negatives"],
    "Precision": metrics["anomaly_flag_detection"]["precision"],
    "Recall": metrics["anomaly_flag_detection"]["recall"],
    "F1-Score": metrics["anomaly_flag_detection"]["f1_score"],
    "False-Positive Rate (%)": metrics["anomaly_flag_detection"]["false_positive_rate_percent"],
    "Macro F1": metrics["field_level_extraction"]["macro_f1_score"],
    "Micro F1": metrics["field_level_extraction"]["micro_f1_score"],
    "Processing Time (s)": metrics["processing_time_comparison"]["automated_seconds_per_application"],
    "Manual Baseline (min)": metrics["processing_time_comparison"]["manual_baseline_minutes"],
    "Alert Latency Mean (ms)": metrics["alert_latency"]["mean_latency_ms"],
    "Alert Latency Median (ms)": metrics["alert_latency"]["median_latency_ms"],
}

print(f"{'Metric':<30} | {'Source Value':<15} | {'Found in README':<15} | {'Status'}")
print("-" * 75)

all_match = True
for name, val in source_values.items():
    str_val = str(val)
    # Check if exact string exists in README
    found = str_val in readme_text
    status = "MATCH" if found else "MISMATCH"
    if not found:
        all_match = False
    print(f"{name:<30} | {str_val:<15} | {str(found):<15} | {status}")

print("-" * 75)
if all_match:
    print("ALL METRICS IN README PERFECTLY MATCH evidence_pack/metrics.json!")
else:
    print("WARNING: Some metrics did not match!")

