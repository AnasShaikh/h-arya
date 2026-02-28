import json
import os

def update_file(file_path, long_answers):
    with open(file_path, "r") as f:
        data = json.load(f)
    data["textbookExercise"]["longAnswers"] = long_answers
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

# File 1: Science Chapter 1
update_file("/opt/h-arya/content/chapters/chapter-1-science-7-living-world.json", [
    {
        "id": "la1",
        "question": "Why is the camel called the 'Ship of the desert'?",
        "modelAnswer": "The camel is called the 'Ship of the desert' because of its remarkable adaptations to the harsh desert environment. It has long legs with flat and cushioned soles which help it walk easily on hot, loose sand without sinking. Its nostrils are protected by folds of skin, and it has long, thick eyelashes to keep out sand during storms. Additionally, its thick skin prevents water loss, and it can survive for long periods without water, making it the most reliable mode of transport in deserts.",
        "keyPoints": [
            "Long legs with flat, cushioned soles for walking on sand.",
            "Thick skin to prevent water loss.",
            "Folds of skin to protect nostrils and thick eyelashes.",
            "Ability to survive without water for long periods."
        ],
        "marks": 5
    },
    {
        "id": "la2",
        "question": "How can plants like cactus and acacia live in deserts with scarce water?",
        "modelAnswer": "Desert plants like cactus and acacia are adapted to conserve water. Their leaves are either absent, very small, or modified into spines, which significantly reduces water loss through transpiration. The stem performs photosynthesis in the absence of leaves and becomes fleshy to store water. Furthermore, their roots penetrate deep into the soil or spread wide to absorb even the slightest amount of available moisture.",
        "keyPoints": [
            "Leaves modified into spines to reduce transpiration.",
            "Fleshy green stems that store water and perform photosynthesis.",
            "Deep or wide-spreading roots to absorb maximum water."
        ],
        "marks": 5
    },
    {
        "id": "la3",
        "question": "What is the inter-relationship between adaptations of organisms and their surroundings?",
        "modelAnswer": "Adaptation is a gradual process where changes occur in the body parts and behavior of organisms to help them survive, reproduce, and maintain their existence in a specific environment. The surroundings (climate, food availability, predators) dictate the type of adaptations needed. For example, animals in snowy regions have thick fur for insulation, while desert animals have adaptations to conserve water. This relationship ensures that organisms are best suited to thrive in their particular habitat.",
        "keyPoints": [
            "Adaptation is a gradual change for survival and reproduction.",
            "Environmental factors like climate and food determine the adaptations.",
            "Ensures organisms are suited to their specific habitat."
        ],
        "marks": 5
    },
    {
        "id": "la4",
        "question": "How are organisms classified?",
        "modelAnswer": "Organisms are classified using a hierarchical system developed by Carl Linnaeus. This system, known as biological classification, groups living things based on their similarities and differences. The hierarchy consists of levels: Kingdom, Phylum (for animals) or Division (for plants), Class, Order, Family, Genus, and Species. Additionally, the Binomial Nomenclature system gives each organism a unique two-part scientific name consisting of its Genus and Species (e.g., Mangifera indica for mango).",
        "keyPoints": [
            "Classification is based on similarities and differences.",
            "Hierarchy: Kingdom, Phylum/Division, Class, Order, Family, Genus, Species.",
            "Binomial Nomenclature provides unique scientific names."
        ],
        "marks": 5
    },
    {
        "id": "la5",
        "question": "Why do penguins live in flocks sticking close to each other?",
        "modelAnswer": "Penguins live in the extremely cold polar regions. They live in flocks and stick close to each other primarily to conserve body heat. By huddling together, they reduce the total surface area exposed to the freezing wind and snow, thereby sharing warmth and increasing their chances of survival in sub-zero temperatures. It also provides protection against predators.",
        "keyPoints": [
            "Huddling reduces exposed surface area to cold.",
            "Sharing body heat ensures survival in freezing temperatures.",
            "Provides collective protection against predators."
        ],
        "marks": 3
    }
])

