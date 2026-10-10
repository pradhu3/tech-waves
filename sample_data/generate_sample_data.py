"""
Generates synthetic Google Ads search query CSV files for testing and demonstrations.
Can generate small sample files or large files with 25,000+ rows.
"""

import sys
import os
import random
import pandas as pd

def generate_dataset(num_rows=1000, output_path='sample_search_terms.csv'):
    campaigns = [
        ("B2B SaaS Solutions", ["CRM Enterprise", "Lead Automation", "Workflow API", "Analytics Core"]),
        ("Enterprise ERP", ["Cloud Implementation", "Logistics Automation", "Supply Chain", "Billing"]),
        ("Performance Shoes", ["Running Men", "Running Women", "Trail & Outdoor", "Track Cleats"]),
        ("Legal Practice Services", ["Corporate Law", "IP & Patents", "Contract Review", "Compliance"])
    ]

    commercial_roots = [
        "best {topic} platform", "top {topic} software pricing", "enterprise {topic} quote",
        "buy {topic} online demo", "{topic} tool demo for business", "{topic} vendors comparison"
    ]

    negative_roots = [
        "free download full cracked {topic}", "{topic} software engineer jobs salary",
        "{topic} open source torrent pirate bay", "how to build your own {topic} tutorial pdf",
        "{topic} internships reddit entry level", "{topic} nulled script download"
    ]

    ambiguous_roots = [
        "{topic}", "{topic} vs spreadsheets", "what is {topic}", "{topic} examples and definition"
    ]

    topics = ["crm", "erp", "inventory", "sales automation", "running shoes", "patent filing", "billing software"]

    data = []
    start_date = pd.to_datetime('2026-03-01')

    for i in range(num_rows):
        camp_tuple = random.choice(campaigns)
        camp_name = camp_tuple[0]
        ad_group = random.choice(camp_tuple[1])
        topic = random.choice(topics)

        # 35% commercial, 25% negative, 25% neutral/low volume, 15% ambiguous
        rand_category = random.random()
        if rand_category < 0.35:
            # High performer or commercial intent
            query = random.choice(commercial_roots).format(topic=topic)
            match_type = random.choice(["Exact", "Phrase", "Broad"])
            impr = random.randint(300, 3000)
            clicks = random.randint(15, 120)
            cpc = random.uniform(2.5, 6.0)
            cost = round(clicks * cpc, 2)
            conv = random.randint(2, 12)
            conv_val = round(conv * random.uniform(250, 800), 2)
        elif rand_category < 0.60:
            # Negative / Irrelevant intent
            query = random.choice(negative_roots).format(topic=topic)
            match_type = "Broad"
            impr = random.randint(400, 4000)
            clicks = random.randint(15, 150)
            cpc = random.uniform(1.2, 4.0)
            cost = round(clicks * cpc, 2)
            conv = 0.0
            conv_val = 0.0
        elif rand_category < 0.85:
            # Low volume / neutral noise
            query = f"{topic} screenshots {random.randint(1, 99)}"
            match_type = "Phrase"
            impr = random.randint(20, 150)
            clicks = random.randint(1, 6)
            cpc = random.uniform(0.8, 2.0)
            cost = round(clicks * cpc, 2)
            conv = 0.0
            conv_val = 0.0
        else:
            # Ambiguous or 1-conversion fluke (Critical uncertainty test)
            if random.random() < 0.5:
                # 2 clicks 1 conv fluke
                query = f"discount code for {topic}"
                match_type = "Broad"
                impr = random.randint(10, 35)
                clicks = random.randint(2, 3)
                cost = round(clicks * random.uniform(3.0, 5.0), 2)
                conv = 1.0
                conv_val = 150.0
            else:
                query = random.choice(ambiguous_roots).format(topic=topic)
                match_type = "Broad"
                impr = random.randint(800, 3500)
                clicks = random.randint(20, 80)
                cost = round(clicks * random.uniform(2.0, 4.5), 2)
                conv = 0.0
                conv_val = 0.0

        date_val = (start_date + pd.Timedelta(days=(i % 30))).strftime('%Y-%m-%d')

        data.append({
            'Search term': query,
            'Match type': match_type,
            'Campaign': camp_name,
            'Ad group': ad_group,
            'Impressions': impr,
            'Clicks': clicks,
            'Cost': cost,
            'Conversions': conv,
            'Conv. value': conv_val,
            'Date': date_val
        })

    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated {num_rows} records at: {output_path}")

if __name__ == '__main__':
    rows = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'sample_search_terms.csv')
    generate_dataset(rows, out)
