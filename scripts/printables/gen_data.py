import json, random

random.seed(20261225)

WORDS = ["CHRISTMAS","SNOWFLAKE","GINGERBREAD","REINDEER","STOCKING","MISTLETOE",
         "SNOWMAN","CANDYCANE","SLEIGH","WREATH","CAROLS","JINGLE","TINSEL","HOLLY","STAR"]
SIZE = 15
DIRS = [(0,1),(1,0),(1,1),(0,-1),(-1,0),(-1,-1),(1,-1),(-1,1)]

def try_place(grid, word):
    for _ in range(400):
        d = random.choice(DIRS)
        r = random.randrange(SIZE); c = random.randrange(SIZE)
        er = r + d[0]*(len(word)-1); ec = c + d[1]*(len(word)-1)
        if not (0 <= er < SIZE and 0 <= ec < SIZE): continue
        ok = True
        for i,ch in enumerate(word):
            cell = grid[r+d[0]*i][c+d[1]*i]
            if cell not in ("", ch): ok = False; break
        if not ok: continue
        cells = []
        for i,ch in enumerate(word):
            grid[r+d[0]*i][c+d[1]*i] = ch
            cells.append([r+d[0]*i, c+d[1]*i])
        return cells
    return None

failed = True
for attempt in range(60):
    grid = [[""]*SIZE for _ in range(SIZE)]
    sol = {}
    failed = False
    for w in sorted(WORDS, key=len, reverse=True):
        cells = try_place(grid, w)
        if cells is None: failed = True; break
        sol[w] = cells
    if not failed: break
assert not failed, "word search generation failed"

fill = "ABCDEFGHIJKLMNOPRSTUVWY"
vowels = "AEIOU"
for r in range(SIZE):
    for c in range(SIZE):
        if grid[r][c] == "":
            grid[r][c] = random.choice(vowels) if random.random() < 0.32 else random.choice(fill)

POOL = [
 ("Santa","🎅"),("Mrs Claus","🤶"),("Elf","🧝"),("Reindeer","🦌"),("Snowman","⛄"),
 ("Christmas Tree","🎄"),("Star","⭐"),("Gift","🎁"),("Bell","🔔"),("Candle","🕯️"),
 ("Stocking","🧦"),("Snowflake","❄️"),("Candy Cane","🍬"),("Cookie","🍪"),("Hot Chocolate","☕"),
 ("Sleigh","🛷"),("Angel","👼"),("Ribbon","🎀"),("Carols","🎶"),("Fireplace","🔥"),
 ("Snow Globe","🔮"),("Penguin","🐧"),("Dove","🕊️"),("Church","⛪"),("Crown","👑"),
 ("Camel","🐪"),("Moon","🌙"),("Milk","🥛"),("Glowing Star","🌟"),("Present Sack","🎒"),
]
def make_card():
    picks = random.sample(POOL, 24)
    cells = picks[:12] + [("FREE","🎄")] + picks[12:]
    return [{"name": n, "emoji": e} for n, e in cells]

cards = []
seen = set()
while len(cards) < 10:
    card = make_card()
    key = tuple(c["name"] for c in card)
    if key in seen:
        continue
    seen.add(key)
    cards.append(card)
bingo = {"pool": [{"name": n, "emoji": e} for n, e in POOL], "cards": cards}

out = {"words": WORDS, "grid": grid, "solution": sol, "bingo": bingo}
with open("/tmp/print_data.json","w") as f:
    json.dump(out, f)
print("words placed:", len(sol), "| grid rows:", len(grid))
print("bingo cards:", len(bingo["cards"]), "| card A centre:", bingo["cards"][0][12], "| pool:", len(bingo["pool"]))
