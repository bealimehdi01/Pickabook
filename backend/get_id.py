import replicate
import os
from dotenv import load_dotenv

load_dotenv()

candidates = [
    "wangfuyun/instantid",
    "instantx/instantid",
    "zsxkib/instant-id",
    "lucataco/instantid",
    "camenduru/instantid"
]

for name in candidates:
    try:
        model = replicate.models.get(name)
        versions = model.versions.list()
        if versions:
            print(f"FOUND: {name} -> {versions[0].id}")
            break
    except Exception as e:
        print(f"FAILED: {name} ({e})")
