#!/usr/bin/env python3
"""
Add topic-specific interactiveElement to all chapter JSON files.
"""
import json
import os
import re

CHAPTERS_DIR = "/opt/h-arya/content/chapters"

def get_interactive_element(filename, metadata):
    title = metadata.get("title", "").lower()
    subject = metadata.get("subject", "").lower()
    
    # Detect subject from filename if not in metadata
    if not subject:
        if "science" in filename: subject = "science"
        elif "math" in filename or "integer" in filename or "ratio" in filename or "algebra" in filename or "geometr" in filename or "circle" in filename or "pythag" in filename or "statistic" in filename or "proportion" in filename or "hcf" in filename or "lcm" in filename or "perimeter" in filename or "angle" in filename or "index" in filename or "indices" in filename or "bank" in filename: subject = "mathematics"
        elif "history" in filename: subject = "history"
        elif "geography" in filename or "geo" in filename: subject = "geography"
        elif "civics" in filename or "civic" in filename: subject = "civics"
        elif "english" in filename: subject = "english"
        elif "hindi" in filename: subject = "hindi"
        elif "marathi" in filename: subject = "marathi"
        else: subject = "general"

    # Science - Biology
    if subject == "science" and any(k in title for k in ["living", "plant", "cell", "micro", "organ", "muscular", "digestive", "nutrition", "food", "adaptation", "classification"]):
        return {
            "type": "label-diagram",
            "title": "Label the Diagram!",
            "description": "Tap on each blank label to reveal the correct name.",
            "data": get_label_diagram(title)
        }

    # Science - Physics
    if subject == "science" and any(k in title for k in ["motion", "force", "work", "light", "sound", "heat", "electricity", "magnetic", "measurement", "wave"]):
        return {
            "type": "formula-builder",
            "title": "Build the Formula!",
            "description": "Drag the components to build the key formula for this chapter.",
            "data": get_formula_builder(title)
        }

    # Science - Earth/Environment
    if subject == "science" and any(k in title for k in ["disaster", "natural resource", "star", "material", "chemical", "physical change", "properties"]):
        return {
            "type": "match-pairs",
            "title": "Match the Pairs!",
            "description": "Match each term to its correct description.",
            "data": get_match_pairs_science(title)
        }

    # Mathematics
    if subject == "mathematics":
        return {
            "type": "formula-builder",
            "title": "Build the Formula!",
            "description": "Arrange the pieces to form the correct mathematical expression.",
            "data": get_formula_builder_math(title, filename)
        }

    # History
    if subject == "history":
        return {
            "type": "timeline",
            "title": "Arrange the Timeline!",
            "description": "Put these historical events in the correct chronological order.",
            "data": get_timeline(title, filename)
        }

    # Geography
    if subject == "geography":
        return {
            "type": "drag-drop",
            "title": "Sort the Features!",
            "description": "Drag each item to its correct geographical category.",
            "data": get_geography_drag_drop(title)
        }

    # Civics
    if subject == "civics":
        return {
            "type": "match-pairs",
            "title": "Match the Pairs!",
            "description": "Match each constitutional term to its correct meaning.",
            "data": get_civics_match(title)
        }

    # English
    if subject == "english":
        return {
            "type": "quiz-flashcard",
            "title": "Vocabulary Flashcards!",
            "description": "Flip each card to reveal the meaning of the word.",
            "data": get_english_flashcards(title, filename)
        }

    # Hindi
    if subject == "hindi":
        return {
            "type": "fill-blanks",
            "title": "Fill in the Blanks!",
            "description": "Complete the key sentence by filling in the missing words.",
            "data": get_hindi_fill_blanks(title, filename)
        }

    # Marathi
    if subject == "marathi":
        return {
            "type": "word-scramble",
            "title": "Unscramble the Word!",
            "description": "Rearrange the letters to form the correct Marathi vocabulary word.",
            "data": get_marathi_scramble(title, filename)
        }

    # Default fallback
    return {
        "type": "quiz-flashcard",
        "title": "Quick Review!",
        "description": "Flip each card to test your knowledge of key concepts.",
        "data": {
            "cards": [
                {"front": "What is the main topic of this chapter?", "back": metadata.get("title", "See textbook")},
                {"front": "Name one key concept from this chapter.", "back": "Review your notes and textbook."},
                {"front": "Can you give a real-life example of this topic?", "back": "Think about what you see around you!"}
            ]
        }
    }