# File 2: History Chapter 12
update_file("/opt/h-arya/content/chapters/chapter-12-history-progression-empire.json", [
    {
        "id": "la1",
        "question": "What was the 'subsidiary alliance' system used by the British?",
        "modelAnswer": "The Subsidiary Alliance was a system introduced by Lord Wellesley to expand British influence in India. Under this system, Indian rulers had to maintain a British military force within their territory at their own expense. In return, the British promised to protect the state from internal and external enemies. However, the ruler could not employ any other Europeans or negotiate with other Indian rulers without British permission, effectively making the state a protectorate of the British.",
        "keyPoints": [
            "Introduced by Lord Wellesley to expand British control.",
            "Indian rulers paid for a British army stationed in their state.",
            "British provided protection against enemies.",
            "Rulers lost independence in foreign affairs and diplomacy."
        ],
        "marks": 5
    },
    {
        "id": "la2",
        "question": "What was the outcome of the Battle of Wadgaon (1779) during the First Anglo-Maratha War?",
        "modelAnswer": "In the Battle of Wadgaon (1779), the Maratha forces led by Mahadji Shinde and Nana Phadnavis used 'guerrilla tactics' and a 'scorched earth policy' to trap the British army. The British were cut off from their food and water supplies and were forced to surrender at Wadgaon. This resulted in the Treaty of Wadgaon, where the British had to return all territories captured since 1773, marking a significant, though temporary, victory for the Maratha Empire.",
        "keyPoints": [
            "Marathas used guerrilla tactics and scorched earth policy.",
            "British army was trapped and forced to surrender.",
            "Treaty of Wadgaon forced British to return captured territories.",
            "Signified the strength of Maratha resistance."
        ],
        "marks": 5
    },
    {
        "id": "la3",
        "question": "Why were Nana Saheb's and Tatya Tope's revolts in 1857 historically connected to the Maratha Swaraj?",
        "modelAnswer": "Nana Saheb Peshwa and Tatya Tope played crucial roles in the Revolt of 1857, which they viewed as a continuation of the struggle for independence (Swaraj). As the adopted son of the last Peshwa, Bajirao II, Nana Saheb sought to reclaim the prestige and authority of the Peshwaship that the British had abolished. Their efforts to unite various Indian rulers against British rule were inspired by the earlier Maratha ideal of defending the motherland from foreign domination.",
        "keyPoints": [
            "Nana Saheb sought to restore the Peshwaship and Maratha honor.",
            "Revolt was seen as a struggle for independence (Swaraj).",
            "Inspired by the Maratha legacy of resisting foreign rule.",
            "Attempted to unite Indian forces against the British."
        ],
        "marks": 5
    }
])

# File 3: Geography Chapter 4
update_file("/opt/h-arya/content/chapters/chapter-4-geography-air-pressure.json", [
    {
        "id": "la1",
        "question": "If cold air sinks and warm air rises, what happens to air pressure when temperature decreases?",
        "modelAnswer": "There is an inverse relationship between temperature and air pressure. When the temperature decreases, the air becomes colder and denser. This heavy air sinks towards the Earth's surface, exerting more force. Consequently, when temperature decreases, air pressure increases, leading to the formation of high-pressure areas.",
        "keyPoints": [
            "Inverse relationship between temperature and air pressure.",
            "Cold air is dense and heavy, causing it to sink.",
            "Sinking air increases the force exerted on the surface, raising pressure."
        ],
        "marks": 4
    },
    {
        "id": "la2",
        "question": "Why are pressure belts narrower than temperature zones?",
        "modelAnswer": "Temperature zones are broad areas determined primarily by the Earth's shape and the angle of sun rays (Torrid, Temperate, and Frigid zones). Pressure belts, however, are formed not just by temperature but also by the Earth's rotation (centrifugal force). While temperature zones are continuous from the equator to the poles, pressure belts are broken into smaller, distinct latitudinal bands (e.g., Equatorial Low, Subtropical High) because the rising and sinking of air occurs at specific latitudes, making them narrower.",
        "keyPoints": [
            "Temperature zones depend mainly on the angle of sun rays.",
            "Pressure belts are influenced by both temperature and Earth's rotation.",
            "Rising and sinking of air happens at specific latitudinal bands.",
            "Rotation breaks the continuous temperature gradient into narrower belts."
        ],
        "marks": 5
    },
    {
        "id": "la3",
        "question": "How does air pressure affect the human body?",
        "modelAnswer": "The human body is adapted to the air pressure at the Earth's surface. Although air exerts a huge pressure on us, we don't feel it because our internal body pressure (blood pressure, etc.) balances it out. However, at very high altitudes, the air pressure decreases significantly. This can cause the pressure inside our bodies to become higher than the outside air, leading to discomfort, ear popping, or even bleeding from the nose in extreme cases.",
        "keyPoints": [
            "Internal body pressure balances external atmospheric pressure.",
            "Air pressure decreases at high altitudes.",
            "Pressure imbalance can cause physical discomfort or nosebleeds."
        ],
        "marks": 4
    }
])

