"""
Species API Module
Handle species details and data enrichment from external sources
"""

import json
import os
import re
import ast
from typing import Dict, List, Optional
import requests

# Load class mapping
CLASS_MAPPING_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "class_indices.json")
SPECIES_METADATA_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "species_metadata.json")
METADATA_SOURCE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "scraper", "oxford_102_full.py")
)

# Cache for enrichment data
_enrichment_cache = {}
_metadata_cache = None

CURATED_FUN_FACTS = {
    "pink primrose": [
        "Primroses are often among the earliest garden flowers to bloom in cool seasons.",
        "The five-petaled flowers are usually arranged as a low rosette close to the leaves.",
    ],
    "hard-leaved pocket orchid": [
        "Pocket orchids are prized for their pouch-shaped lip, a feature that gives the flower its slipper-like look.",
        "Many Paphiopedilum orchids grow slowly, which is one reason collectors value mature blooming plants.",
    ],
    "canterbury bells": [
        "Canterbury bells are named for their bell-shaped flowers.",
        "They are often grown as biennials, forming leafy growth first and blooming heavily later.",
    ],
    "sweet pea": [
        "Sweet peas are famous for fragrance as much as color.",
        "The climbing stems use tendrils to hold onto nearby support.",
    ],
    "english marigold": [
        "Calendula petals have long been used as a natural yellow-orange dye.",
        "The flower heads tend to open in bright light and close when conditions are dim or wet.",
    ],
    "tiger lily": [
        "Tiger lilies commonly produce small bulbils in the leaf axils that can grow into new plants.",
        "The dark speckles on the recurved petals are one of the easiest visual clues for this flower.",
    ],
    "moon orchid": [
        "Moon orchids can hold their flowers for weeks under stable indoor conditions.",
        "The broad petals and arching flower spikes make them one of the most recognizable orchids.",
    ],
    "bird of paradise": [
        "The flower shape is what gives this plant its bird-like common name.",
        "Its stiff, sculptural blooms are often used as long-lasting cut flowers.",
    ],
    "monkshood": [
        "Monkshood gets its name from the hood-shaped upper sepal.",
        "It is a highly poisonous ornamental plant and should be handled with care.",
    ],
    "snapdragon": [
        "Snapdragon flowers can open and close like a tiny mouth when gently pressed.",
        "The flower spikes bloom from the bottom upward, so one stem can show several stages at once.",
    ],
    "king protea": [
        "King protea has one of the largest flower heads in the Protea group.",
        "Its bold bracts make the bloom look like a single giant flower, though it is a complex flower head.",
    ],
    "purple coneflower": [
        "The raised cone in the center is made of many tiny disk florets.",
        "Its seed heads often remain decorative after the petals fade.",
    ],
    "balloon flower": [
        "The buds inflate like small balloons before opening.",
        "When open, the flower becomes a crisp star shape.",
    ],
    "pincushion flower": [
        "The common name comes from the pin-like stamens that stand above the flower head.",
        "Its blooms are often used in cottage-style gardens because they keep flowering over a long season.",
    ],
    "fritillary": [
        "Some fritillaries have a checkerboard pattern on their petals.",
        "The nodding flower shape is a useful clue for recognizing many Fritillaria species.",
    ],
    "red ginger": [
        "The bright red parts are showy bracts; the true flowers are smaller.",
        "It is often used in tropical arrangements because the bracts last well after cutting.",
    ],
    "grape hyacinth": [
        "The clustered blue-purple bells look like a small bunch of grapes.",
        "Grape hyacinths grow from bulbs and often naturalize into small spring colonies.",
    ],
    "corn poppy": [
        "Corn poppies are strongly associated with remembrance symbolism.",
        "Their papery petals are delicate, but the plant can produce many seeds.",
    ],
    "artichoke": [
        "The edible artichoke is actually an unopened flower bud.",
        "If left to bloom, it opens into a large purple thistle-like flower.",
    ],
    "sweet william": [
        "Sweet William forms dense clusters of small, patterned flowers.",
        "Many varieties have contrasting rings or eyes near the center of each bloom.",
    ],
    "carnation": [
        "Carnations are known for ruffled petals and long vase life.",
        "The flower has been bred into many colors, including striped and picotee forms.",
    ],
    "love in the mist": [
        "The flower sits inside fine, lacy foliage that creates the mist-like look.",
        "After blooming, it forms decorative inflated seed pods.",
    ],
    "daffodil": [
        "The central trumpet is called the corona.",
        "Daffodils grow from bulbs and are strongly linked with spring displays.",
    ],
    "poinsettia": [
        "The colorful red parts are bracts, not petals.",
        "The true flowers are the small yellow structures at the center.",
    ],
    "buttercup": [
        "Buttercup petals can look glossy because of a reflective surface layer.",
        "The bright yellow shine helps make the small flowers easy to notice.",
    ],
    "daisy": [
        "A daisy flower head is made of many tiny flowers, not one single flower.",
        "The white outer rays and yellow center are different types of florets.",
    ],
    "common dandelion": [
        "Each fluffy seed is attached to a tiny parachute-like structure.",
        "The yellow flower head is made of many small florets packed together.",
    ],
    "wild pansy": [
        "Wild pansies often show multiple colors on a single flower.",
        "The dark markings on the petals can act like visual guides toward the flower center.",
    ],
    "sunflower": [
        "Young sunflowers track the sun from east to west.",
        "Sunflower seeds are technically dry fruits called achenes.",
        "The large head is made from many small florets packed together.",
    ],
    "dahlia": [
        "Dahlias grow from tubers and can return each season in mild conditions.",
        "Their blooms come in many formal shapes, from pompon to cactus forms.",
    ],
    "californian poppy": [
        "California poppy flowers often close at night or during cloudy weather.",
        "The silky petals create a cup-like bloom in bright light.",
    ],
    "crocus": [
        "Crocuses are among the classic early spring bulbs.",
        "Their flowers can appear before much surrounding foliage has grown.",
    ],
    "iris": [
        "Iris flowers have upright petals called standards and lower parts often called falls.",
        "The flower structure makes irises especially easy to recognize from the side.",
    ],
    "water lily": [
        "Water lily leaves float on the water surface while the roots anchor below.",
        "The flowers usually open above or just at the waterline.",
    ],
    "rose": [
        "After flowering, many roses can form fruit-like structures called hips.",
        "Rose fragrance varies widely, from light tea notes to rich old-rose scent.",
    ],
    "morning glory": [
        "Morning glory flowers often open early and fade by later in the day.",
        "The funnel-shaped blooms are held on twining vines.",
    ],
    "passion flower": [
        "Passion flowers are known for their complex ring of filaments.",
        "The unusual layered structure makes the flower look almost architectural.",
    ],
    "lotus": [
        "Lotus leaves are famous for shedding water because of their waxy surface.",
        "The seed pod remains visually distinctive after the petals fall.",
    ],
    "anthurium": [
        "The colorful heart-shaped part is a spathe, a modified leaf.",
        "The true tiny flowers sit on the central spike called a spadix.",
    ],
    "frangipani": [
        "Frangipani flowers are known for a strong sweet fragrance.",
        "The waxy petals help the blooms keep a clean, sculptural look.",
    ],
    "hibiscus": [
        "Hibiscus flowers usually have a prominent central staminal column.",
        "Individual blooms can be short-lived, but the plant may produce many of them.",
    ],
    "magnolia": [
        "Magnolias are an ancient flowering plant lineage.",
        "Many magnolia flowers open before the leaves, making the blooms stand out clearly.",
    ],
    "foxglove": [
        "Foxglove flowers hang in tubular rows along tall spikes.",
        "Digitalis plants are toxic and should not be eaten.",
    ],
    "bougainvillea": [
        "The bright papery parts are bracts; the true flowers are small and usually pale.",
        "Bougainvillea can bloom heavily on woody climbing stems.",
    ],
    "camellia": [
        "Camellias often bloom in cooler months when many garden plants are quiet.",
        "Some varieties have tightly layered petals that look almost rose-like.",
    ],
}


