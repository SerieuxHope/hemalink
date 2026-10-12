import os
import matplotlib.pyplot as plt
import numpy as np

os.makedirs('/Users/serieuxhope/Desktop/Code/hemalink/reports', exist_ok=True)

# 1. Chart: 6-Factor Donor Matching Weights
plt.figure(figsize=(7, 3.8), dpi=300)
labels = [
    'Proximity & Transit (35%)',
    'Schedule Availability (20%)',
    'Clinical Urgency (15%)',
    'Historical Reliability (10%)',
    'Fatigue Mitigation (10%)',
    'Facility Alignment (10%)'
]
sizes = [35, 20, 15, 10, 10, 10]
colors = ['#123047', '#2B6CB0', '#C53030', '#319795', '#D69E2E', '#718096']
explode = (0.05, 0.02, 0.02, 0, 0, 0)

wedges, texts, autotexts = plt.pie(
    sizes, 
    labels=labels, 
    autopct='%1.0f%%', 
    startangle=140, 
    colors=colors, 
    explode=explode,
    pctdistance=0.75,
    wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2)
)

for t in texts:
    t.set_fontsize(8.5)
    t.set_color('#2D3748')
    t.set_fontweight('bold')

for at in autotexts:
    at.set_fontsize(8)
    at.set_color('white')
    at.set_fontweight('bold')

plt.title('Explainable 6-Factor Deterministic Matching Algorithm', fontsize=11, fontweight='bold', color='#123047', pad=15)
plt.tight_layout()
chart1_path = '/Users/serieuxhope/Desktop/Code/hemalink/reports/chart_weights.png'
plt.savefig(chart1_path, dpi=300, bbox_inches='tight')
plt.close()

# 2. Chart: Comparative Metrics
plt.figure(figsize=(7, 3.5), dpi=300)
categories = ['Response Latency\n(Minutes)', 'Triage Time\n(Staff Mins/Case)', 'Broadcast Spam\n(Relative Index)', 'Long-Term Donor\nRetention (%)']
traditional = [110, 48, 100, 24]
bloodbridge = [14, 8, 9, 88]

x = np.arange(len(categories))
width = 0.35

fig, ax = plt.subplots(figsize=(7.2, 3.4), dpi=300)
rects1 = ax.bar(x - width/2, traditional, width, label='Traditional Broadcast (WhatsApp/Social)', color='#E53E3E', alpha=0.85)
rects2 = ax.bar(x + width/2, bloodbridge, width, label='BloodBridge Targeted Mobilization', color='#123047', alpha=0.95)

ax.set_ylabel('Performance Value', fontsize=9, fontweight='bold', color='#2D3748')
ax.set_ylim(0, 140)
ax.set_title('Operational Impact: Traditional Broadcast vs. BloodBridge Engine', fontsize=11, fontweight='bold', color='#123047', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(categories, fontsize=8.5, fontweight='bold', color='#2D3748')
ax.legend(loc='upper right', fontsize=8, frameon=True, facecolor='#F7FAFC')
ax.grid(axis='y', linestyle='--', alpha=0.4)

def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='bold', color='#2D3748')

autolabel(rects1)
autolabel(rects2)

plt.tight_layout()
chart2_path = '/Users/serieuxhope/Desktop/Code/hemalink/reports/chart_comparison.png'
plt.savefig(chart2_path, dpi=300, bbox_inches='tight')
plt.close()

print("Charts generated successfully!")