def get_label_diagram(title):
    if "plant" in title or "plants" in title:
        return {"image": "Cross-section of a plant cell showing organelles", "labels": [
            {"id": 1, "x": 50, "y": 20, "answer": "Cell Wall", "hint": "Outermost rigid layer"},
            {"id": 2, "x": 50, "y": 40, "answer": "Cell Membrane", "hint": "Thin flexible layer inside cell wall"},
            {"id": 3, "x": 50, "y": 60, "answer": "Chloroplast", "hint": "Green organelle for photosynthesis"},
            {"id": 4, "x": 75, "y": 50, "answer": "Nucleus", "hint": "Control centre of the cell"},
            {"id": 5, "x": 25, "y": 70, "answer": "Vacuole", "hint": "Large storage compartment"}
        ]}
    if "cell" in title or "micro" in title:
        return {"image": "Animal cell diagram showing key organelles", "labels": [
            {"id": 1, "x": 50, "y": 50, "answer": "Nucleus", "hint": "Controls all cell activities"},
            {"id": 2, "x": 70, "y": 40, "answer": "Mitochondria", "hint": "Powerhouse of the cell"},
            {"id": 3, "x": 30, "y": 40, "answer": "Cell Membrane", "hint": "Controls entry/exit of substances"},
            {"id": 4, "x": 50, "y": 70, "answer": "Cytoplasm", "hint": "Jelly-like fluid filling the cell"},
            {"id": 5, "x": 60, "y": 25, "answer": "Ribosome", "hint": "Site of protein synthesis"}
        ]}
    if "muscular" in title or "digestive" in title:
        return {"image": "Human digestive system diagram", "labels": [
            {"id": 1, "x": 50, "y": 15, "answer": "Mouth", "hint": "Where digestion begins"},
            {"id": 2, "x": 50, "y": 30, "answer": "Oesophagus", "hint": "Food pipe connecting mouth to stomach"},
            {"id": 3, "x": 45, "y": 50, "answer": "Stomach", "hint": "J-shaped organ for churning food"},
            {"id": 4, "x": 50, "y": 65, "answer": "Small Intestine", "hint": "Longest part, absorbs nutrients"},
            {"id": 5, "x": 50, "y": 80, "answer": "Large Intestine", "hint": "Absorbs water, forms waste"}
        ]}
    if "living" in title or "adaptation" in title:
        return {"image": "Diagram showing adaptation features of a cactus and polar bear", "labels": [
            {"id": 1, "x": 20, "y": 30, "answer": "Spines", "hint": "Modified leaves to reduce water loss"},
            {"id": 2, "x": 20, "y": 60, "answer": "Fleshy Stem", "hint": "Stores water in desert"},
            {"id": 3, "x": 70, "y": 30, "answer": "Thick Fur", "hint": "Insulation against cold"},
            {"id": 4, "x": 70, "y": 60, "answer": "Layer of Fat", "hint": "Blubber for warmth in polar regions"},
            {"id": 5, "x": 45, "y": 85, "answer": "Webbed Feet", "hint": "For swimming in cold water"}
        ]}
    # Nutrition default
    return {"image": "Food pyramid showing different food groups", "labels": [
        {"id": 1, "x": 50, "y": 10, "answer": "Fats & Oils", "hint": "Eat the least of these"},
        {"id": 2, "x": 50, "y": 30, "answer": "Proteins", "hint": "For growth and repair"},
        {"id": 3, "x": 50, "y": 50, "answer": "Fruits & Vegetables", "hint": "Rich in vitamins and minerals"},
        {"id": 4, "x": 50, "y": 70, "answer": "Carbohydrates", "hint": "Main energy source"},
        {"id": 5, "x": 50, "y": 85, "answer": "Water", "hint": "Essential for all life processes"}
    ]}

