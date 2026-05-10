#!/usr/bin/env python3
"""Merge à la carte from public/menu.json with PDF-extracted menus. Run from repo root."""

from __future__ import annotations

import json
from pathlib import Path


def dietary_from(text: str) -> list[str]:
    t = text.upper()
    out: list[str] = []
    if "[VG]" in t:
        out.append("vegan")
    elif "[V]" in t:
        out.append("vegetarian")
    if "[GF]" in t:
        out.append("gluten-free")
    return out


def clip_name(title: str) -> str:
    return title.split("[")[0].strip()


def item(cid: str, nid: str, raw: str, price: int | None = None, desc: str | None = None) -> dict:
    name = clip_name(raw)
    d: dict = {"id": nid, "name": name, "categoryId": cid}
    tags = dietary_from(raw)
    if tags:
        d["dietaryTags"] = tags
    if price is not None:
        d["priceCents"] = price
    if desc:
        d["description"] = desc
    return d


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    base_path = root / "public" / "menu.json"
    base = json.loads(base_path.read_text(encoding="utf-8"))

    alc_cats = [c for c in base["categories"] if c.get("menuId") == "a-la-carte"]
    alc_ids = {c["id"] for c in alc_cats}
    alc_items = [i for i in base["items"] if i["categoryId"] in alc_ids]
    menus = base["menus"]

    gb_cats = [
        {"id": "gb-silk-road-feast", "menuId": "group-banquets", "label": "Silk Road Feast · shared", "order": 0},
        {"id": "gb-plant-silk-road", "menuId": "group-banquets", "label": "Plant Silk Road · individual", "order": 1},
        {"id": "gb-babylonian", "menuId": "group-banquets", "label": "Babylonian Banquet · shared", "order": 2},
        {"id": "gb-power-lunch", "menuId": "group-banquets", "label": "Power Lunch · £45 (12–5pm)", "order": 3},
        {"id": "gb-canapes-7", "menuId": "group-banquets", "label": "Canapés & bowls · £7", "order": 4},
        {"id": "gb-canapes-4", "menuId": "group-banquets", "label": "Canapés · £4", "order": 5},
    ]

    gb_items: list[dict] = []
    pairs = [
        ("gb-silk-road-feast", "gb-srf-edamame", "Steamed Edamame, Sea Salt [VG][V][GF]"),
        ("gb-silk-road-feast", "gb-srf-prawn-crackers", "Prawn Crackers with Fresh Tomato Salsa"),
        ("gb-silk-road-feast", "gb-srf-squid", "Crispy Squid with Salt 'n Pepper, Chilli & Garlic [GF]"),
        ("gb-silk-road-feast", "gb-srf-siu-mai", "Chicken Siu Mai"),
        ("gb-silk-road-feast", "gb-srf-sesame-prawn", "Sesame Prawn Spring Rolls"),
        ("gb-silk-road-feast", "gb-srf-salmon-maki", "Salmon & Avocado Sushi Rolls [GF without soy]"),
        ("gb-silk-road-feast", "gb-srf-duck-salad", "Crispy Duck & Watermelon Salad, Cashew Nuts"),
        ("gb-silk-road-feast", "gb-srf-mekong-chicken", "Mekong Lemongrass Chicken [GF]"),
        ("gb-silk-road-feast", "gb-srf-seabass", "Baked Seabass Fillet with Basil [GF]"),
        ("gb-silk-road-feast", "gb-srf-rendang", "Beef Rendang with Roti [GF]"),
        ("gb-silk-road-feast", "gb-srf-rice", "Steamed Jasmine Rice [VG][V][GF]"),
        ("gb-silk-road-feast", "gb-srf-greens", "Asian Greens [VG][V]"),
        (
            "gb-silk-road-feast",
            "gb-srf-dessert",
            "Chef's Dessert Selection",
            None,
            "Vegan, dairy-free and gluten-free options on request.",
        ),
    ]
    for row in pairs:
        cid, nid, raw = row[:3]
        price = row[3] if len(row) > 3 else None
        desc = row[4] if len(row) > 4 else None
        gb_items.append(item(cid, nid, raw, price, desc))

    for row in [
        ("gb-plant-silk-road", "gb-psr-edamame", "Steamed Edamame, Sea Salt or Spicy [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-veg-roll", "Vegetable Spring Roll [V]"),
        ("gb-plant-silk-road", "gb-psr-veg-dumpling", "Vegetable Dumplings [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-wakame", "Wakame and Cucumber Salad [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-asparagus-skewer", "Asparagus Yusu Miso Skewer [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-tofu-curry", "Malaysian Tofu & Vegetable Curry [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-aubergine", "Aubergine Miso [V][VG][GF]"),
        ("gb-plant-silk-road", "gb-psr-fried-rice", "Cauliflower & Asparagus Fried Rice [V][VG]"),
        ("gb-plant-silk-road", "gb-psr-greens", "Asian Greens [V][VG]"),
        (
            "gb-plant-silk-road",
            "gb-psr-dessert",
            "Chef's Dessert Selection",
            None,
            "Vegan, dairy-free and gluten-free options on request.",
        ),
    ]:
        cid, nid, raw = row[:3]
        price = row[3] if len(row) > 3 else None
        desc = row[4] if len(row) > 4 else None
        gb_items.append(item(cid, nid, raw, price, desc))

    for row in [
        ("gb-babylonian", "gb-bab-edamame", "Steamed Edamame, Sea Salt [VG][V]"),
        ("gb-babylonian", "gb-bab-crackers", "Prawn Crackers with Fresh Tomato Salsa"),
        ("gb-babylonian", "gb-bab-popcorn-shrimp", "Popcorn Shrimp in Miso Chipotle Mayo"),
        ("gb-babylonian", "gb-bab-wagyu-taco", "Wagyu Taco with Pineapple Salsa"),
        ("gb-babylonian", "gb-bab-yellowtail", "Yellowtail Jalapeno"),
        (
            "gb-babylonian",
            "gb-bab-dimsum",
            "Dim Sum Basket Selection",
            None,
            "Ask your server for allergens when booking.",
        ),
        ("gb-babylonian", "gb-bab-seabass", "Miso Chilean Seabass [GF]"),
        ("gb-babylonian", "gb-bab-shaking-beef", "Shaking Beef"),
        ("gb-babylonian", "gb-bab-yuzu-chicken", "Yuzu Baby Chicken"),
        ("gb-babylonian", "gb-bab-rice", "Steamed Jasmine Rice [VG][V][GF]"),
        ("gb-babylonian", "gb-bab-greens", "Asian Greens [VG][V]"),
        (
            "gb-babylonian",
            "gb-bab-dessert",
            "Chef's Dessert Selection",
            None,
            "Vegan, dairy-free and gluten-free options on request.",
        ),
    ]:
        cid, nid, raw = row[:3]
        price = row[3] if len(row) > 3 else None
        desc = row[4] if len(row) > 4 else None
        gb_items.append(item(cid, nid, raw, price, desc))

    for row in [
        ("gb-power-lunch", "gb-pl-edamame", "Steamed Edamame, Sea Salt [VG][V]"),
        ("gb-power-lunch", "gb-pl-kimchi", "Kimchi Cabbage Salad [V]"),
        ("gb-power-lunch", "gb-pl-squid", "Crispy Squid with Salt 'n Pepper, Chilli & Garlic [GF]"),
        ("gb-power-lunch", "gb-pl-duck-rolls", "Crispy Duck Spring Rolls"),
        ("gb-power-lunch", "gb-pl-salmon-maki", "Salmon & Avocado Sushi Rolls [GF without Soy]"),
        ("gb-power-lunch", "gb-pl-mekong", "Mekong Lemongrass Chicken [GF]"),
        ("gb-power-lunch", "gb-pl-rendang", "Beef Rendang with Roti [GF]"),
        ("gb-power-lunch", "gb-pl-rice", "Steamed Jasmine Rice [VG][V][GF]"),
        ("gb-power-lunch", "gb-pl-greens", "Asian Greens [VG][V]"),
        (
            "gb-power-lunch",
            "gb-pl-dessert",
            "Chef's Dessert Selection",
            None,
            "Vegan, dairy-free and gluten-free options on request.",
        ),
        ("gb-power-lunch", "gb-pl-tea-coffee", "Tea & coffee included", None, "Included with Power Lunch."),
    ]:
        cid, nid, raw = row[:3]
        price = row[3] if len(row) > 3 else None
        desc = row[4] if len(row) > 4 else None
        gb_items.append(item(cid, nid, raw, price, desc))

    c7_data = [
        ("gb-c7-crackers", "Asian Crackers [GF]", 700, "£5 per portion on PDF — listed under £7 canapés."),
        ("gb-c7-squid", "Crispy Squid with Salt 'n Pepper [GF]", 700),
        ("gb-c7-duck-watermelon", "Duck & Watermelon with Cashew Nuts", 700),
        ("gb-c7-edamame", "Edamame with Chilli Garlic or Truffle Salt [V][VG][GF]", 700),
        ("gb-c7-kimchi", "Kimchi Cabbage Salad [V]", 700),
        ("gb-c7-tofu", "Asian Chilli Silken Tofu [V][VG]", 700),
        ("gb-c7-singapore", "Singapore Noodles", 700),
        ("gb-c7-gilgamesh-rice", "Gilgamesh Rice (Prawn, Crab)", 700),
        ("gb-c7-egg-rice", "Egg Fried Rice [V][GF]", 700),
        ("gb-c7-malaysian-chicken", "Malaysian Curry with Chicken & Vegetables and Rice [GF]", 700),
        ("gb-c7-wakame", "Wakame & Cucumber Salad [V][VG]", 700),
        ("gb-c7-cauli-rice", "Asparagus & Cauliflower Fried Rice [V][VG]", 700),
        ("gb-c7-malaysian-tofu", "Malaysian Curry with Tofu & Vegetables with Rice [V][VG][GF]", 700),
        ("gb-c7-rendang", "Beef Rendang with Roti [GF]", 700),
        ("gb-c7-bulgogi", "Ribeye Bulgogi with Chive Mash", 700, "£10 per portion supplement on PDF."),
        ("gb-c7-seabass", "Miso Chilean Seabass [GF]", 700, "£15 per portion supplement on PDF."),
    ]
    for row in c7_data:
        desc = row[3] if len(row) > 3 else None
        nid, raw, price = row[0], row[1], row[2]
        gb_items.append(item("gb-canapes-7", nid, raw, price, desc))

    c4_data = [
        ("gb-c4-edamame", "Edamame [V][VG][GF]", 400),
        ("gb-c4-sesame-prawn", "Sesame Prawn Spring Rolls", 400),
        ("gb-c4-tuna-tartar", "Tuna Tartar, Crispy Rice Bites [GF]", 400),
        ("gb-c4-wings", "Grilled Chicken Wings with Sesame Seeds", 400),
        ("gb-c4-hargau", "King Prawn Har Gau Dumpling", 400),
        ("gb-c4-veg-dumpling", "Vegetable Dumpling [V][VG][GF]", 400),
        ("gb-c4-wagyu-taco", "Wagyu Taco with Pineapple Salsa", 400),
        ("gb-c4-duck-rolls", "Crispy Duck Spring Rolls", 400),
        ("gb-c4-siu-mai", "Chicken Siu Mai", 400),
        ("gb-c4-veg-roll", "Vegetable Spring Rolls [V]", 400),
        ("gb-c4-avo-roll", "Avocado Sushi Rolls [V][VG][GF without Soy]", 400),
        ("gb-c4-veg-maki", "Vegetable Sushi Maki Rolls [V][VG][GF without Soy]", 400),
        ("gb-c4-california", "Californian Inside Out Sushi Rolls [GF without Soy]", 400),
        ("gb-c4-salmon-avo", "Salmon Avocado Sushi Rolls [GF without Soy]", 400),
    ]
    for nid, raw, price in c4_data:
        gb_items.append(item("gb-canapes-4", nid, raw, price))

    bb_cats = [
        {"id": "bb-starters", "menuId": "bottomless-brunch", "label": "Starters to share", "order": 0},
        {"id": "bb-mains", "menuId": "bottomless-brunch", "label": "Mains · one each", "order": 1},
        {"id": "bb-flow", "menuId": "bottomless-brunch", "label": "90 min free-flow drinks", "order": 2},
        {"id": "bb-upgrade", "menuId": "bottomless-brunch", "label": "Upgrades", "order": 3},
    ]
    bb_items = [
        {"id": "bb-price", "name": "Bottomless brunch", "categoryId": "bb-starters", "priceCents": 6000, "description": "£60 per person + 15% service · 90 min drink window (PDF)."},
        {"id": "bb-edamame", "name": "Edamame with Sea Salt", "categoryId": "bb-starters"},
        {"id": "bb-salmon-maki", "name": "Salmon Sushi Maki Roll", "categoryId": "bb-starters"},
        {"id": "bb-cucumber-maki", "name": "Cucumber Sushi Maki Roll", "categoryId": "bb-starters"},
        {"id": "bb-veg-spring", "name": "Vegetable Spring Rolls", "categoryId": "bb-starters"},
        {"id": "bb-karaage", "name": "Chicken Karaage", "categoryId": "bb-starters"},
        {"id": "bb-korroke", "name": "Sweet Potato Korroke", "categoryId": "bb-starters"},
        {"id": "bb-miso-aubergine", "name": "Miso Aubergine", "categoryId": "bb-mains", "dietaryTags": ["vegetarian"]},
        {"id": "bb-thai-green-chicken", "name": "Thai Green Chicken Curry with Jasmine Rice", "categoryId": "bb-mains"},
        {"id": "bb-rendang", "name": "Beef Rendang with Roti", "categoryId": "bb-mains"},
        {"id": "bb-prawn-katsu", "name": "Prawn Katsu with Jasmine Rice", "categoryId": "bb-mains"},
        {"id": "bb-singapore-noodles", "name": "Singapore Noodles with Vegetables", "categoryId": "bb-mains", "dietaryTags": ["vegetarian"]},
        {
            "id": "bb-salmon-teriyaki",
            "name": "Grilled Salmon Teriyaki",
            "categoryId": "bb-mains",
            "priceCents": 1000,
            "description": "+£10 supplement (PDF).",
        },
        {"id": "bb-dessert-note", "name": "Desserts", "categoryId": "bb-mains", "description": "Selection served à la carte — ask server (PDF)."},
        {"id": "bb-flow-prosecco", "name": "Prosecco · free-flow", "categoryId": "bb-flow"},
        {"id": "bb-flow-white", "name": "House white wine · free-flow", "categoryId": "bb-flow"},
        {"id": "bb-flow-red", "name": "House red wine · free-flow", "categoryId": "bb-flow"},
        {"id": "bb-flow-rose", "name": "House rosé · free-flow", "categoryId": "bb-flow"},
        {
            "id": "bb-upgrade-premium",
            "name": "Premium cocktail upgrade",
            "categoryId": "bb-upgrade",
            "priceCents": 2000,
            "description": "£20 pp · Bellinis, Pornstar Martinis, Ziggurats (PDF).",
        },
    ]

    el_cats = [
        {"id": "el-starters", "menuId": "express-lunch", "label": "Starters · choose 1", "order": 0},
        {"id": "el-mains", "menuId": "express-lunch", "label": "Mains · choose 1", "order": 1},
        {"id": "el-desserts", "menuId": "express-lunch", "label": "Desserts · choose 1", "order": 2},
    ]
    el_items = [
        {"id": "el-bundle", "name": "Express lunch · 3 courses", "categoryId": "el-starters", "priceCents": 2000, "description": "£20 · VAT incl.; +15% service (PDF). Daily to 5pm."},
        {"id": "el-veg-roll", "name": "Vegetable Spring Roll", "categoryId": "el-starters", "dietaryTags": ["vegetarian"]},
        {"id": "el-prawn-mango", "name": "Prawn and Mango Spring Roll", "categoryId": "el-starters"},
        {"id": "el-avo-tempura", "name": "Avocado & Sweet Potato Tempura", "categoryId": "el-starters", "dietaryTags": ["vegetarian"]},
        {"id": "el-siu-mai", "name": "Chicken Siu Mai", "categoryId": "el-starters"},
        {"id": "el-prawn-chive", "name": "Prawn & Chive Dumplings", "categoryId": "el-starters", "dietaryTags": ["gluten-free"]},
        {
            "id": "el-squid",
            "name": "Crispy Squid with Sea Salt, Chilli & Garlic",
            "categoryId": "el-starters",
            "priceCents": 500,
            "description": "+£5 supplement · GF (PDF).",
            "dietaryTags": ["gluten-free"],
        },
        {"id": "el-veg-sushi", "name": "Vegetarian Sushi Maki Roll", "categoryId": "el-starters", "dietaryTags": ["vegan", "gluten-free"]},
        {
            "id": "el-duck-salad",
            "name": "Crispy Duck, Watermelon & Cashew Nut Salad",
            "categoryId": "el-starters",
            "priceCents": 500,
            "description": "+£5 supplement (PDF).",
        },
        {"id": "el-thai-chicken", "name": "Thai Green Chicken Curry", "categoryId": "el-mains", "dietaryTags": ["gluten-free"]},
        {"id": "el-thai-veg", "name": "Thai Green Vegetable Curry", "categoryId": "el-mains", "dietaryTags": ["vegan", "gluten-free"]},
        {"id": "el-rendang", "name": "Beef Rendang with Roti", "categoryId": "el-mains", "dietaryTags": ["gluten-free"]},
        {"id": "el-aubergine", "name": "Aubergine Miso", "categoryId": "el-mains", "dietaryTags": ["vegan", "gluten-free"]},
        {
            "id": "el-seabass",
            "name": "Baked Sea Bass with Basil",
            "categoryId": "el-mains",
            "priceCents": 800,
            "description": "+£8 supplement (PDF).",
        },
        {"id": "el-rice", "name": "Steamed jasmine rice", "categoryId": "el-mains", "description": "Served with mains (PDF)."},
        {"id": "el-cheesecake", "name": "Cheesecake of the Day", "categoryId": "el-desserts", "description": "Ask server for flavour."},
        {"id": "el-fruit", "name": "Exotic Fruit Platter", "categoryId": "el-desserts", "dietaryTags": ["vegan", "gluten-free"]},
    ]

    gh_cats = [
        {"id": "gh-cocktails", "menuId": "golden-hour", "label": "2-for-1 cocktails · 3–6pm", "order": 0},
        {"id": "gh-mocktails", "menuId": "golden-hour", "label": "Mocktails", "order": 1},
        {"id": "gh-wine-beer", "menuId": "golden-hour", "label": "Wine & beer", "order": 2},
    ]

    def gbp(cid: str, nid: str, name: str, gbp_: float, desc: str | None = None) -> dict:
        d = {"id": nid, "name": name, "categoryId": cid, "priceCents": int(round(gbp_ * 100))}
        if desc:
            d["description"] = desc
        return d

    gh_items = [
        gbp("gh-cocktails", "gh-ziggurat", "Ziggurat", 15, "Olmeca Altos Plata Tequila, Cointreau, Watermelon, Lime, Chilli"),
        gbp("gh-cocktails", "gh-assyria", "Assyria", 17, "Beluga Vodka, Midori Liqueur, Pineapple, Raspberry"),
        gbp("gh-cocktails", "gh-aruru", "Aruru", 15, "Bumbu Rum, Briottet Pamplemouse Rose, Mango & Passion"),
        gbp("gh-cocktails", "gh-uruk", "Uruk", 15, "Malfy Rosa Gin, Briottet Lychee, YuzuShu, Lime Juice"),
        gbp("gh-cocktails", "gh-margarita", "Margarita", 15, "Olmeca Altos Plata Tequila, Cointreau, Lime Juice"),
        gbp("gh-cocktails", "gh-picante", "Picante", 15, "Olmeca Altos Plata Tequila, Red Chilli, Pineapple, Lime Juice"),
        gbp("gh-cocktails", "gh-old-fashioned", "Old Fashioned", 16, "Wild Turkey 101, Sugar, Angostura bitters"),
        gbp("gh-cocktails", "gh-watermelon-martini", "Watermelon Martini", 15, "42 Below Vodka, watermelon liqueur, lime, watermelon juice"),
        gbp("gh-cocktails", "gh-mai-tai", "Mai Tai", 15, "Appleton Estate Rum, Cointreau, Almond Syrup, Lime Juice"),
        gbp("gh-cocktails", "gh-negroni", "Negroni", 15, "Bombay Sapphire Gin, Campari, Antica Formula Vermouth"),
        gbp("gh-mocktails", "gh-tigris", "Tigris", 8, "Pineapple Juice, Passionfruit Purée, Mango Syrup"),
        gbp("gh-mocktails", "gh-euphrates", "Euphrates", 8, "Lychee, Lemon Juice, Mango Syrup, Cordino Aperitivo"),
        gbp("gh-mocktails", "gh-tammuz", "Tammuz", 8, "Apple, Lemon Juice, Peach Syrup, Peach & Jasmine Soda"),
        gbp("gh-wine-beer", "gh-prosecco", "House prosecco · 125ml", 9.5, "Santa Eleni Prosecco, Italy"),
        gbp("gh-wine-beer", "gh-white", "House white · 175ml", 10, "2022 Sauvignon Blanc, Voramar Macabeo, Spain"),
        gbp("gh-wine-beer", "gh-red", "House red · 175ml", 9, "2022 Voramar Bobal, Tempranillo, Spain"),
        gbp("gh-wine-beer", "gh-rose", "House rosé · 175ml", 10, "2022 Chemin De Provence Rosé, France"),
        gbp("gh-wine-beer", "gh-singha", "Singha beer", 6),
    ]

    ds_cats = [
        {"id": "ds-desserts", "menuId": "dessert", "label": "Desserts", "order": 0},
        {"id": "ds-coffee", "menuId": "dessert", "label": "Coffee", "order": 1},
        {"id": "ds-tea", "menuId": "dessert", "label": "Tea", "order": 2},
        {"id": "ds-dessert-cocktails", "menuId": "dessert", "label": "Dessert cocktails · £15", "order": 3},
        {"id": "ds-nightcap", "menuId": "dessert", "label": "Nightcaps", "order": 4},
    ]
    ds_items = [
        gbp("ds-desserts", "ds-triple-choc", "Deluxe Triple Chocolate Fondant", 15, "Vanilla ice cream"),
        gbp("ds-desserts", "ds-velvet-sponge", "Velvet Chocolate Sponge", 15, "Pistachio ice cream"),
        gbp("ds-desserts", "ds-biscoff", "Golden Caramel Biscoff", 15, "Vanilla ice cream"),
        gbp("ds-desserts", "ds-lemon-cheesecake", "Lemon Blossom Cheesecake", 12, "Lemon sorbet"),
        gbp("ds-desserts", "ds-banoffee", "Caramelised Banoffee Pie", 12, "Vanilla ice cream & fire-roasted banana"),
        gbp("ds-desserts", "ds-selection", "Selection of exotic fruits / mochi / sorbets & ice creams", 9),
        gbp("ds-coffee", "ds-flat-white", "Flat White", 4.5),
        gbp("ds-coffee", "ds-latte", "Latte", 4.5),
        gbp("ds-coffee", "ds-cappuccino", "Cappuccino", 4.5),
        gbp("ds-coffee", "ds-americano", "Americano", 4.5),
        gbp("ds-coffee", "ds-espresso-s", "Single Espresso", 4.0),
        gbp("ds-coffee", "ds-espresso-d", "Double Espresso", 4.5),
        gbp("ds-tea", "ds-tea-green", "Green tea", 4.5),
        gbp("ds-tea", "ds-tea-jasmine", "Jasmine tea", 4.5),
        gbp("ds-tea", "ds-tea-earl", "Earl Grey", 4.5),
        gbp("ds-tea", "ds-tea-lemon-ginger", "Lemon Ginger", 4.5),
        gbp("ds-tea", "ds-tea-mint", "Fresh Mint", 4.5),
        gbp("ds-tea", "ds-tea-breakfast", "Breakfast Tea", 4.5),
        gbp(
            "ds-dessert-cocktails",
            "ds-white-mochatini",
            "White Mochatini",
            15,
            "Mozart White Chocolate, Kahlúa, fresh espresso coffee",
        ),
        gbp(
            "ds-dessert-cocktails",
            "ds-brûlée-sour",
            "Crème Brûlée Whiskey Sour",
            15,
            "Woodford Reserve, lemon, Baileys, syrup & icing sugar",
        ),
        gbp(
            "ds-dessert-cocktails",
            "ds-cinnamon-espresso",
            "Cinnamon Espresso Martini",
            15,
            "Kahlúa, coffee, VSOP cognac, cinnamon & simple syrup",
        ),
        gbp("ds-nightcap", "ds-yuzushu", "Yuzushu sake", 11, "Aka Shi-Tai Yuzushu"),
        gbp("ds-nightcap", "ds-ginjo-umeshu", "Ginjo Umeshu", 13.5, "Aka Shi-Tai Shiraume Ginjo Umeshu"),
        gbp("ds-nightcap", "ds-port", "Taylor's 10 year old Tawny Port", 14),
    ]

    # Drinks menu — curated from Drink-List PDF (prices as printed)
    dr_cats = [
        {"id": "dr-juice-soft", "menuId": "drinks", "label": "Juices & softs", "order": 0},
        {"id": "dr-signatures", "menuId": "drinks", "label": "Signature cocktails", "order": 1},
        {"id": "dr-classics", "menuId": "drinks", "label": "Classic cocktails", "order": 2},
        {"id": "dr-mocktails", "menuId": "drinks", "label": "Mocktails", "order": 3},
        {"id": "dr-beer", "menuId": "drinks", "label": "Beer", "order": 4},
        {"id": "dr-wine-glass", "menuId": "drinks", "label": "Wine by the glass", "order": 5},
        {"id": "dr-sake-sample", "menuId": "drinks", "label": "Sake · selection", "order": 6},
    ]
    dr_items = [
        gbp("dr-juice-soft", "dr-juice-apple", "Apple juice", 3.5),
        gbp("dr-juice-soft", "dr-juice-orange", "Orange juice", 3.5),
        gbp("dr-juice-soft", "dr-juice-lychee", "Lychee juice", 3.5),
        gbp("dr-juice-soft", "dr-juice-tomato", "Tomato juice", 3.5),
        gbp("dr-juice-soft", "dr-juice-cranberry", "Cranberry juice", 3.5),
        gbp("dr-juice-soft", "dr-juice-pineapple", "Pineapple juice", 3.5),
        gbp("dr-juice-soft", "dr-coke", "Coca-Cola", 3.5),
        gbp("dr-juice-soft", "dr-coke-zero", "Coke Zero", 3.5),
        gbp("dr-juice-soft", "dr-lemonade", "Lemonade", 3.5),
        gbp("dr-juice-soft", "dr-ginger-beer", "Ginger Beer", 3.5),
        gbp("dr-juice-soft", "dr-ginger-ale", "Ginger Ale", 3.5),
        gbp("dr-juice-soft", "dr-tonic", "Tonic", 3.5),
        gbp("dr-juice-soft", "dr-soda", "Soda", 3.5),
        gbp("dr-juice-soft", "dr-tonic-light", "Light Tonic", 3.5),
        gbp("dr-juice-soft", "dr-redbull", "Red Bull", 7),
        gbp("dr-juice-soft", "dr-redbull-zero", "Red Bull Zero", 7),
        gbp("dr-juice-soft", "dr-redbull-peach", "Red Bull Peach", 7),
        gbp("dr-juice-soft", "dr-water-still", "Still water", 6),
        gbp("dr-juice-soft", "dr-water-sparkling", "Sparkling water", 6),
        gbp("dr-signatures", "dr-sig-ziggurat", "Ziggurat", 15, "Olmeca Altos Tequila, Cointreau, Watermelon, Lime, Chilli"),
        gbp("dr-signatures", "dr-sig-assyria", "Assyria", 17, "Beluga Vodka, Midori Liqueur, Pineapple, Raspberry"),
        gbp("dr-signatures", "dr-sig-uruk", "Uruk", 15, "Bombay Gin, Matcha, Lemon Juice and Agave Syrup"),
        gbp("dr-signatures", "dr-sig-aruru", "Aruru", 15, "Bumbu, Briottet Pamplemouse Rose, Passionfruit"),
        gbp("dr-signatures", "dr-sig-shamash", "Shamash", 16, "Lychee liqueur, YuzuShu, Telmont Brut Champagne"),
        gbp("dr-signatures", "dr-sig-dilmun", "Dilmun", 15, "Meili Vodka, Lychee, Maraschino, Ginger Ale"),
        gbp("dr-signatures", "dr-sig-kish", "Kish", 15, "Malfy Orange, Aperol, St Germain, Strawberry"),
        gbp("dr-signatures", "dr-sig-ninsun", "Ninsun", 17, "Courvoisier, Xante Peach, Apple, Raspberry"),
        gbp("dr-signatures", "dr-sig-anu", "Anu", 15, "Absolut Vodka, Vanilla Syrup, Lime, Red Bull Peach"),
        gbp("dr-signatures", "dr-sig-shuruppak", "Shuruppak", 19, "Brown butter Wild Turkey, Amaretto, Tonka Syrup"),
        gbp("dr-signatures", "dr-sig-ishtar", "Ishtar", 15, "Bacardi Blanco, Pineapple, Coconut Cream, Lime"),
        gbp("dr-signatures", "dr-sig-suri", "Suri", 16, "Bacardi Blanca & Spiced, Orgeat, Cointreau, Grenadine, citrus & pineapple"),
        gbp("dr-classics", "dr-cl-margarita", "Margarita", 15, "Olmeca Altos Tequila, Cointreau, Lime Juice"),
        gbp("dr-classics", "dr-cl-picante", "Picante", 15, "Olmeca Altos Tequila, Red Chilli, Pineapple, Lime Juice"),
        gbp("dr-classics", "dr-cl-old-fashioned", "Old Fashioned", 15, "Wild Turkey 101, Sugar, Angostura bitters"),
        gbp("dr-classics", "dr-cl-watermelon-martini", "Watermelon Martini", 15, "Absolut Vodka, watermelon liqueur, lime, watermelon juice"),
        gbp("dr-classics", "dr-cl-mai-tai", "Mai Tai", 16, "Bacardi Blanco, Kraken, Cointreau, Almond Syrup, Lime Juice"),
        gbp("dr-classics", "dr-cl-kir-royale", "Kir Royale", 15, "Crème de Cassis, Telmont Reserve Brut Champagne"),
        gbp("dr-mocktails", "dr-mock-tigris", "Tigris", 8, "Pineapple Juice, Passionfruit Purée, Passionfruit Syrup"),
        gbp("dr-mocktails", "dr-mock-euphrates", "Euphrates", 8, "Lychee, Lemon Juice, Passionfruit Syrup, Pink Grapefruit Soda"),
        gbp("dr-mocktails", "dr-mock-tammuz", "Tammuz", 8, "Apple, Lemon Juice, Peach Syrup, Peach & Jasmine Soda"),
        gbp("dr-mocktails", "dr-mock-endiku", "Endiku", 8, "Pineapple Juice, Coconut Cream, Lime"),
        gbp("dr-mocktails", "dr-mock-siduri", "Siduri", 8, "Cucumber, Basil, Elderflower Cordial, Lime, Soda"),
        gbp("dr-mocktails", "dr-mock-humbaba", "Humbaba", 8, "Watermelon Juice, Lemon Juice, Peach Syrup, Peach & Jasmine Soda"),
        gbp("dr-beer", "dr-beer-singha", "Singha", 6),
        gbp("dr-beer", "dr-beer-sapporo", "Sapporo", 7),
        gbp("dr-beer", "dr-beer-asahi", "Asahi", 8),
        gbp("dr-beer", "dr-beer-asahi0", "Asahi 0%", 6),
        gbp("dr-wine-glass", "dr-glass-prosecco", "Prosecco · 125ml", 9.5, "NV Vistis Nostra Prosecco, Italy"),
        gbp("dr-wine-glass", "dr-glass-telmont-brut", "Telmont Reserve Brut · 175ml", 19.5),
        gbp("dr-wine-glass", "dr-glass-telmont-rose", "Telmont Reserve Rosé Brut · 175ml", 25),
        gbp("dr-wine-glass", "dr-glass-sauv", "Sauvignon Blanc · 175ml", 10, "2022 Voramar Macabeo, Spain"),
        gbp("dr-wine-glass", "dr-glass-pinot-grigio", "Pinot Grigio · 175ml", 12, "2023 Prospetti, Lombardy"),
        gbp("dr-wine-glass", "dr-glass-chard", "Chardonnay · 175ml", 12, "2022 The Accomplice, Australia"),
        gbp("dr-wine-glass", "dr-glass-rose", "Chemin De Provence Rosé · 175ml", 10),
        gbp("dr-wine-glass", "dr-glass-red-bobal", "Voramar Bobal · 175ml", 9),
        gbp("dr-wine-glass", "dr-glass-merlot", "Saint Jaques Reserve Merlot · 175ml", 10),
        gbp("dr-wine-glass", "dr-glass-cab", "Vistamar Brisa Cabernet · 175ml", 11),
        gbp("dr-sake-sample", "dr-sake-hakkaisan-100", "Hakkaisan Junmai Daiginjo · 100ml", 13.5),
        gbp("dr-sake-sample", "dr-sake-nabeshima-100", "Nabeshima Daiginjo · 100ml", 14),
        gbp("dr-sake-sample", "dr-sake-dassai39-100", "Dassai 39 Junmai Daiginjo · 100ml", 14.5),
        gbp("dr-sake-sample", "dr-sake-yuzushu-720", "Tamanohikari Kyō No Yuzushu · 720ml", 60),
        gbp("dr-sake-sample", "dr-sake-umeshu-500", "Akashi-Tai Shiraume Ginjo Umeshu · 500ml", 74),
    ]

    categories = [*alc_cats, *gb_cats, *bb_cats, *el_cats, *gh_cats, *ds_cats, *dr_cats]
    items = [*alc_items, *gb_items, *bb_items, *el_items, *gh_items, *ds_items, *dr_items]

    out = {
        "availabilityVersion": "2026-05-10-extracted-pdfs",
        "currency": "GBP",
        "source": "Gilgamesh — structured from À la carte JSON + PDF extraction (banquets, brunch, express lunch, golden hour, dessert, drinks)",
        "menus": menus,
        "categories": categories,
        "items": items,
    }
    base_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fallback_path = root / "src" / "data" / "menuFallback.json"
    fallback_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote", base_path, "and", fallback_path, "items", len(items), "categories", len(categories))


if __name__ == "__main__":
    main()
