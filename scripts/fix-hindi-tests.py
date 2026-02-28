#!/usr/bin/env python3
"""Add 3 extra test questions to each Hindi chapter that only has 5."""
import json, os

CHAPTERS_DIR = "/opt/h-arya/content/chapters"

EXTRA_QUESTIONS = {
    "chapter-3-hindi-dadi-maa-ka-parivar.json": [
        {"id": "t6", "question": "दादी माँ की कहानी में परिवार के किस मूल्य पर जोर दिया गया है?", "options": ["स्वार्थ", "प्रेम और एकता", "लालच", "ईर्ष्या"], "correctAnswer": "B", "explanation": "दादी माँ की कहानी में परिवार के प्रेम और एकता के मूल्य पर जोर दिया गया है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "'परिवार' शब्द का अर्थ क्या है?", "options": ["अकेलापन", "एक साथ रहने वाले लोगों का समूह", "शत्रुता", "व्यापार"], "correctAnswer": "B", "explanation": "परिवार उन लोगों का समूह है जो एक साथ रहते हैं और एक-दूसरे की देखभाल करते हैं।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "बड़े-बुजुर्गों का सम्मान क्यों करना चाहिए?", "options": ["क्योंकि वे डरावने होते हैं", "क्योंकि उनका अनुभव और ज्ञान मूल्यवान है", "क्योंकि वे कमज़ोर होते हैं", "क्योंकि वे पैसे देते हैं"], "correctAnswer": "B", "explanation": "बड़े-बुजुर्गों का अनुभव और ज्ञान हमारे जीवन को सही दिशा देता है।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-4-hindi-dehat-aur-shahar.json": [
        {"id": "t6", "question": "गाँव और शहर में मुख्य अंतर क्या है?", "options": ["भाषा", "जीवनशैली और सुविधाएँ", "धर्म", "खानपान"], "correctAnswer": "B", "explanation": "गाँव और शहर की जीवनशैली, सुविधाएँ और वातावरण में बड़ा अंतर होता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "शहरीकरण का क्या अर्थ है?", "options": ["गाँव बनाना", "लोगों का शहरों की ओर जाना", "खेती करना", "पेड़ लगाना"], "correctAnswer": "B", "explanation": "शहरीकरण वह प्रक्रिया है जिसमें लोग रोजगार और सुविधाओं के लिए गाँवों से शहरों की ओर जाते हैं।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "गाँव की अर्थव्यवस्था मुख्यतः किस पर निर्भर है?", "options": ["उद्योग", "कृषि", "व्यापार", "शिक्षा"], "correctAnswer": "B", "explanation": "गाँव की अर्थव्यवस्था मुख्यतः कृषि पर निर्भर होती है।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-5-hindi-bandar-ka-dhandha.json": [
        {"id": "t6", "question": "बंदर के धंधे की कहानी से क्या नैतिक शिक्षा मिलती है?", "options": ["चालाकी से धोखा देना चाहिए", "ईमानदारी और मेहनत से काम करना चाहिए", "दूसरों से चीज़ें चुरानी चाहिए", "काम न करना बेहतर है"], "correctAnswer": "B", "explanation": "यह कहानी सिखाती है कि ईमानदारी और मेहनत से ही सच्ची सफलता मिलती है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "'धंधा' शब्द का अर्थ क्या है?", "options": ["खेल", "व्यवसाय या काम", "शिक्षा", "युद्ध"], "correctAnswer": "B", "explanation": "धंधा का अर्थ है व्यवसाय या कोई काम-काज।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "जानवरों पर आधारित कहानियाँ किस साहित्य विधा का हिस्सा हैं?", "options": ["इतिहास", "नाटक", "दंतकथा/फेबल", "आत्मकथा"], "correctAnswer": "C", "explanation": "जानवरों के माध्यम से नैतिक शिक्षा देने वाली कहानियाँ दंतकथा (Fable) कहलाती हैं।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-6-hindi-prithvi-se-agni-tak.json": [
        {"id": "t6", "question": "वैज्ञानिक प्रगति के लिए क्या आवश्यक है?", "options": ["आलस्य", "जिज्ञासा और मेहनत", "भाग्य", "धन"], "correctAnswer": "B", "explanation": "वैज्ञानिक प्रगति के लिए जिज्ञासा, कठोर परिश्रम और लगन आवश्यक है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "अग्नि की खोज मानव इतिहास में क्यों महत्वपूर्ण थी?", "options": ["यह खतरनाक थी", "इसने खाना पकाना, गर्माहट और सुरक्षा दी", "यह सिर्फ रोशनी के लिए थी", "यह बेकार थी"], "correctAnswer": "B", "explanation": "अग्नि की खोज ने मानव को खाना पकाने, ठंड से बचाव और जंगली जानवरों से सुरक्षा प्रदान की।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "पृथ्वी से अग्नि तक की यात्रा का प्रतीकात्मक अर्थ क्या है?", "options": ["यात्रा करना", "मानव की प्रगति और विकास", "आग लगाना", "ग्रह घूमना"], "correctAnswer": "B", "explanation": "यह यात्रा मानव के आदिम जीवन से तकनीकी और वैज्ञानिक विकास की यात्रा का प्रतीक है।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-7-hindi-jahan-chah-wahan-rah.json": [
        {"id": "t6", "question": "'जहाँ चाह वहाँ राह' कहावत का अर्थ क्या है?", "options": ["रास्ते पर चलना", "इच्छाशक्ति हो तो रास्ता निकल आता है", "सड़क बनाना", "यात्रा करना"], "correctAnswer": "B", "explanation": "इस कहावत का अर्थ है कि जहाँ दृढ़ इच्छाशक्ति और लगन हो, वहाँ सफलता का रास्ता ज़रूर मिलता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "दृढ़ निश्चय का क्या अर्थ है?", "options": ["कमज़ोर इरादा", "पक्का और मज़बूत संकल्प", "उदासीनता", "भय"], "correctAnswer": "B", "explanation": "दृढ़ निश्चय का अर्थ है किसी काम को पूरा करने का पक्का और अटल इरादा।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "सफलता के लिए सबसे ज़रूरी गुण कौन-सा है?", "options": ["भाग्य", "लगन और परिश्रम", "दिखावा", "सोना"], "correctAnswer": "B", "explanation": "सफलता के लिए लगन, परिश्रम और दृढ़ इच्छाशक्ति सबसे ज़रूरी गुण हैं।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-8-hindi-shabd-sampada.json": [
        {"id": "t6", "question": "शब्द सम्पदा का अर्थ क्या है?", "options": ["संख्या ज्ञान", "शब्दों का भंडार और ज्ञान", "पैसों की सम्पत्ति", "भूमि"], "correctAnswer": "B", "explanation": "शब्द सम्पदा का अर्थ है शब्दों का विशाल भंडार जो भाषा को समृद्ध बनाता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "पर्यायवाची शब्द किसे कहते हैं?", "options": ["विपरीत अर्थ वाले शब्द", "समान अर्थ वाले शब्द", "जुड़े हुए शब्द", "अनेक अर्थ वाले शब्द"], "correctAnswer": "B", "explanation": "पर्यायवाची शब्द वे होते हैं जिनका अर्थ समान या मिलता-जुलता हो।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "विलोम शब्द का क्या अर्थ है?", "options": ["समान अर्थ वाले शब्द", "विपरीत अर्थ वाले शब्द", "अनेकार्थी शब्द", "तत्सम शब्द"], "correctAnswer": "B", "explanation": "विलोम शब्द वे होते हैं जिनका अर्थ एक-दूसरे के विपरीत हो। जैसे: दिन-रात, सुख-दुख।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-9-hindi-phool-aur-kante.json": [
        {"id": "t6", "question": "फूल और काँटे किसके प्रतीक हैं?", "options": ["पेड़ और पौधे", "सुख और दुख", "गर्मी और सर्दी", "दिन और रात"], "correctAnswer": "B", "explanation": "फूल सुख और सकारात्मकता का प्रतीक है, जबकि काँटे कठिनाई और दुख के प्रतीक हैं।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "जीवन में कठिनाइयों का सामना कैसे करना चाहिए?", "options": ["घबराकर भाग जाना चाहिए", "साहस और धैर्य से", "दूसरों को दोष देकर", "रोकर बैठ जाना चाहिए"], "correctAnswer": "B", "explanation": "जीवन की कठिनाइयों का सामना साहस, धैर्य और सकारात्मक सोच से करना चाहिए।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "प्रकृति से हमें कौन-सी प्रेरणा मिलती है?", "options": ["आलस्य की", "हार मानने की", "निरंतर आगे बढ़ते रहने की", "कुछ न करने की"], "correctAnswer": "C", "explanation": "प्रकृति हमें निरंतर आगे बढ़ते रहने, परिवर्तन स्वीकार करने और जीवन जीने की प्रेरणा देती है।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-10-hindi-beti-yug.json": [
        {"id": "t6", "question": "बेटी युग का क्या तात्पर्य है?", "options": ["लड़कियों की उपेक्षा", "लड़कियों के सशक्तिकरण और समान अवसरों का युग", "पुराने रीति-रिवाज", "केवल लड़कों का समय"], "correctAnswer": "B", "explanation": "बेटी युग का तात्पर्य है लड़कियों को समान अवसर, शिक्षा और सम्मान मिलने का युग।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "बेटी बचाओ, बेटी पढ़ाओ योजना का मुख्य उद्देश्य क्या है?", "options": ["लड़कियों को घर में रखना", "लड़कियों की शिक्षा और सुरक्षा को बढ़ावा देना", "केवल सरकारी काम", "लड़कों की मदद करना"], "correctAnswer": "B", "explanation": "यह योजना लड़कियों की शिक्षा, सुरक्षा और सम्मान को बढ़ावा देने के लिए शुरू की गई है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "समाज में लड़कियों और लड़कों को कैसा दर्जा मिलना चाहिए?", "options": ["लड़कों को ज़्यादा", "लड़कियों को ज़्यादा", "दोनों को समान", "किसी को नहीं"], "correctAnswer": "C", "explanation": "एक न्यायपूर्ण समाज में लड़कियों और लड़कों दोनों को समान दर्जा, अवसर और सम्मान मिलना चाहिए।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-11-hindi-chanda-mama-ki-jai.json": [
        {"id": "t6", "question": "चाँद को 'चंदा मामा' क्यों कहते हैं?", "options": ["क्योंकि वह दूर है", "बच्चों के लिए प्यार से एक पारिवारिक नाम है", "क्योंकि वह गोल है", "क्योंकि वह सफेद है"], "correctAnswer": "B", "explanation": "भारतीय संस्कृति में चाँद को बच्चों द्वारा प्यार से 'चंदा मामा' कहा जाता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "चाँद की अपनी कोई रोशनी होती है?", "options": ["हाँ, चाँद खुद चमकता है", "नहीं, चाँद सूर्य के प्रकाश को परावर्तित करता है", "चाँद आग से चमकता है", "चाँद बिजली से चमकता है"], "correctAnswer": "B", "explanation": "चाँद की अपनी कोई रोशनी नहीं होती। वह सूर्य के प्रकाश को परावर्तित (reflect) करता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "बाल कविताओं का बच्चों के विकास में क्या महत्व है?", "options": ["कोई महत्व नहीं", "भाषा, कल्पना और रचनात्मकता का विकास होता है", "सिर्फ मनोरंजन", "समय बर्बाद होता है"], "correctAnswer": "B", "explanation": "बाल कविताएँ बच्चों की भाषा, कल्पनाशक्ति, रचनात्मकता और सुनने-समझने की क्षमता विकसित करती हैं।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-12-hindi-rahasya.json": [
        {"id": "t6", "question": "रहस्य कहानी की मुख्य विशेषता क्या है?", "options": ["उबाऊ होना", "जिज्ञासा और रोमांच से भरी होना", "दुखद अंत होना", "कोई घटना न होना"], "correctAnswer": "B", "explanation": "रहस्य कहानी में जिज्ञासा, रोमांच और अनजाने रहस्य को सुलझाने की विशेषता होती है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "जासूसी कहानियों में जासूस क्या करता है?", "options": ["छुपता है", "सुरागों से रहस्य सुलझाता है", "भाग जाता है", "सोता है"], "correctAnswer": "B", "explanation": "जासूस सुरागों (clues) को जोड़कर रहस्य को तर्कपूर्ण ढंग से सुलझाता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "रहस्य साहित्य पढ़ने से क्या लाभ होता है?", "options": ["कोई लाभ नहीं", "तार्किक सोच और जिज्ञासा का विकास", "डर बढ़ता है", "पढ़ाई खराब होती है"], "correctAnswer": "B", "explanation": "रहस्य साहित्य पढ़ने से तार्किक सोच, समस्या-समाधान कौशल और जिज्ञासा का विकास होता है।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-13-hindi-hum-chalte-seena-tan-ke.json": [
        {"id": "t6", "question": "'हम चलते सीना तान के' का भाव क्या है?", "options": ["डरकर चलना", "गर्व और आत्मविश्वास के साथ चलना", "झुककर चलना", "भागकर चलना"], "correctAnswer": "B", "explanation": "यह अभिव्यक्ति गर्व, आत्मविश्वास और दृढ़ता के साथ जीवन में आगे बढ़ने का भाव दर्शाती है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "देशभक्ति गीत का उद्देश्य क्या होता है?", "options": ["दुश्मनों को डराना", "देश के प्रति प्रेम और गर्व जगाना", "केवल गाना सीखना", "परीक्षा पास करना"], "correctAnswer": "B", "explanation": "देशभक्ति गीत नागरिकों में देश के प्रति प्रेम, गर्व और एकता की भावना जगाते हैं।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "एक अच्छे नागरिक का क्या कर्तव्य है?", "options": ["केवल अपने बारे में सोचना", "देश और समाज के प्रति जिम्मेदार होना", "नियम तोड़ना", "कर न देना"], "correctAnswer": "B", "explanation": "एक अच्छे नागरिक का कर्तव्य है कि वह देश और समाज के प्रति जिम्मेदार, ईमानदार और सहयोगी हो।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-14-hindi-vigyapan-aur-samachar.json": [
        {"id": "t6", "question": "विज्ञापन का मुख्य उद्देश्य क्या है?", "options": ["लोगों को नुकसान पहुँचाना", "उत्पाद या सेवा को बेचना और जागरूकता फैलाना", "केवल मनोरंजन करना", "पैसे बर्बाद करना"], "correctAnswer": "B", "explanation": "विज्ञापन का मुख्य उद्देश्य किसी उत्पाद या सेवा के बारे में जागरूकता फैलाना और उसे बेचना है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "समाचार और विज्ञापन में क्या अंतर है?", "options": ["कोई अंतर नहीं", "समाचार तथ्य देता है; विज्ञापन बेचने के लिए होता है", "दोनों झूठ होते हैं", "दोनों एक ही हैं"], "correctAnswer": "B", "explanation": "समाचार वास्तविक घटनाओं की जानकारी देता है, जबकि विज्ञापन किसी उत्पाद/सेवा को बेचने के लिए बनाया जाता है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "भ्रामक विज्ञापनों से कैसे बचा जा सकता है?", "options": ["सब पर विश्वास करके", "जागरूकता और सोच-समझकर निर्णय लेकर", "टीवी बंद करके", "विज्ञापन देखकर तुरंत खरीदकर"], "correctAnswer": "B", "explanation": "भ्रामक विज्ञापनों से बचने के लिए जागरूक रहें, उत्पाद की जाँच करें और सोच-समझकर खरीदारी करें।", "conceptIds": [1], "pageReference": "textbook"}
    ],
    "chapter-15-hindi-swayam-adhyayan-aur-punravratti.json": [
        {"id": "t6", "question": "स्वयं अध्ययन का क्या लाभ है?", "options": ["समय बर्बाद होता है", "आत्मनिर्भरता और गहरी समझ विकसित होती है", "अध्यापक की जरूरत नहीं रहती", "परीक्षा में नकल आसान होती है"], "correctAnswer": "B", "explanation": "स्वयं अध्ययन से आत्मनिर्भरता, गहरी समझ और सीखने की जिज्ञासा विकसित होती है।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t7", "question": "पुनरावृत्ति (Revision) क्यों ज़रूरी है?", "options": ["क्योंकि यह आसान है", "सीखी हुई बातें याद रहती हैं और मजबूत होती हैं", "क्योंकि अध्यापक कहते हैं", "केवल परीक्षा के लिए"], "correctAnswer": "B", "explanation": "पुनरावृत्ति से सीखी हुई बातें दीर्घकालिक स्मृति में जाती हैं और कमज़ोर बिंदु मजबूत होते हैं।", "conceptIds": [1], "pageReference": "textbook"},
        {"id": "t8", "question": "प्रभावी अध्ययन की सबसे अच्छी विधि कौन-सी है?", "options": ["रात भर जागकर पढ़ना", "नियमित अभ्यास और समझकर पढ़ना", "केवल रटना", "पाठ्यपुस्तक न पढ़ना"], "correctAnswer": "B", "explanation": "नियमित अभ्यास, समझकर पढ़ना और पुनरावृत्ति प्रभावी अध्ययन की सर्वोत्तम विधियाँ हैं।", "conceptIds": [1], "pageReference": "textbook"}
    ]
}

updated = 0
for filename, extra_qs in EXTRA_QUESTIONS.items():
    filepath = os.path.join(CHAPTERS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"NOT FOUND: {filename}")
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    current_test = data.get('test', [])
    if len(current_test) >= 8:
        print(f"SKIP (already {len(current_test)} questions): {filename}")
        continue
    data['test'] = current_test + extra_qs
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated {filename}: {len(current_test)} → {len(data['test'])} test questions")
    updated += 1

print(f"\nDone. Updated {updated} files.")
EOF