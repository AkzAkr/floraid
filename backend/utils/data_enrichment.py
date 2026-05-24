"""
Data Enrichment Utility
Fetch additional flower data from external APIs (Wikipedia, GBIF, etc.)
"""

import requests
import json
from typing import Dict, Optional, List
from functools import lru_cache


@lru_cache(maxsize=128)
def fetch_wikipedia_summary(query: str, sentences: int = 3) -> Optional[str]:
    """
    Fetch Wikipedia summary for a flower species.

    Args:
        query: Search query (species name)
        sentences: Number of sentences to return

    Returns:
        Summary text or None
    """
    try:
        url = "https://en.wikipedia.org/w/api.php"

        # Search for page
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 1,
            "origin": "*"
        }

        response = requests.get(url, params=search_params, timeout=10)
        data = response.json()

        if not data.get("query", {}).get("search"):
            return None

        page_title = data["query"]["search"][0]["title"]

        # Get extract
        extract_params = {
            "action": "query",
            "prop": "extracts",
            "titles": page_title,
            "exsentences": sentences,
            "exintro": True,
            "explaintext": True,
            "format": "json",
            "origin": "*"
        }

        response = requests.get(url, params=extract_params, timeout=10)
        data = response.json()

        pages = data["query"]["pages"]
        page_id = list(pages.keys())[0]
        extract = pages[page_id].get("extract", "")

        return extract if extract else None

    except Exception as e:
        print(f"Wikipedia fetch error: {e}")
        return None


@lru_cache(maxsize=128)
def fetch_gbif_species(query: str) -> Optional[Dict]:
    """
    Fetch species data from GBIF (Global Biodiversity Information Facility).

    Args:
        query: Scientific or common name

    Returns:
        Dict with species data or None
    """
    try:
        url = "https://api.gbif.org/v1/species/search"
        params = {
            "q": query,
            "limit": 1,
            "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c"  # GBIF Backbone
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if not data.get("results"):
            return None

        result = data["results"][0]

        return {
            "scientific_name": result.get("scientificName"),
            "canonical_name": result.get("canonicalName"),
            "rank": result.get("rank"),
            "status": result.get("taxonomicStatus"),
            "kingdom": result.get("kingdom"),
            "family": result.get("family"),
            "genus": result.get("genus"),
            "species": result.get("species"),
            "authorship": result.get("authorship"),
            "key": result.get("key"),
            "gbif_url": f"https://www.gbif.org/species/{result.get('key', '')}"
        }

    except Exception as e:
        print(f"GBIF fetch error: {e}")
        return None


@lru_cache(maxsize=128)
def fetch_perenual_data(query: str) -> Optional[Dict]:
    """
    Fetch plant care data from Perenual API (requires API key).

    Args:
        query: Plant common or scientific name

    Returns:
        Dict with care tips or None
    """
    api_key = "YOUR_PERENUAL_API_KEY"  # Set via environment variable

    if not api_key or api_key == "YOUR_PERENUAL_API_KEY":
        return None

    try:
        url = "https://perenual.com/api/species-list"
        params = {
            "key": api_key,
            "q": query
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if not data.get("data"):
            return None

        plant = data["data"][0]

        return {
            "common_name": plant.get("common_name"),
            "scientific_name": plant.get("scientific_name"),
            "watering": plant.get("watering"),
            "sunlight": plant.get("sunlight"),
            "care_level": plant.get("care_level"),
            "image": plant.get("default_image", {}).get("regular_url"),
            "perenual_url": f"https://perenual.com/plant-species-database-search-finder/{plant.get('id', '')}"
        }

    except Exception as e:
        print(f"Perenual fetch error: {e}")
        return None


def enrich_species_data(class_name: str) -> Dict:
    """
    Enrich species data from multiple sources.

    Args:
        class_name: Class name (e.g., "pink_primrose")

    Returns:
        Enriched data dict
    """
    display_name = class_name.replace("_", " ")

    enriched = {
        "description": None,
        "scientific_name": None,
        "habitat": None,
        "native_region": None,
        "care_tips": [],
        "fun_facts": [],
        "wikipedia_url": None,
        "gbif_url": None,
        "image_url": None
    }

    # Fetch Wikipedia
    wiki_summary = fetch_wikipedia_summary(display_name)
    if wiki_summary:
        enriched["description"] = wiki_summary
        enriched["wikipedia_url"] = f"https://en.wikipedia.org/wiki/{display_name.replace(' ', '_')}"

    # Fetch GBIF
    gbif_data = fetch_gbif_species(display_name)
    if gbif_data:
        enriched["scientific_name"] = gbif_data.get("scientific_name") or enriched["scientific_name"]
        enriched["gbif_url"] = gbif_data.get("gbif_url")
        enriched["family"] = gbif_data.get("family")
        enriched["genus"] = gbif_data.get("genus")

    # Default care tips if no external data
    if not enriched["care_tips"]:
        enriched["care_tips"] = [
            "Water when top inch of soil is dry",
            "Provide bright, indirect sunlight",
            "Use well-draining potting mix",
            "Fertilize monthly during growing season"
        ]

    # Default fun facts
    if not enriched["fun_facts"]:
        enriched["fun_facts"] = [
            f"{display_name.title()} is part of the Oxford 102 Flowers dataset",
            "This species was used to train AI classification models"
        ]

    return enriched