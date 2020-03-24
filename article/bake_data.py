import glob
import json

items = {}
code = []
for g in glob.glob("src/data/*.json"):

    n = g.split("/")[-1].split(".")[0]
    o = json.loads(open(g).read())
    items[n] = o

blob = json.dumps(items)    
code.append(f"var datasets={blob};")
    
print("\n".join(code))