def get_formula_builder(title):
    if "motion" in title or "force" in title or "work" in title:
        return {"formula": "Speed = Distance / Time", "components": ["Speed", "=", "Distance", "/", "Time"], "explanation": "Speed tells us how fast an object is moving. Distance divided by time gives speed."}
    if "heat" in title:
        return {"formula": "Q = m × c × ΔT", "components": ["Q", "=", "m", "×", "c", "×", "ΔT"], "explanation": "Heat energy (Q) equals mass (m) times specific heat (c) times change in temperature (ΔT)."}
    if "light" in title:
        return {"formula": "Angle of Incidence = Angle of Reflection", "components": ["Angle of Incidence", "=", "Angle of Reflection"], "explanation": "According to the law of reflection, the angle at which light hits a mirror equals the angle at which it bounces back."}
    if "measurement" in title:
        return {"formula": "Speed = Distance / Time", "components": ["Speed", "=", "Distance", "/", "Time"], "explanation": "This is one of the most fundamental formulas. Speed is measured in m/s (SI unit)."}
    if "electricity" in title or "static" in title:
        return {"formula": "V = I × R", "components": ["Voltage (V)", "=", "Current (I)", "×", "Resistance (R)"], "explanation": "Ohm's Law: Voltage equals Current multiplied by Resistance."}
    if "sound" in title:
        return {"formula": "Speed of Sound = 343 m/s (in air)", "components": ["Speed", "=", "343", "m/s"], "explanation": "Sound travels at approximately 343 metres per second in air at room temperature."}
    return {"formula": "Work = Force × Distance", "components": ["Work", "=", "Force", "×", "Distance"], "explanation": "Work is done when a force causes an object to move. Measured in Joules (J)."}

def get_formula_builder_math(title, filename):
    if "integer" in filename or "integer" in title:
        return {"formula": "(-a) × (-b) = +ab", "components": ["(", "-a", ")", "×", "(", "-b", ")", "=", "+ab"], "explanation": "Multiplying two negative integers always gives a positive result."}
    if "hcf" in filename or "lcm" in filename:
        return {"formula": "HCF × LCM = a × b", "components": ["HCF", "×", "LCM", "=", "a", "×", "b"], "explanation": "The product of HCF and LCM of two numbers equals the product of those two numbers."}
    if "ratio" in filename or "proportion" in filename:
        return {"formula": "a/b = c/d", "components": ["a", "/", "b", "=", "c", "/", "d"], "explanation": "In a proportion, the cross products are equal: a × d = b × c."}
    if "algebra" in filename or "algebra" in title:
        return {"formula": "(a + b)² = a² + 2ab + b²", "components": ["(a + b)²", "=", "a²", "+", "2ab", "+", "b²"], "explanation": "This is the algebraic identity for the square of a sum."}
    if "pythag" in filename:
        return {"formula": "a² + b² = c²", "components": ["a²", "+", "b²", "=", "c²"], "explanation": "In a right-angled triangle, the square of the hypotenuse (c) equals the sum of squares of the other two sides."}
    if "perimeter" in filename or "area" in filename:
        return {"formula": "Area of Rectangle = Length × Breadth", "components": ["Area", "=", "Length", "×", "Breadth"], "explanation": "The area of a rectangle is found by multiplying its length by its breadth."}
    if "circle" in filename:
        return {"formula": "Area of Circle = π × r²", "components": ["Area", "=", "π", "×", "r²"], "explanation": "The area of a circle is pi times the radius squared."}
    if "statistic" in filename:
        return {"formula": "Mean = Sum of all values / Number of values", "components": ["Mean", "=", "Sum of values", "/", "Number of values"], "explanation": "The mean (average) is calculated by dividing the total sum by the count of values."}
    if "index" in filename or "indices" in filename:
        return {"formula": "aᵐ × aⁿ = aᵐ⁺ⁿ", "components": ["aᵐ", "×", "aⁿ", "=", "aᵐ⁺ⁿ"], "explanation": "When multiplying numbers with the same base, add the exponents."}
    if "bank" in filename or "interest" in filename:
        return {"formula": "Simple Interest = (P × R × T) / 100", "components": ["SI", "=", "(P", "×", "R", "×", "T)", "/", "100"], "explanation": "Simple Interest = Principal × Rate × Time ÷ 100."}
    if "angle" in filename:
        return {"formula": "Sum of angles in a triangle = 180°", "components": ["∠A", "+", "∠B", "+", "∠C", "=", "180°"], "explanation": "The three interior angles of any triangle always add up to 180 degrees."}
    if "bar" in filename or "graph" in filename:
        return {"formula": "Scale: 1 cm = ___ units", "components": ["1 cm", "=", "___", "units"], "explanation": "In a bar graph, you choose a scale to represent data. Each centimetre on the graph represents a certain number of units."}
    return {"formula": "Perimeter of Square = 4 × Side", "components": ["Perimeter", "=", "4", "×", "Side"], "explanation": "A square has 4 equal sides. Its perimeter is 4 times the length of one side."}

