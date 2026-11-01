# -*- coding: utf-8 -*-
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dict_part1 import PART1
from dict_part2 import PART2
from dict_part3 import PART3
from dict_part4 import PART4

MASTER = {}
MASTER.update(PART1)
MASTER.update(PART2)
MASTER.update(PART3)
MASTER.update(PART4)

EXPECTED_SECTIONS = [
    'common', 'nav', 'statuses', 'awards', 'auth', 'public',
    'dashboard', 'teacher', 'jury', 'admin', 'validation', 'errors', 'checkout'
]

actual_sections = list(MASTER.keys())
print(f"Total sections loaded: {len(actual_sections)}")
for s in EXPECTED_SECTIONS:
    assert s in MASTER, f"Missing section: {s}"

def extract_lang(node, lang):
    if isinstance(node, dict):
        if 'ru' in node and 'en' in node and len(node) == 2:
            val = node[lang]
            assert isinstance(val, str), f"Expected string, got {type(val)}: {val}"
            assert len(val.strip()) > 0, f"Empty string found for lang {lang}: {node}"
            return val
        return {k: extract_lang(v, lang) for k, v in node.items()}
    raise ValueError(f"Unexpected node: {node}")

ru_dict = extract_lang(MASTER, 'ru')
en_dict = extract_lang(MASTER, 'en')

def compare_keys(a, b, path=""):
    assert isinstance(a, dict) and isinstance(b, dict), f"Type mismatch at {path}"
    a_keys = set(a.keys())
    b_keys = set(b.keys())
    
    missing_in_b = a_keys - b_keys
    missing_in_a = b_keys - a_keys
    
    assert not missing_in_b, f"Keys in RU but missing in EN at {path}: {missing_in_b}"
    assert not missing_in_a, f"Keys in EN but missing in RU at {path}: {missing_in_a}"
    
    for k in a_keys:
        curr_path = f"{path}.{k}" if path else k
        if isinstance(a[k], dict):
            compare_keys(a[k], b[k], curr_path)

compare_keys(ru_dict, en_dict)
print("Parity verification: 100% MATCH between RU and EN across all 13 sections!")

def count_keys(d):
    cnt = 0
    for k, v in d.items():
        if isinstance(v, dict):
            cnt += count_keys(v)
        else:
            cnt += 1
    return cnt

total_ru_keys = count_keys(ru_dict)
total_en_keys = count_keys(en_dict)
print(f"Total leaf string keys per locale: {total_ru_keys} (RU) / {total_en_keys} (EN)")

# Now generate formatted TypeScript
def serialize_ts(obj, indent=2):
    sp = " " * indent
    if isinstance(obj, dict):
        lines = ["{\n"]
        for k, v in obj.items():
            lines.append(f"{sp}  {json.dumps(k)}: {serialize_ts(v, indent + 2)},\n")
        lines.append(f"{sp}}}")
        return "".join(lines)
    elif isinstance(obj, str):
        return json.dumps(obj, ensure_ascii=False)
    else:
        return json.dumps(obj)

target_file = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "lib", "i18n", "dictionaries.ts"))

ts_content = f"""export type Locale = 'ru' | 'en';

export const dictionaries = {{
  ru: {serialize_ts(ru_dict, 2)},
  en: {serialize_ts(en_dict, 2)},
}};

export type Dictionary = typeof dictionaries.ru;
"""

with open(target_file, "w", encoding="utf-8") as f:
    f.write(ts_content)

file_size = os.path.getsize(target_file)
print(f"Successfully generated {target_file} ({file_size} bytes)")