# File 4: Science Chapter 2
update_file("/opt/h-arya/content/chapters/chapter-2-science-7-plants.json", [
    {
        "id": "la1",
        "question": "Describe the structure of a typical flower in your own words.",
        "modelAnswer": "A typical flower consists of four main parts: Calyx, Corolla, Androecium, and Gynoecium. The Calyx is the outermost green part (sepals) that protects the flower in the bud stage. The Corolla is the colorful part made of petals that attracts insects. The Androecium is the male reproductive part consisting of stamens (anther and filament). The Gynoecium is the female reproductive part consisting of carpels (stigma, style, and ovary). These parts are arranged on the thalamus, which is the expanded end of the flower stalk or pedicel.",
        "keyPoints": [
            "Calyx: Protective green sepals.",
            "Corolla: Colorful petals to attract pollinators.",
            "Androecium: Male part with stamens.",
            "Gynoecium: Female part with carpels (stigma, style, ovary)."
        ],
        "marks": 5
    },
    {
        "id": "la2",
        "question": "What is the difference between Tap Roots and Fibrous Roots?",
        "modelAnswer": "Dicotyledonous plants usually have a tap root system, which consists of a primary root that grows deep into the soil and produces secondary roots. In contrast, monocotyledonous plants have a fibrous root system, where a cluster of thin, thread-like roots grows from the base of the stem. Tap roots provide stronger anchorage and go deeper, while fibrous roots are more spread out near the surface.",
        "keyPoints": [
            "Tap roots: One main primary root with branches (Dicot plants).",
            "Fibrous roots: Cluster of thin roots from the stem base (Monocot plants).",
            "Tap roots provide better deep anchorage; fibrous roots spread wide."
        ],
        "marks": 4
    },
    {
        "id": "la3",
        "question": "Explain the process of germination of a seed.",
        "modelAnswer": "Germination is the process by which a seed develops into a new plant. When a seed receives proper water, air, and warmth, the embryo inside begins to grow. The part that grows towards the soil is called the radicle (which becomes the root), and the part that grows upwards out of the soil is called the plumule (which becomes the shoot). As the plant grows, it uses the food stored in the seed until it can perform photosynthesis.",
        "keyPoints": [
            "Requires water, air, and warmth.",
            "Radicle grows downwards into the soil (becomes root).",
            "Plumule grows upwards out of the soil (becomes shoot)."
        ],
        "marks": 5
    }
])

# File 5: History Chapter 2
update_file("/opt/h-arya/content/chapters/chapter-2-history-india-before-shivaji.json", [
    {
        "id": "la1",
        "question": "What was unique about Akbar's attitude toward other religions?",
        "modelAnswer": "Akbar was known for his policy of religious tolerance and harmony. He believed in 'Sulh-e-kul', which means 'peace for all'. He treated people of all faiths with respect and abolished discriminatory taxes like the Jizya. Akbar even founded a new religious path called 'Din-i-Ilahi', which incorporated good elements from various religions. He held discussions with scholars of different religions in his 'Ibadat Khana' to understand their teachings.",
        "keyPoints": [
            "Followed the policy of Sulh-e-kul (peace for all).",
            "Abolished discriminatory taxes on non-Muslims.",
            "Founded Din-i-Ilahi based on universal virtues.",
            "Encouraged inter-faith dialogue in the Ibadat Khana."
        ],
        "marks": 5
    },
    {
        "id": "la2",
        "question": "Who was Maharana Pratap and why is he remembered in Indian history?",
        "modelAnswer": "Maharana Pratap was the ruler of Mewar who is legendary for his fierce resistance against the Mughal Emperor Akbar. Despite having fewer resources, he refused to submit to Mughal authority and fought for the independence of his kingdom. He is remembered for his incredible bravery, self-respect, and sacrifice, especially during the Battle of Haldighati. His struggle represents the spirit of 'Swaraj' and patriotism.",
        "keyPoints": [
            "Ruler of Mewar who resisted Akbar's expansion.",
            "Fought for the independence and honor of his kingdom.",
            "Legendary for his bravery and sacrifice at the Battle of Haldighati.",
            "Symbol of patriotism and resistance against foreign domination."
        ],
        "marks": 5
    },
    {
        "id": "la3",
        "question": "Describe the contribution of Krishnadevaraya to the Vijayanagara Empire.",
        "modelAnswer": "Krishnadevaraya was the most powerful ruler of the Vijayanagara Empire. He expanded the empire by defeating the Sultans of Bijapur and Golconda. He was not only a great warrior but also a scholar and a patron of art and literature. He wrote the Telugu work 'Amuktamalyada' and built the famous Hazar Rama and Vitthala temples. His reign is considered the 'Golden Age' of Telugu literature.",
        "keyPoints": [
            "Expanded the empire and defeated neighboring Sultans.",
            "A great scholar and author of 'Amuktamalyada'.",
            "Patronized art and built magnificent temples like Vitthala temple.",
            "His reign marked the peak of the Vijayanagara Empire's glory."
        ],
        "marks": 5
    }
])