def get_match_pairs_science(title):
    if "disaster" in title:
        return {"pairs": [
            {"term": "Famine", "match": "Severe shortage of food affecting a large population"},
            {"term": "Tsunami", "match": "Giant ocean waves caused by underwater earthquakes"},
            {"term": "Volcano", "match": "Mountain that erupts molten rock from beneath the earth"},
            {"term": "Water Scarcity", "match": "Insufficient fresh water to meet basic needs"},
            {"term": "Drought", "match": "Prolonged period of abnormally low rainfall"}
        ]}
    if "material" in title:
        return {"pairs": [
            {"term": "Conductor", "match": "Material that allows electricity to flow through it"},
            {"term": "Insulator", "match": "Material that does not allow electricity to flow"},
            {"term": "Transparent", "match": "Material that allows light to pass through completely"},
            {"term": "Opaque", "match": "Material that does not allow light to pass through"},
            {"term": "Malleable", "match": "Material that can be beaten into thin sheets"}
        ]}
    if "chemical" in title or "physical" in title:
        return {"pairs": [
            {"term": "Physical Change", "match": "Change in shape/size, original substance can be recovered"},
            {"term": "Chemical Change", "match": "New substance formed, change is usually irreversible"},
            {"term": "Rusting", "match": "Example of a chemical change"},
            {"term": "Melting Ice", "match": "Example of a physical change"},
            {"term": "Burning Paper", "match": "Example of an irreversible chemical change"}
        ]}
    return {"pairs": [
        {"term": "Natural Resource", "match": "Resource found in nature used by living organisms"},
        {"term": "Renewable Resource", "match": "Resource that can be replenished naturally over time"},
        {"term": "Non-Renewable Resource", "match": "Resource that cannot be replaced once used up"},
        {"term": "Conservation", "match": "Careful use and management of natural resources"},
        {"term": "Biodiversity", "match": "Variety of life forms in a given area"}
    ]}