def load_class_mapping() -> Dict:
    """Load class indices mapping."""
    try:
        with open(CLASS_MAPPING_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback: generate from known Oxford 102 classes
        return _generate_fallback_mapping()


def _normalize_metadata(raw_metadata: Dict) -> Dict:
    """Normalize supported metadata formats into the keys used by the API."""
    normalized = {}
    for class_id, metadata in raw_metadata.items():
        normalized[class_id] = {
            "common_name": metadata.get("common_name") or metadata.get("common"),
            "scientific_name": metadata.get("scientific_name") or metadata.get("latin"),
            "family": metadata.get("family"),
            "origin": metadata.get("origin") or metadata.get("native_region"),
            "description": metadata.get("description"),
            "bloom_season": metadata.get("bloom_season"),
            "colors": metadata.get("colors"),
            "fun_facts": metadata.get("fun_facts"),
        }
    return normalized


def load_local_metadata() -> Dict:
    """Load Oxford 102 metadata from species_metadata.json, with script fallback."""
    global _metadata_cache
    if _metadata_cache is not None:
        return _metadata_cache

    try:
        with open(SPECIES_METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata_cache = _normalize_metadata(json.load(f))
            return _metadata_cache
    except Exception:
        pass

    metadata_by_class_id = {}
    try:
        with open(METADATA_SOURCE_PATH, "r", encoding="utf-8") as f:
            module = ast.parse(f.read(), filename=METADATA_SOURCE_PATH)

        for node in module.body:
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "FLOWER_METADATA":
                        raw_metadata = ast.literal_eval(node.value)
                        for folder_name, metadata in raw_metadata.items():
                            class_num = folder_name.split("_", 1)[0]
                            if class_num.isdigit():
                                metadata_by_class_id[f"class_{int(class_num):03d}"] = metadata
                        break
    except Exception:
        metadata_by_class_id = {}

    _metadata_cache = _normalize_metadata(metadata_by_class_id)
    return _metadata_cache


def _generate_fallback_mapping() -> Dict:
    """Generate fallback mapping if file not found."""
    # Oxford 102 class names (abbreviated)
    classes = {
        "class_001": "pink primrose",
        "class_002": "hard-leaved pocket orchid",
        "class_003": "canterbury bells",
        # ... (full list would be here)
    }
    return classes


def _normalize_class_id(class_id: str) -> str:
    """Normalize various class ID formats."""
    # Handle formats: "class_001", "001", "001_pink_primrose", "pink primrose"
    if class_id.startswith("class_"):
        return class_id

    # If numeric like "001"
    if class_id.isdigit():
        return f"class_{int(class_id):03d}"

    # If contains underscore like "001_pink_primrose"
    if "_" in class_id and class_id.split("_")[0].isdigit():
        num = class_id.split("_")[0]
        return f"class_{int(num):03d}"

    # Search by name
    mapping = load_class_mapping()
    for cid, name in mapping.items():
        if class_id.lower() in name.lower() or name.lower() in class_id.lower():
            return cid

    return class_id


def _build_local_description(metadata: Dict, display_name: str) -> str:
    """Build a useful local description from curated metadata."""
    scientific_name = metadata.get("scientific_name")
    family = metadata.get("family")
    origin = metadata.get("origin")

    name_part = f"{display_name} ({scientific_name})" if scientific_name else display_name
    details = []

    if family:
        details.append(f"belongs to the {family} family")
    if origin:
        details.append(f"is native to or strongly associated with {origin}")

    if details:
        return f"{name_part} is a flowering plant that {', and '.join(details)}."

    return f"{name_part} is one of the flower species recognized by the FloraID Oxford 102 classifier."


def _build_local_fun_facts(metadata: Dict, display_name: str) -> List[str]:
    """Build species-specific fun facts without repeating displayed metadata."""
    facts = []

    normalized_name = display_name.lower().replace("-", " ")
    exact_facts = CURATED_FUN_FACTS.get(normalized_name)
    if exact_facts:
        facts.extend(exact_facts)

    if not facts:
        for keyword, keyword_facts in CURATED_FUN_FACTS.items():
            normalized_keyword = keyword.replace("-", " ")
            if normalized_keyword in normalized_name or normalized_name in normalized_keyword:
                facts.extend(keyword_facts)
                break

    if not facts:
        family = metadata.get("family")
        common_name = normalized_name

        if "orchid" in common_name or family == "Orchidaceae":
            facts.extend([
                "Orchid flowers are often bilaterally symmetrical, which gives them a very deliberate shape.",
                "Many orchids are adapted to grow with specialized roots that grip bark or airy surfaces.",
            ])
        elif "lily" in common_name:
            facts.extend([
                "Many lily-type flowers use bold markings near the center to draw attention inward.",
                "Their petals are often arranged to create a strong star or trumpet silhouette.",
            ])
        elif "poppy" in common_name:
            facts.extend([
                "Poppies are known for thin, papery petals that can look translucent in bright light.",
                "After flowering, many poppies form distinctive capsule-like seed heads.",
            ])
        elif "thistle" in common_name:
            facts.extend([
                "Thistle-like flowers are made from many small florets packed into a spiny-looking head.",
                "Their sculptural flower heads often remain recognizable even after bloom.",
            ])
        elif "daisy" in common_name or family == "Asteraceae":
            facts.extend([
                "The bloom is a composite head made from many small florets.",
                "What looks like one flower is actually a tightly organized cluster of tiny flowers.",
            ])
        elif "ginger" in common_name or family == "Zingiberaceae":
            facts.extend([
                "Ginger-family ornamentals often show their color through bracts as much as true petals.",
                "The flowers are usually held on upright, tropical-looking stems.",
            ])
        elif "arum" in common_name or family == "Araceae":
            facts.extend([
                "Arum-type flowers usually have a spathe wrapped around a central spadix.",
                "The showy part can be a modified leaf rather than a true petal.",
            ])
        elif "mallow" in common_name or family == "Malvaceae":
            facts.extend([
                "Mallow-family flowers often have a prominent central column of reproductive parts.",
                "The petals commonly form a broad, open funnel shape.",
            ])

    if metadata.get("bloom_season") and len(facts) < 3:
        facts.append(f"It is commonly seen in bloom around {metadata['bloom_season']}.")

    if not facts:
        facts.append(
            "This species has distinctive floral traits, but FloraID needs richer curated notes for more detailed facts."
        )

    unique_facts = []
    for fact in facts:
        if fact and fact not in unique_facts:
            unique_facts.append(fact)

    return unique_facts[:3]


def _infer_color_hint(name: str, metadata: Dict) -> str:
    """Infer a simple gallery color label from metadata and common names."""
    colors = metadata.get("colors")
    if colors:
        first_color = str(colors[0]).split("(")[0].strip()
        return first_color or "Mixed"

    lower_name = name.lower()
    color_keywords = {
        "pink": "Pink",
        "yellow": "Yellow",
        "orange": "Orange",
        "red": "Red",
        "purple": "Purple",
        "blue": "Blue",
        "white": "White",
        "black": "Dark",
    }

    for keyword, color in color_keywords.items():
        if keyword in lower_name:
            return color

    if "sunflower" in lower_name or "daffodil" in lower_name or "dandelion" in lower_name:
        return "Yellow"
    if "rose" in lower_name or "carnation" in lower_name:
        return "Mixed"
    if "orchid" in lower_name or "iris" in lower_name or "pansy" in lower_name:
        return "Purple"
    if "lily" in lower_name:
        return "Mixed"
    if "marigold" in lower_name or "poppy" in lower_name:
        return "Orange"

    return "Mixed"


def _fetch_wikipedia_data(species_name: str) -> Dict:
    """Fetch species data from Wikipedia API."""
    try:
        # Search for page
        search_url = "https://en.wikipedia.org/w/api.php"
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": species_name,
            "format": "json",
            "srlimit": 1
        }

        response = requests.get(search_url, params=search_params, timeout=10)
        data = response.json()

        if not data["query"]["search"]:
            return {}

        page_title = data["query"]["search"][0]["title"]

        # Get page extract
        extract_params = {
            "action": "query",
            "prop": "extracts",
            "titles": page_title,
            "exsentences": 3,
            "exintro": True,
            "explaintext": True,
            "format": "json"
        }

        response = requests.get(search_url, params=extract_params, timeout=10)
        data = response.json()

        pages = data["query"]["pages"]
        page_id = list(pages.keys())[0]
        extract = pages[page_id].get("extract", "")

        return {
            "description": extract,
            "wikipedia_url": f"https://en.wikipedia.org/wiki/{page_title.replace(' ', '_')}",
            "scientific_name": page_title
        }

    except Exception as e:
        return {"error": str(e)}


def _fetch_gbif_data(species_name: str) -> Dict:
    """Fetch species data from GBIF API."""
    try:
        search_url = "https://api.gbif.org/v1/species/search"
        params = {
            "q": species_name,
            "limit": 1
        }

        response = requests.get(search_url, params=params, timeout=10)
        data = response.json()

        if not data["results"]:
            return {}

        result = data["results"][0]

        return {
            "scientific_name": result.get("scientificName", ""),
            "family": result.get("family", ""),
            "habitat": result.get("habitat", ""),
            "native_region": result.get("distribution", ""),
            "gbif_url": f"https://www.gbif.org/species/{result.get('key', '')}"
        }

    except Exception as e:
        return {"error": str(e)}


def get_species_details(class_id: str, enrich: bool = True) -> Dict:
    """
    Get detailed information about a flower species.

    Args:
        class_id: Class identifier
        enrich: Whether to fetch external data

    Returns:
        Dict with species information
    """
    normalized_id = _normalize_class_id(class_id)
    mapping = load_class_mapping()

    class_name = mapping.get(normalized_id, normalized_id)
    local_metadata = load_local_metadata().get(normalized_id, {})

    # Clean class name for display
    display_name = local_metadata.get("common_name") or class_name.replace("_", " ").title()

    # Base info
    species_info = {
        "class_id": normalized_id,
        "class_name": class_name,
        "common_name": display_name,
        "scientific_name": local_metadata.get("scientific_name"),
        "family": local_metadata.get("family"),
        "description": local_metadata.get("description") or _build_local_description(local_metadata, display_name),
        "habitat": None,
        "native_region": local_metadata.get("origin"),
        "bloom_season": local_metadata.get("bloom_season"),
        "colors": local_metadata.get("colors"),
        "care_tips": [
            "Water regularly but avoid overwatering",
            "Provide adequate sunlight based on species needs",
            "Use well-draining soil",
            "Fertilize during growing season"
        ],
        "fun_facts": local_metadata.get("fun_facts") or _build_local_fun_facts(local_metadata, display_name),
        "image_url": f"/species/{normalized_id}.jpg",
        "wikipedia_url": None,
        "gbif_url": None
    }

    # Check cache
    cache_key = normalized_id
    if cache_key in _enrichment_cache:
        species_info.update(_enrichment_cache[cache_key])
        return species_info

    if enrich:
        # Fetch from Wikipedia
        search_name = local_metadata.get("scientific_name") or class_name.replace("_", " ")

        wiki_data = _fetch_wikipedia_data(search_name)
        if wiki_data.get("description"):
            species_info["description"] = wiki_data["description"]
            species_info["wikipedia_url"] = wiki_data.get("wikipedia_url")
            species_info["scientific_name"] = species_info["scientific_name"] or wiki_data.get("scientific_name")

        # Fetch from GBIF
        gbif_data = _fetch_gbif_data(search_name)
        if gbif_data and "error" not in gbif_data:
            species_info["habitat"] = gbif_data.get("habitat") or species_info["habitat"]
            species_info["native_region"] = gbif_data.get("native_region") or species_info["native_region"]
            species_info["family"] = species_info["family"] or gbif_data.get("family")
            species_info["gbif_url"] = gbif_data.get("gbif_url")
            if gbif_data.get("scientific_name"):
                species_info["scientific_name"] = species_info["scientific_name"] or gbif_data["scientific_name"]

        # Cache result
        _enrichment_cache[cache_key] = {
            k: v for k, v in species_info.items() 
            if k not in ["class_id", "class_name", "common_name", "care_tips", "fun_facts"]
        }

    return species_info


def search_species(query: Optional[str] = None, limit: int = 20, offset: int = 0) -> Dict:
    """
    Search and list available species.

    Args:
        query: Search query
        limit: Max results
        offset: Pagination offset

    Returns:
        Dict with total count and species list
    """
    mapping = load_class_mapping()
    metadata_by_class_id = load_local_metadata()

    species_list = []
    for class_id, class_name in mapping.items():
        metadata = metadata_by_class_id.get(class_id, {})
        common_name = metadata.get("common_name") or class_name.replace("_", " ").title()
        scientific_name = metadata.get("scientific_name")
        family = metadata.get("family")
        origin = metadata.get("origin")
        haystack = " ".join(
            [
                class_id,
                class_name,
                common_name or "",
                scientific_name or "",
                family or "",
                origin or "",
            ]
        ).lower()

        if query is None or query.lower() in haystack:
            species_list.append({
                "class_id": class_id,
                "class_name": class_name,
                "display_name": common_name,
                "common_name": common_name,
                "scientific_name": scientific_name,
                "family": family,
                "native_region": origin,
                "bloom_season": metadata.get("bloom_season"),
                "colors": metadata.get("colors") or [],
                "color_hint": _infer_color_hint(common_name, metadata),
                "image_url": f"/species/{class_id}.jpg",
                "fun_facts_count": len(metadata.get("fun_facts") or _build_local_fun_facts(metadata, common_name)),
            })

    # Sort alphabetically
    species_list.sort(key=lambda x: x["display_name"])

    total = len(species_list)
    paginated = species_list[offset:offset + limit]

    return {
        "total": total,
        "species": paginated
    }
