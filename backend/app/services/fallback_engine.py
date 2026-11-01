import math
from typing import Dict, Any, List
from backend.app.schemas.ai_plan import (
    AIPlanGenerated,
    AIPlanBudgetBlock,
    AIPlanBudgetItem,
    AIPlanTimelineItem,
    AIPlanVendorItem,
    AIPlanScheduleItem,
)

def generate_fallback_plan(
    event_type: str,
    name: str,
    city: str,
    guest_count: int,
    total_budget: float,
    currency: str = "INR",
    language: str = "en",
    theme_preference: str = "",
    dietary_requirements: str = "",
    indoor_outdoor: str = "flexible",
    additional_notes: str = "",
    event_date: str = "",
    reason: str = "Deterministic rules-based planning engine activated"
) -> AIPlanGenerated:
    """
    Generates a realistic, highly personalized, and fully localized event plan
    for English, Hindi, and Gujarati without external API dependencies.
    """
    lang = language.lower() if language else "en"
    if lang not in ["en", "hi", "gu"]:
        lang = "en"

    # Category percentage allocations based on event type
    if event_type.lower() == "wedding":
        allocations = [
            ("Venue & Mandap", 0.28, "Venue booking, stage setup, and basic amenities"),
            ("Catering & Feasts", 0.35, f"Custom multi-course celebration menu for {guest_count} guests"),
            ("Decoration & Florals", 0.15, "Entrance arch, stage backdrop, floral accents, lighting"),
            ("Photography & Video", 0.10, "Candid photography, ceremony coverage, traditional album"),
            ("Entertainment & Music", 0.07, "DJ, Sangeet sound system, live dhol/instrumental"),
            ("Contingency & Hospitality", 0.05, "Guest coordination, welcome hampers, emergency reserve"),
        ]
    elif event_type.lower() == "birthday":
        per_head = round((total_budget * 0.45) / max(1, guest_count))
        allocations = [
            ("Vegetarian Dinner Buffet", 0.45, f"Complete celebration feast for {guest_count} guests (approx ₹{per_head} per head)"),
            ("Birthday Cake & Desserts", 0.075, "Custom themed celebration cake and specialty sweet course"),
            ("Balloon Decoration & Arch", 0.08, "Themed balloon arch, entrance pillars, and colorful party accents"),
            ("Backdrop & Stage Setup", 0.07, "Photo booth backdrop, stage garland, and celebration banner"),
            ("Table Setup & Seating", 0.05, "Centerpieces, seating arrangement, and mood lighting"),
            ("Music & Sound System", 0.10, "Party sound system, DJ music playlist, and wireless microphones"),
            ("Photography & Portraits", 0.125, "Candid photography coverage, cake cutting moments, and family portraits"),
            ("Emergency Contingency Buffer", 0.05, "Operational reserve for unexpected expenses and contingency"),
        ]
    elif event_type.lower() == "community":
        allocations = [
            ("Community Venue & Logistics", 0.30, f"Public ground, hall, seating, permits for {guest_count} attendees"),
            ("Prasadam & Community Refreshments", 0.32, "Wholesome community feast, snacks, hydration stations"),
            ("Stage & Traditional Decor", 0.14, "Stage dais, festoons, banners, floral garlands"),
            ("Sound System & Public Address", 0.12, "PA system, mics, community announcements, cultural music"),
            ("Security & Sanitation", 0.07, "Volunteer safety kits, waste management, first aid booth"),
            ("Buffer & Miscellaneous", 0.05, "Honorariums, transport, unforeseen logistics"),
        ]
    else:
        allocations = [
            ("Venue Booking", 0.28, f"Space suitable for {guest_count} guests"),
            ("Food & Beverage", 0.36, "Appetizers, main meal, and beverages"),
            ("Decor & Atmosphere", 0.15, "Lighting, floral, seating design"),
            ("Photo & Media", 0.09, "Event media coverage and photos"),
            ("Entertainment & Audio", 0.07, "Background sound, music, presentation display"),
            ("Buffer Reserve", 0.05, "Operational reserves and miscellaneous"),
        ]

    # Calculate monetary amounts with exact minor-unit decimal sum matching
    budget_items: List[AIPlanBudgetItem] = []
    allocated_sum = 0.0
    for idx, (cat_name, pct, desc) in enumerate(allocations):
        if idx == len(allocations) - 1:
            # Assign remainder to ensure sum matches total_budget
            amount = max(0.0, round(total_budget - allocated_sum, 2))
        else:
            amount = round(total_budget * pct, 2)
            allocated_sum += amount

        # Localize category names if needed
        localized_cat = cat_name
        localized_desc = desc
        if lang == "hi":
            hi_cat_map = {
                "Venue & Mandap": "स्थान और मंडप (Venue)",
                "Catering & Feasts": "खान-पान और भोजन (Catering)",
                "Decoration & Florals": "सजावट और फूल (Decoration)",
                "Photography & Video": "फोटोग्राफी और वीडियोग्राफी",
                "Entertainment & Music": "मनोरंजन और संगीत (Entertainment)",
                "Contingency & Hospitality": "आकस्मिक व्यय और अतिथि सत्कार",
                "Vegetarian Dinner Buffet": "शाकाहारी रात्रिभोज (Dinner Buffet)",
                "Birthday Cake & Desserts": "बर्थडे केक और मिष्ठान",
                "Balloon Decoration & Arch": "गुब्बारा सजावट और प्रवेश द्वार",
                "Backdrop & Stage Setup": "स्टेज और फोटो बैकड्रॉप",
                "Table Setup & Seating": "टेबल व्यवस्था और लाइटिंग",
                "Music & Sound System": "संगीत और साउंड सिस्टम",
                "Photography & Portraits": "फोटोग्राफी और पोर्ट्रेट्स",
                "Emergency Contingency Buffer": "आपातकालीन आरक्षित निधि (Contingency)",
                "Venue & Space Rental": "स्थान किराया (Venue)",
                "Catering & Birthday Cake": "केक और खान-पान",
                "Themed Decoration & Balloons": "थीम सजावट और गुब्बारे",
                "Photography & Mini Video": "फोटोग्राफी",
                "Games & Entertainment": "खेल और मनोरंजन",
                "Party Supplies & Emergency": "पार्टी सामग्री और आरक्षित राशि",
                "Community Venue & Logistics": "सामुदायिक स्थल और व्यवस्था",
                "Prasadam & Community Refreshments": "प्रसादम और जलपान",
                "Stage & Traditional Decor": "मंच और पारंपरिक सजावट",
                "Sound System & Public Address": "ध्वनि प्रणाली (Sound & PA)",
                "Security & Sanitation": "सुरक्षा और स्वच्छता",
                "Buffer & Miscellaneous": "विविध आरक्षित निधि",
                "Venue Booking": "स्थान आरक्षण (Venue)",
                "Food & Beverage": "भोजन और पेय",
                "Decor & Atmosphere": "सजावट",
                "Photo & Media": "फोटो एवं मीडिया",
                "Entertainment & Audio": "मनोरंजन और साउंड",
                "Buffer Reserve": "आरक्षित बजट"
            }
            localized_cat = hi_cat_map.get(cat_name, cat_name)
        elif lang == "gu":
            gu_cat_map = {
                "Venue & Mandap": "સ્થળ અને મંડપ (Venue)",
                "Catering & Feasts": "કેટરિંગ અને ભોજન (Catering)",
                "Decoration & Florals": "ડેકોરેશન અને ફૂલો",
                "Photography & Video": "ફોટોગ્રાફી અને વિડિયો",
                "Entertainment & Music": "સંગીત અને મનોરંજન",
                "Contingency & Hospitality": "અતિથિ સત્કાર અને આકસ્મિક ખર્ચ",
                "Vegetarian Dinner Buffet": "શાકાહારી ભોજન (Dinner Buffet)",
                "Birthday Cake & Desserts": "બર્થડે કેક અને મીઠાઈ",
                "Balloon Decoration & Arch": "ફુગ્ગા ડેકોરેશન અને પ્રવેશદ્વાર",
                "Backdrop & Stage Setup": "સ્ટેજ અને ફોટો બેકડ્રોપ",
                "Table Setup & Seating": "ટેબલ વ્યવસ્થા અને લાઇટિંગ",
                "Music & Sound System": "સંગીત અને સાઉન્ડ સિસ્ટમ",
                "Photography & Portraits": "ફોટોગ્રાફી અને પોર્ટ્રેટ્સ",
                "Emergency Contingency Buffer": "આકસ્મિક અનામત રકમ (Contingency)",
                "Venue & Space Rental": "પાર્ટી હોલ / જગ્યાનું ભાડું",
                "Catering & Birthday Cake": "કેક અને ભોજન વ્યવસ્થા",
                "Themed Decoration & Balloons": "થીમ ડેકોરેશન અને ફુગ્ગા",
                "Photography & Mini Video": "ફોટોગ્રાફી",
                "Games & Entertainment": "રમતો અને મનોરંજન",
                "Party Supplies & Emergency": "સામગ્રી અને અનામત બજેટ",
                "Community Venue & Logistics": "સામુદાયિક સ્થળ અને વ્યવસ્થા",
                "Prasadam & Community Refreshments": "પ્રસાદ અને અલ્પાહાર",
                "Stage & Traditional Decor": "સ્ટેજ અને પરંપરાગત શણગાર",
                "Sound System & Public Address": "સાઉન્ડ સિસ્ટમ (PA)",
                "Security & Sanitation": "સુરક્ષા અને સ્વચ્છતા",
                "Buffer & Miscellaneous": "પરચૂરણ અનામત રકમ",
                "Venue Booking": "સ્થળ બુકિંગ",
                "Food & Beverage": "જમણવાર અને પીણાં",
                "Decor & Atmosphere": "સુશોભન અને વાતાવરણ",
                "Photo & Media": "ફોટો અને મીડિયા",
                "Entertainment & Audio": "મનોરંજન અને ઓડિયો",
                "Buffer Reserve": "અનામત બજેટ"
            }
            localized_cat = gu_cat_map.get(cat_name, cat_name)

        budget_items.append(
            AIPlanBudgetItem(
                category=localized_cat,
                item_name=f"{localized_cat} Allocation",
                estimated_amount=amount,
                reason=localized_desc
            )
        )

    # Theme and context builder
    theme_text = theme_preference.strip() if theme_preference else ("Classic Celebratory Elegance" if lang == "en" else ("पारंपरिक उत्सव शैली" if lang == "hi" else "પરંપરાગત ઉત્સવ શૈલી"))
    dietary_info = f"Dietary notes: {dietary_requirements}" if dietary_requirements else "Standard healthy multi-cuisine hospitality"

    # Multilingual content dictionaries
    if lang == "hi":
        summary = (
            f"‘{name}’ के लिए एक सुव्यवस्थित उत्सव योजना। "
            f"यह आयोजन {city} में {guest_count} अतिथियों के लिए ₹{total_budget:,.0f} {currency} के बजट में तैयार किया गया है। "
            f"थीम: {theme_text}। {dietary_info}।"
        )
        ideas = [
            f"{city} के स्थानीय स्वादों और सांस्कृतिक तत्वों का स्वागत सत्कार में समावेश करें।",
            "अतिथियों के लिए एक आकर्षक फोटो बूथ बनाएं जहां वे यादगार तस्वीरें ले सकें।",
            "पारंपरिक संगीत और स्वागत ड्रिंक के साथ अतिथियों का आत्मीय स्वागत करें।",
            f"अतिथियों के लिए व्यक्तिगत धन्यवाद कार्ड या उपहार (Return Gift) की व्यवस्था करें।"
        ]
        contingency_list = [
            "मौसम परिवर्तन (गर्मी या बारिश) की स्थिति में इनडोर हॉल या वॉटरप्रूफ शेड का बैकअप तैयार रखें।",
            "बिजली जाने की स्थिति में जेनरेटर और आपातकालीन लाइट की व्यवस्था सुनिश्चित करें।",
            "प्राथमिक चिकित्सा किट और अतिरिक्त 10% भोजन की अग्रिम तैयारी रखें।"
        ]
        prep_steps = [
            f"{city} में पसंदीदा वेन्यू और कैटरर की उपलब्धता जांचें और अग्रिम राशि देकर बुक करें।",
            "अतिथि सूची को अंतिम रूप दें और डिजिटल या प्रिंटेड निमंत्रण भेजें।",
            "सजावट, संगीत और फोटोग्राफर के साथ कार्यक्रम के समय पर विस्तृत चर्चा करें।",
            "आयोजन से 2 दिन पहले सभी व्यवस्थाओं और जिम्मेदारियों की समीक्षा करें।"
        ]
        timeline = [
            AIPlanTimelineItem(
                title=f"{city} में वेन्यू को अंतिम रूप दें और बुक करें",
                description="स्थान की क्षमता, पार्किंग और बेसिक सुविधाओं की पुष्टि करें।",
                due_date=event_date or "कार्यक्रम से 4 सप्ताह पूर्व",
                milestone_phase="4_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="कैटरिंग मेनू और खान-पान तय करें",
                description=f"{guest_count} मेहमानों के लिए मेनू और स्वाद परीक्षण (Tasting) पूरा करें।",
                due_date=event_date or "कार्यक्रम से 3 सप्ताह पूर्व",
                milestone_phase="3_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="सजावट और थीम व्यवस्था निर्धारित करें",
                description=f"थीम: '{theme_text}' के अनुसार स्टेज और प्रवेश द्वार की योजना बनाएं।",
                due_date=event_date or "कार्यक्रम से 2 सप्ताह पूर्व",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="फोटोग्राफर और संगीतकार / डीजे बुक करें",
                description="कवरेज का समय, उपकरण और मुख्य पलों की सूची साझा करें।",
                due_date=event_date or "कार्यक्रम से 10 दिन पूर्व",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="अंतिम निमंत्रण और पुष्टि (RSVP) एकत्र करें",
                description=f"अनुमानित {guest_count} मेहमानों की संख्या की कैटरर से पुष्टि करें।",
                due_date=event_date or "कार्यक्रम से 5 दिन पूर्व",
                milestone_phase="1_week_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="आयोजन दिवस का पूर्वाभ्यास और सामग्री जांच",
                description="साउंड सिस्टम, लाइट और स्वागत उपहारों की जांच करें।",
                due_date=event_date or "कार्यक्रम से 1 दिन पूर्व",
                milestone_phase="day_before",
                priority="high",
                status="pending"
            ),
        ]
        vendors = [
            AIPlanVendorItem(
                category="वेन्यू / स्थल (Venue)",
                suggested_title=f"{city} बैंक्वेट / पार्टी हॉल",
                requirements=["कम से कम 60 लोगों की क्षमता", "पर्याप्त पार्किंग", "एयर कंडीशनिंग / वेंटिलेशन"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="कैटरिंग (Catering)",
                suggested_title="स्थानीय स्वादिष्ट कैटरर",
                requirements=["लाइव काउंटर सुविधा", "स्वच्छता प्रमाणन", "शाकाहारी/जैन विकल्प"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="सजावट (Decoration)",
                suggested_title="इवेंट डेकोरेटर",
                requirements=["थीम आधारित प्रवेश द्वार", "स्टेज बैकड्रॉप", "एलईडी व मूड लाइटिंग"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="फोटोग्राफी (Photography)",
                suggested_title="कैंडिड फोटोग्राफर",
                requirements=["हाई-रेजोल्यूशन डिजिटल तस्वीरें", "ड्रोन/गिम्बल कवरेज", "1 सप्ताह में डिलीवरी"],
                status="not_contacted"
            )
        ]
        schedule = [
            AIPlanScheduleItem(time_slot="04:00 PM - 04:30 PM", activity="अतिथियों का आगमन, स्वागत ड्रिंक्स और फोटो सत्र", notes="स्वागत डेस्क पर माला या उपहार"),
            AIPlanScheduleItem(time_slot="04:30 PM - 05:45 PM", activity="बच्चों और अतिथियों के लिए खेल (म्यूजिकल चेयर, ट्रेजर हंट, फ्रीज डांस)", notes="एक्टिविटी एंकर द्वारा संचालन"),
            AIPlanScheduleItem(time_slot="05:45 PM - 06:30 PM", activity="मुख्य उत्सव, केक कटिंग और पारिवारिक फोटो सेशन", notes="45 मिनट का मुख्य समारोह"),
            AIPlanScheduleItem(time_slot="06:30 PM - 07:30 PM", activity="शाही शाकाहारी रात्रिभोज और मेल-मिलाप", notes="कैटरिंग सर्विस सुचारू रहे (1 घंटा)"),
            AIPlanScheduleItem(time_slot="07:30 PM - 07:45 PM", activity="धन्यवाद ज्ञापन और रिटर्न गिफ्ट्स वितरण", notes="विदाई और शुभकामनाएं")
        ]

    elif lang == "gu":
        summary = (
            f"‘{name}’ માટે સર્વાંગી આયોજન રૂપરેખા. "
            f"{city} ખાતે {guest_count} મહેમાનો માટે ₹{total_budget:,.0f} {currency} ના બજેટમાં આ યોજના તૈયાર કરાઈ છે. "
            f"થીમ: {theme_text}. {dietary_info}."
        )
        ideas = [
            f"{city} ની પરંપરાગત મહેમાનગતિ અને ગુજરાતી મીઠાઈ/નાસ્તાનો સમાવેશ કરવો.",
            "પરિવાર અને સ્નેહીજનો માટે સુંદર સેલ્ફી અને ફોટો બૂથ ગોઠવવું.",
            "બાળકો અને મહેમાનો માટે 3-4 રમતો યોજવી: મ્યુઝિકલ ચેર, ટ્રેઝર હન્ટ, ફ્રીઝ ડાન્સ અને પાસિંગ ધ પાર્સલ.",
            f"આવનાર દરેક મહેમાનને સ્મૃતિ ભેટ (Return Gift) આપીને આભાર માનવો."
        ]
        contingency_list = [
            "જો વાતાવરણમાં ફેરફાર થાય તો ઇન્ડોર હોલ અથવા વોટરપ્રૂફ મંડપની વ્યવસ્થા રાખવી.",
            "વીજળીના વિક્ષેપ સામે જનરેટર તથા બેકઅપ ઇમરજન્સી લાઇટ તૈયાર રાખવી.",
            "અતિથિઓની સુવિધા માટે ૧૦% વધારાનું ભોજન અનામત રાખવું."
        ]
        prep_steps = [
            f"{city} માં મનગમતા હોલ/વાડી અને કેટરર સાથે વાત કરી એડવાન્સ બુકિંગ કરવું.",
            "મહેમાનોની યાદી નક્કી કરી આમંત્રણ પત્રિકા મોકલવી.",
            "ડેકોરેશન, સાઉન્ડ અને ફોટોગ્રાફર સાથે સમય અને વ્યવસ્થા નક્કી કરવી.",
            "બાળકોની રમતો માટે સાધન-સામગ્રી (મ્યુઝિકલ ચેર, ફુગ્ગા, ગિફ્ટ્સ) તૈયાર રાખવી.",
            "કાર્યક્રમના ૨ દિવસ પહેલાં દરેક જવાબદારીનું રિવ્યુ કરવું."
        ]
        timeline = [
            AIPlanTimelineItem(
                title=f"{city} માં હોલ અથવા વાડી બુક કરવી",
                description="મહેમાનોની ક્ષમતા, વાહન પાર્કિંગ અને મૂળભૂત સુવિધાઓ ચકાસવી.",
                due_date=event_date or "પ્રસંગના ૪ અઠવાડિયા પહેલાં",
                milestone_phase="4_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="કેટરિંગ મેનુ અને ભોજન વ્યવસ્થા નક્કી કરવી",
                description=f"{guest_count} મહેમાનો માટે સ્વાદિષ્ટ મેનુ અને ટેસ્ટિંગ પૂરું કરવું.",
                due_date=event_date or "પ્રસંગના ૩ અઠવાડિયા પહેલાં",
                milestone_phase="3_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="ડેકોરેશન અને સ્ટેજ શણગાર પ્લાન કરવો",
                description=f"થીમ: '{theme_text}' મુજબ એન્ટ્રી ગેટ અને સ્ટેજ નક્કી કરવું.",
                due_date=event_date or "પ્રસંગના ૨ અઠવાડિયા પહેલાં",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="ફોટોગ્રાફર અને સાઉન્ડ/ડીજે નક્કી કરવું",
                description="કાર્યક્રમના સમય અને યાદગાર પળોનું લિસ્ટ આપવું.",
                due_date=event_date or "પ્રસંગના ૧૦ દિવસ પહેલાં",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="અંતિમ કન્ફર્મેશન અને મહેમાનોની ગણતરી",
                description=f"{guest_count} મહેમાનોની આખરી સંખ્યા કેટરરને જણાવવી.",
                due_date=event_date or "પ્રસંગના ૫ દિવસ પહેલાં",
                milestone_phase="1_week_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="આગલા દિવસે આખરી નિરીક્ષણ",
                description="સાઉન્ડ, લાઇટિંગ અને રિટર્ન ગિફ્ટ તૈયાર રાખવી.",
                due_date=event_date or "પ્રસંગના ૧ દિવસ પહેલાં",
                milestone_phase="day_before",
                priority="high",
                status="pending"
            ),
        ]
        vendors = [
            AIPlanVendorItem(
                category="સ્થળ / હોલ (Venue)",
                suggested_title=f"{city} પાર્ટી પ્લોટ અથવા હોલ",
                requirements=["૫૦+ મહેમાનોની ક્ષમતા", "પાર્કિંગ સુવિધા", "સ્વચ્છ વોશરૂમ"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="કેટરિંગ (Catering)",
                suggested_title="ગુજરાતી/મલ્ટી-ક્યુઝિન કેટરર",
                requirements=["લાઇવ કાઉન્ટર", "શુદ્ધ શાકાહારી/જૈન મેનુ", "ઉચ્ચ ગુણવત્તા"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="ડેકોરેશન (Decoration)",
                suggested_title="ઇવેન્ટ ડેકોરેટર",
                requirements=["થીમ આધારિત મંડપ/સ્ટેજ", "લાઈટિંગ અને ફૂલોનો શણગાર"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="ફોટોગ્રાફી (Photography)",
                suggested_title="પ્રોફેશનલ ફોટોગ્રાફર",
                requirements=["હાઇ-ડેફિનેશન ફોટા", "પ્રી-ઇવેન્ટ/કૅન્ડિડ શૂટ"],
                status="not_contacted"
            )
        ]
        schedule = [
            AIPlanScheduleItem(time_slot="04:00 PM - 04:30 PM", activity="મહેમાનોનું આગમન, આવકાર અને ફોટો સેશન", notes="વેલકમ ડ્રિંક્સ પીરસવા"),
            AIPlanScheduleItem(time_slot="04:30 PM - 05:45 PM", activity="બાળકો અને મહેમાનો માટે રમતો (મ્યુઝિકલ ચેર, ટ્રેઝર હન્ટ, ફ્રીઝ ડાન્સ)", notes="મનોરંજક રમતો અને સ્પર્ધા"),
            AIPlanScheduleItem(time_slot="05:45 PM - 06:30 PM", activity="મુખ્ય ઉત્સવ કાર્યક્રમ, કેક કટિંગ અને ફોટો સેશન", notes="૪૫ મિનિટનો મુખ્ય સેલિબ્રેશન સમય"),
            AIPlanScheduleItem(time_slot="06:30 PM - 07:30 PM", activity="સ્વાદિષ્ટ શાકાહારી ભોજન સમારંભ", notes="૧ કલાકનો સ્વાદિષ્ટ જમણવાર"),
            AIPlanScheduleItem(time_slot="07:30 PM - 07:45 PM", activity="આભાર દર્શન અને સ્મૃતિ ભેટ વિતરણ", notes="વિદાય અને શુભેચ્છાઓ")
        ]

    else:
        # Default English
        summary = (
            f"A personalized celebration master plan for '{name}'. "
            f"Tailored for {guest_count} guests in {city} with a budget of {currency} {total_budget:,.0f}. "
            f"Styling: {theme_text}. {dietary_info}."
        )
        ideas = [
            f"Integrate local {city} culinary favorites with interactive live food counters.",
            "Set up an aesthetic themed photo-backdrop with personalized celebratory props.",
            "Organize 3 to 4 engaging interactive party games: Musical Chairs, Treasure Hunt, Freeze Dance, and Passing the Parcel.",
            f"Provide custom memory favors or eco-friendly return gifts for all {guest_count} guests."
        ]
        contingency_list = [
            "Outdoor weather backup: Reserve indoor banquet access or waterproof canopy structures.",
            "Power continuity: Verify dual power supply with silent backup generators on-site.",
            "Guest comfort: Keep a well-equipped first aid kit, extra bottled water, and a 10% food buffer."
        ]
        prep_steps = [
            f"Shortlist and confirm venue in {city} with dedicated parking and required capacity.",
            f"Finalize catering menu accommodating {dietary_requirements or 'all dietary preferences'}.",
            "Coordinate decor themes, balloon arches, and stage backdrop lighting.",
            "Organize props and music tracks for party games (Musical Chairs, Treasure Hunt, Freeze Dance).",
            "Run an end-to-end rehearsal and vendor contact check 48 hours prior to the event."
        ]
        timeline = [
            AIPlanTimelineItem(
                title=f"Confirm & book venue in {city}",
                description="Verify guest capacity, access timings, parking, and sound permissions.",
                due_date=event_date or "4 weeks before event",
                milestone_phase="4_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="Select catering package & schedule tasting",
                description=f"Finalize menu options for {guest_count} guests including dietary preferences.",
                due_date=event_date or "3 weeks before event",
                milestone_phase="3_weeks_before",
                priority="high",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="Lock in theme & decor layout",
                description=f"Approve design drafts for theme: '{theme_text}' (stage, entrance, seating).",
                due_date=event_date or "2 weeks before event",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="Book photographer & entertainment / sound",
                description="Share specific moments checklist and playlist preferences with DJ / artists.",
                due_date=event_date or "10 days before event",
                milestone_phase="2_weeks_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="Finalize guest count & RSVPs",
                description="Provide caterer and seating manager with the confirmed attendance count.",
                due_date=event_date or "5 days before event",
                milestone_phase="1_week_before",
                priority="medium",
                status="pending"
            ),
            AIPlanTimelineItem(
                title="Final logistics & vendor briefing",
                description="Confirm delivery schedules, setup timelines, and payment milestone splits.",
                due_date=event_date or "1 day before event",
                milestone_phase="day_before",
                priority="high",
                status="pending"
            ),
        ]
        vendors = [
            AIPlanVendorItem(
                category="Venue",
                suggested_title=f"{city} Event Hall or Banquet Lawn",
                requirements=[f"Comfortably hosts {guest_count}+ people", "Dedicated parking space", "Air conditioned / weather proof"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="Catering",
                suggested_title="Celebration Catering Partner",
                requirements=["Live counters & buffet", "Dietary compliance", "Professional service staff"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="Decoration",
                suggested_title="Atmosphere & Decor Specialist",
                requirements=["Theme-aligned backdrop", "Ambient LED lighting", "Fresh floral entrance arch"],
                status="not_contacted"
            ),
            AIPlanVendorItem(
                category="Photography",
                suggested_title="Professional Event Photographer",
                requirements=["Candid & portrait photography", "Highlight reel / video clips", "Digital gallery link in 7 days"],
                status="not_contacted"
            )
        ]
        schedule = [
            AIPlanScheduleItem(time_slot="04:00 PM - 04:30 PM", activity="Guest arrivals, welcome drinks, and photo session", notes="Welcome team greeting guests at entrance"),
            AIPlanScheduleItem(time_slot="04:30 PM - 05:45 PM", activity="Interactive games: Musical Chairs, Treasure Hunt, and Freeze Dance", notes="Party anchor / host engaging all guests"),
            AIPlanScheduleItem(time_slot="05:45 PM - 06:30 PM", activity="Celebration ceremony, birthday cake cutting, and group photos", notes="Dedicated 45-minute celebration segment"),
            AIPlanScheduleItem(time_slot="06:30 PM - 07:30 PM", activity="Grand vegetarian dinner buffet and guest socializing", notes="Full 1-hour dining experience with active catering staff"),
            AIPlanScheduleItem(time_slot="07:30 PM - 07:45 PM", activity="Thank-you address and return gifts distribution", notes="Farewells and favors distributed at exit")
        ]

    return AIPlanGenerated(
        event_summary=summary,
        theme=theme_text,
        budget=AIPlanBudgetBlock(
            currency=currency,
            total=total_budget,
            items=budget_items
        ),
        timeline=timeline,
        vendors=vendors,
        ideas=ideas,
        contingencies=contingency_list,
        prep_steps=prep_steps,
        event_day_schedule=schedule,
        plan_source="rules_fallback",
        fallback_reason=reason
    )