def get_timeline(title, filename):
    if "shivaji" in filename or "shivaji" in title or "swaraj" in filename:
        return {"events": [
            {"label": "Shivaji born at Shivneri Fort", "year": "1630", "fact": "Shivaji Maharaj was born to Jijabai and Shahaji Bhosale"},
            {"label": "Capture of Torna Fort", "year": "1646", "fact": "Young Shivaji captured his first fort at age 16"},
            {"label": "Battle of Pratapgad", "year": "1659", "fact": "Shivaji defeated Afzal Khan, a powerful Adilshahi general"},
            {"label": "Surat Sack", "year": "1664", "fact": "Shivaji raided the rich Mughal port city of Surat"},
            {"label": "Coronation at Raigad", "year": "1674", "fact": "Shivaji was crowned Chhatrapati (King) of the Maratha Empire"}
        ]}
    if "mughal" in filename or "mughal" in title:
        return {"events": [
            {"label": "Babur founds Mughal Empire", "year": "1526", "fact": "Babur defeated Ibrahim Lodi in the First Battle of Panipat"},
            {"label": "Akbar becomes Emperor", "year": "1556", "fact": "Akbar the Great expanded the Mughal Empire significantly"},
            {"label": "Shah Jahan builds Taj Mahal", "year": "1632", "fact": "Built in memory of Mumtaz Mahal, completed in 1653"},
            {"label": "Aurangzeb's rule begins", "year": "1658", "fact": "The last great Mughal emperor, known for his strict policies"},
            {"label": "Decline of Mughal Empire", "year": "1707", "fact": "After Aurangzeb's death, the empire began to fragment"}
        ]}
    if "maratha" in filename or "maratha" in title:
        return {"events": [
            {"label": "Shivaji establishes Swaraj", "year": "1646", "fact": "Beginning of Maratha power in the Deccan"},
            {"label": "Battle of Salher", "year": "1672", "fact": "Major Maratha victory against the Mughals"},
            {"label": "Shivaji's Coronation", "year": "1674", "fact": "Shivaji crowned Chhatrapati at Raigad"},
            {"label": "Sambhaji becomes king", "year": "1680", "fact": "Shivaji's son continued the struggle against the Mughals"},
            {"label": "Peshwa Era begins", "year": "1713", "fact": "Balaji Vishwanath became the first powerful Peshwa"}
        ]}
    # Generic history timeline
    return {"events": [
        {"label": "Early Period", "year": "600 CE", "fact": "Early developments related to this chapter's topic"},
        {"label": "Medieval Period", "year": "1000 CE", "fact": "Key events during the medieval era"},
        {"label": "Important Development", "year": "1400 CE", "fact": "A significant milestone in this period"},
        {"label": "Major Change", "year": "1600 CE", "fact": "A turning point in history"},
        {"label": "Later Period", "year": "1800 CE", "fact": "Events leading to the modern era"}
    ]}

def get_geography_drag_drop(title):
    if "season" in title or "sun" in title or "moon" in title:
        return {"items": ["Summer Solstice", "Winter Solstice", "Spring Equinox", "Autumn Equinox", "Perihelion", "Aphelion"],
                "categories": ["Earth closer to Sun", "Earth farther from Sun", "Equal day and night"],
                "answers": {"Summer Solstice": "Earth closer to Sun", "Winter Solstice": "Earth farther from Sun",
                           "Spring Equinox": "Equal day and night", "Autumn Equinox": "Equal day and night",
                           "Perihelion": "Earth closer to Sun", "Aphelion": "Earth farther from Sun"}}
    if "wind" in title or "air pressure" in title:
        return {"items": ["Tropical Easterlies", "Westerlies", "Polar Easterlies", "Land Breeze", "Sea Breeze", "Monsoon"],
                "categories": ["Permanent Winds", "Periodic Winds", "Local Winds"],
                "answers": {"Tropical Easterlies": "Permanent Winds", "Westerlies": "Permanent Winds",
                           "Polar Easterlies": "Permanent Winds", "Land Breeze": "Local Winds",
                           "Sea Breeze": "Local Winds", "Monsoon": "Periodic Winds"}}
    if "soil" in title:
        return {"items": ["Alluvial Soil", "Black Cotton Soil", "Red Soil", "Laterite Soil", "Sandy Soil", "Clay Soil"],
                "categories": ["Found in River Plains", "Found in Deccan Plateau", "Found in Hilly Regions"],
                "answers": {"Alluvial Soil": "Found in River Plains", "Black Cotton Soil": "Found in Deccan Plateau",
                           "Red Soil": "Found in Hilly Regions", "Laterite Soil": "Found in Hilly Regions",
                           "Sandy Soil": "Found in River Plains", "Clay Soil": "Found in River Plains"}}
    if "agriculture" in title:
        return {"items": ["Rice", "Wheat", "Cotton", "Sugarcane", "Tea", "Coffee"],
                "categories": ["Kharif Crops (Summer)", "Rabi Crops (Winter)", "Cash Crops"],
                "answers": {"Rice": "Kharif Crops (Summer)", "Wheat": "Rabi Crops (Winter)",
                           "Cotton": "Cash Crops", "Sugarcane": "Cash Crops",
                           "Tea": "Cash Crops", "Coffee": "Cash Crops"}}
    if "natural region" in title:
        return {"items": ["Amazon Rainforest", "Sahara Desert", "Tundra", "Temperate Grassland", "Mediterranean", "Tropical Savanna"],
                "categories": ["Hot & Wet", "Hot & Dry", "Cold Region"],
                "answers": {"Amazon Rainforest": "Hot & Wet", "Sahara Desert": "Hot & Dry",
                           "Tundra": "Cold Region", "Temperate Grassland": "Hot & Dry",
                           "Mediterranean": "Hot & Dry", "Tropical Savanna": "Hot & Wet"}}
    if "settlement" in title or "human" in title:
        return {"items": ["Village", "Town", "City", "Metropolis", "Hamlet", "Suburb"],
                "categories": ["Rural Settlement", "Urban Settlement", "Semi-Urban"],
                "answers": {"Village": "Rural Settlement", "Hamlet": "Rural Settlement",
                           "Town": "Semi-Urban", "Suburb": "Semi-Urban",
                           "City": "Urban Settlement", "Metropolis": "Urban Settlement"}}
    if "contour" in title or "landform" in title:
        return {"items": ["Mountain", "Plateau", "Plain", "Valley", "Hill", "Delta"],
                "categories": ["Highlands", "Lowlands", "Water-Formed"],
                "answers": {"Mountain": "Highlands", "Plateau": "Highlands", "Hill": "Highlands",
                           "Plain": "Lowlands", "Valley": "Lowlands", "Delta": "Water-Formed"}}
    if "tide" in title:
        return {"items": ["Spring Tide", "Neap Tide", "High Tide", "Low Tide", "Tidal Current", "Ebb Tide"],
                "categories": ["Strong Tides", "Weak Tides", "Tidal Movement"],
                "answers": {"Spring Tide": "Strong Tides", "High Tide": "Strong Tides",
                           "Neap Tide": "Weak Tides", "Low Tide": "Weak Tides",
                           "Tidal Current": "Tidal Movement", "Ebb Tide": "Tidal Movement"}}
    return {"items": ["Tropic of Cancer", "Equator", "Prime Meridian", "Tropic of Capricorn", "Arctic Circle", "Antarctic Circle"],
            "categories": ["Lines of Latitude", "Lines of Longitude", "Special Lines"],
            "answers": {"Equator": "Lines of Latitude", "Tropic of Cancer": "Lines of Latitude",
                       "Tropic of Capricorn": "Lines of Latitude", "Prime Meridian": "Lines of Longitude",
                       "Arctic Circle": "Special Lines", "Antarctic Circle": "Special Lines"}}

def get_civics_match(title):
    if "constitution" in title or "introduction" in title:
        return {"pairs": [
            {"term": "Constitution", "match": "Supreme law of the land in India"},
            {"term": "Preamble", "match": "Introduction to the Constitution stating its goals"},
            {"term": "Parliament", "match": "Supreme law-making body of India"},
            {"term": "Fundamental Rights", "match": "Basic rights guaranteed to all citizens"},
            {"term": "Directive Principles", "match": "Guidelines for the government to follow"}
        ]}
    if "preamble" in title:
        return {"pairs": [
            {"term": "Sovereign", "match": "India is fully independent and not under any foreign power"},
            {"term": "Socialist", "match": "Equal distribution of wealth and resources"},
            {"term": "Secular", "match": "No state religion; all religions are equal"},
            {"term": "Democratic", "match": "Government elected by the people"},
            {"term": "Republic", "match": "Head of state is elected, not a monarch"}
        ]}
    if "fundamental right" in title or "right" in title:
        return {"pairs": [
            {"term": "Right to Equality", "match": "Articles 14-18: No discrimination based on religion, caste, sex"},
            {"term": "Right to Freedom", "match": "Articles 19-22: Freedom of speech, expression, movement"},
            {"term": "Right Against Exploitation", "match": "Articles 23-24: No forced labour or child labour"},
            {"term": "Right to Education", "match": "Article 21A: Free and compulsory education for children 6-14"},
            {"term": "Right to Constitutional Remedies", "match": "Article 32: Right to approach Supreme Court for rights"}
        ]}
    if "directive" in title or "duties" in title:
        return {"pairs": [
            {"term": "Directive Principles", "match": "Guidelines to the government for welfare of citizens (Part IV)"},
            {"term": "Fundamental Duties", "match": "Moral obligations of citizens towards the nation (Article 51A)"},
            {"term": "Welfare State", "match": "State responsible for economic and social well-being of citizens"},
            {"term": "Article 44", "match": "Directive to have a Uniform Civil Code for all citizens"},
            {"term": "Article 45", "match": "Directive to provide early childhood care and education"}
        ]}
    if "feature" in title:
        return {"pairs": [
            {"term": "Federal System", "match": "Power divided between Centre and States"},
            {"term": "Single Citizenship", "match": "All Indians have one citizenship regardless of state"},
            {"term": "Universal Adult Franchise", "match": "Every citizen above 18 has the right to vote"},
            {"term": "Independent Judiciary", "match": "Courts are free from control of legislature and executive"},
            {"term": "Bicameral Legislature", "match": "Parliament has two houses: Lok Sabha and Rajya Sabha"}
        ]}
    return {"pairs": [
        {"term": "Democracy", "match": "Government of the people, by the people, for the people"},
        {"term": "Citizen", "match": "A person with legal membership of a country"},
        {"term": "Legislature", "match": "Body that makes laws for the country"},
        {"term": "Executive", "match": "Body that implements and enforces laws"},
        {"term": "Judiciary", "match": "Body that interprets laws and delivers justice"}
    ]}

def get_english_flashcards(title, filename):
    if "brook" in filename:
        return {"cards": [
            {"front": "What is a 'brook'?", "back": "A small, natural stream of water"},
            {"front": "What poetic device is used when the brook 'speaks'?", "back": "Personification - giving human qualities to non-human things"},
            {"front": "What does 'I chatter over stony ways' mean?", "back": "The brook makes noise as it flows over rocks"},
            {"front": "Who wrote 'The Brook'?", "back": "Alfred Lord Tennyson, a famous English poet"},
            {"front": "What is the mood of the poem 'The Brook'?", "back": "Joyful, lively, and celebratory of nature"}
        ]}
    if "yoga" in filename:
        return {"cards": [
            {"front": "What does 'flexible' mean?", "back": "Able to bend easily without breaking"},
            {"front": "What is 'concentration' in yoga?", "back": "Focusing the mind completely on one thing"},
            {"front": "What does 'posture' mean?", "back": "The position or way in which one holds their body"},
            {"front": "Name a yoga pose inspired by animals.", "back": "Examples: Cat pose (Marjaryasana), Cobra (Bhujangasana), Downward Dog"},
            {"front": "What are the benefits of yoga?", "back": "Improves flexibility, strength, concentration, and mental well-being"}
        ]}
    if "scientist" in filename:
        return {"cards": [
            {"front": "What does 'experiment' mean?", "back": "A scientific test to discover or prove something"},
            {"front": "What is a 'hypothesis'?", "back": "An educated guess or prediction before an experiment"},
            {"front": "What does 'observation' mean in science?", "back": "Carefully watching and noting what happens"},
            {"front": "What is 'innovation'?", "back": "A new idea, method, or invention"},
            {"front": "Name one great scientist.", "back": "Examples: C.V. Raman, APJ Abdul Kalam, Isaac Newton, Marie Curie"}
        ]}
    # Default English flashcards
    return {"cards": [
        {"front": "What does 'comprehension' mean?", "back": "The ability to understand something"},
        {"front": "What is a 'metaphor'?", "back": "A figure of speech comparing two unlike things without using 'like' or 'as'"},
        {"front": "What is 'alliteration'?", "back": "Repetition of the same initial consonant sound in nearby words"},
        {"front": "What does 'synonym' mean?", "back": "A word that has the same or similar meaning as another word"},
        {"front": "What is a 'stanza' in a poem?", "back": "A group of lines in a poem, similar to a paragraph in prose"}
    ]}

def get_hindi_fill_blanks(title, filename):
    if "surdas" in filename or "soor" in filename:
        return {"sentence": "सूरदास ___ के प्रमुख कवि थे और उन्होंने ___ की लीलाओं का वर्णन किया।", "blanks": ["भक्तिकाल", "श्रीकृष्ण"]}
    if "sangya" in filename or "sarvnaam" in filename:
        return {"sentence": "किसी व्यक्ति, स्थान या वस्तु के नाम को ___ कहते हैं, और संज्ञा के स्थान पर प्रयोग होने वाले शब्द को ___ कहते हैं।", "blanks": ["संज्ञा", "सर्वनाम"]}
    if "vigyapan" in filename:
        return {"sentence": "___ किसी उत्पाद या सेवा को बेचने के लिए जनता को आकर्षित करने का माध्यम है, जबकि ___ समाचारों की जानकारी देता है।", "blanks": ["विज्ञापन", "समाचार पत्र"]}
    return {"sentence": "हिंदी भाषा में ___ वर्णमाला के स्वर होते हैं और ___ व्यंजन होते हैं।", "blanks": ["11", "33"]}

def get_marathi_scramble(title, filename):
    if "prarthana" in filename:
        return {"words": [{"scrambled": "AAANHRPTR", "answer": "PRARTHANA", "hint": "देवाला केलेली विनंती (Prayer)"}]}
    if "gopal" in filename:
        return {"words": [{"scrambled": "AAYUSRH", "answer": "SHAURYA", "hint": "धाडस किंवा शौर्य (Bravery)"}]}
    if "tap" in filename:
        return {"words": [{"scrambled": "AASDPNI", "answer": "PADANI", "hint": "पाणी (Water drops)"}]}
    return {"words": [{"scrambled": "AAHTMAR", "answer": "MARATHA", "hint": "महाराष्ट्रातील एक प्रसिद्ध समाज (A famous community of Maharashtra)"}]}

def process_all_files():
    files = sorted([f for f in os.listdir(CHAPTERS_DIR) if f.endswith('.json') and f != 'README.md'])
    print(f"Found {len(files)} JSON files to process")
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for filename in files:
        filepath = os.path.join(CHAPTERS_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Skip if already has interactiveElement
            if 'interactiveElement' in data:
                print(f"  SKIP (already has interactiveElement): {filename}")
                skip_count += 1
                continue
            
            metadata = data.get('metadata', {})
            interactive = get_interactive_element(filename, metadata)
            data['interactiveElement'] = interactive
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ [{interactive['type']}] {filename}")
            success_count += 1
            
        except Exception as e:
            print(f"  ✗ ERROR {filename}: {e}")
            error_count += 1
    
    print(f"\nDone! Success: {success_count}, Skipped: {skip_count}, Errors: {error_count}")
    return success_count, skip_count, error_count

if __name__ == '__main__':
    process_all_files()
