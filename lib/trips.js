/* ============================================================
   CONTENT
   Single source of truth for the site. The admin edits a copy
   of this in the browser and exports it back over this file.
   When you move to a database, return this same shape.
   ============================================================ */

export const site = {
  "name": "Ghumakkaad",
  "url": "https://ghumakkaad.com",
  "tagline": "Every journey has a story",
  "blurb": "Group trips out of Gujarat with fixed dates, a set group, and someone from our side travelling with you.",
  "whatsapp": "917837831753",
  "phoneDisplay": "+91 78378 31753",
  "email": "theghumakkaad@gmail.com",
  "address": "123, Gold Coast Complex, Panjrapol Cross Road, Vastral, Ahmedabad 382418",
  "heroVideo": "4285",
  "heroKicker": "Fixed departures out of Gujarat",
  "heroTitle": "One road, four seasons",
  "heroSub": "Snow, rain, sand and sea. A date that does not move, and a group that stays together."
};

export const trips = [
  {
    "slug": "saputara",
    "terrain": "monsoon",
    "name": "Saputara",
    "kicker": "Monsoon camp · Dang, Gujarat",
    "sub": "You leave Gujarat in the dark and wake up in the wettest hills in the state.",
    "duration": "3 days / 2 nights",
    "cardImage": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1800&q=72&auto=format&fit=crop",
    "facts": [
      "<b>3</b> days / <b>2</b> nights",
      "From <b>₹3,699</b> pp",
      "<b>7</b> pickup points",
      "<b>Tent</b> stay"
    ],
    "fareLabel": "Boarding from",
    "gstPercent": 0,
    "seasonRate": 0,
    "seasonWindows": [],
    "fares": [
      {
        "id": "ahm",
        "label": "Ahmedabad",
        "note": "Shivranjni / CTM Express Highway",
        "price": 3699
      },
      {
        "id": "vad",
        "label": "Vadodara",
        "note": "Golden or Vaghodiya Chowkdi",
        "price": 3699
      },
      {
        "id": "sur",
        "label": "Surat",
        "note": "Kamrej Chowkdi By Pass",
        "price": 3699
      }
    ],
    "addons": [
      {
        "id": "share",
        "label": "Sharing tent",
        "note": "6-8 person",
        "add": 0
      },
      {
        "id": "couple",
        "label": "Couple tent",
        "note": "+₹500 pp",
        "add": 500
      }
    ],
    "addonLabel": "Tent",
    "dates": [
      "2026-06-25",
      "2026-07-02",
      "2026-07-09",
      "2026-07-16",
      "2026-07-23",
      "2026-07-30",
      "2026-08-06",
      "2026-08-13",
      "2026-08-20",
      "2026-08-27",
      "2026-09-03",
      "2026-09-10"
    ],
    "scenes": [
      {
        "anchor": ".hero",
        "frac": 0.55,
        "type": "video",
        "src": "22729",
        "tint": "4,12,9,.24",
        "rain": 1
      },
      {
        "anchor": "#d1",
        "frac": 0.5,
        "type": "video",
        "src": "43148",
        "tint": "8,20,18,.26",
        "rain": 0.6
      },
      {
        "anchor": "#d2",
        "frac": 0.5,
        "type": "video",
        "src": "43151",
        "tint": "8,24,14,.22",
        "rain": 0.3
      },
      {
        "anchor": "#d3",
        "frac": 0.5,
        "type": "video",
        "src": "45322",
        "tint": "4,18,12,.22",
        "rain": 0.55
      },
      {
        "anchor": "#faq",
        "frac": 0.4,
        "type": "video",
        "src": "50861",
        "tint": "6,16,18,.5",
        "rain": 0.35
      }
    ],
    "days": [
      {
        "tag": "Day 0 · Departure",
        "title": "Overnight bus",
        "meals": "",
        "acts": [
          "Reporting at your pickup point, 30 minutes before departure",
          "Ahmedabad boards at Shivranjni or CTM Express Highway",
          "Overnight journey by 3×2 seater bus"
        ]
      },
      {
        "tag": "Day 1 · Trek",
        "title": "Trek & ropes",
        "meals": "Breakfast · Lunch · Dinner",
        "acts": [
          "Arrive at the campsite and freshen up",
          "Breakfast, rest, photography",
          "Burma bridge, plank bridge, tyre walk, cross bamboo walk, commando net",
          "Lunch",
          "Sunset trek",
          "Back to camp for dinner",
          "Music and dance"
        ]
      },
      {
        "tag": "Day 2 · Saputara",
        "title": "Governor Hill",
        "meals": "Breakfast · Lunch · Dinner",
        "acts": [
          "Wake up, freshen up, breakfast",
          "Governor Hill trek and Table Point",
          "Back to campsite for lunch",
          "Sunset Point, Tribal Museum, Rose Garden, Step Garden, Lake View Garden",
          "Return to camp, dinner",
          "Music and garba"
        ]
      },
      {
        "tag": "Day 3 · Gira falls",
        "title": "Gira falls",
        "meals": "Breakfast",
        "acts": [
          "Wake up, freshen up, breakfast",
          "Depart for Gira waterfall",
          "Time at the falls",
          "Depart for Ahmedabad",
          "Arrive home"
        ]
      }
    ],
    "included": [
      "Ahmedabad to Ahmedabad by 3×2 seater bus",
      "Tent on sharing basis",
      "3 breakfasts, 2 lunches, 2 dinners — pure vegetarian",
      "Sunset trek, Governor Hill trek, rope activities",
      "All Saputara and Gira waterfall sightseeing per itinerary",
      "Music and garba",
      "Instructor fee, equipment, tolls, taxes, parking"
    ],
    "excluded": [
      "Food during travel and anything not listed",
      "Entry fees for monuments",
      "Any other paid activities",
      "Personal expenses of any kind"
    ],
    "excludedNote": "Couple tent ₹500 extra per person. An extra seat is mandatory for oversized guests at ₹1,300.",
    "notesTitle": "Read this before you book",
    "notesLede": "It is a camp, not a resort. People who know that in advance have a much better time.",
    "notes": [
      {
        "h": "Sleeping",
        "p": "Alpine and dome tents, sharing basis, 6 and 8 person capacity. Your own group can share a tent if you fill it; otherwise men and women are separated."
      },
      {
        "h": "Inside the tent",
        "p": "120 cm high, 210 long, 195 wide. Foam mattress provided. <strong>You carry your own blanket and pillow.</strong> No light or fan inside."
      },
      {
        "h": "Facilities",
        "p": "Over 100 charging points. 24 common washrooms, separate for men and women. <strong>No hot water for bathing.</strong>"
      },
      {
        "h": "Food",
        "p": "Pure vegetarian for the whole trip."
      }
    ],
    "stopsTitle": "Where the bus stops",
    "stopsLede": "Reporting time is 30 minutes before departure.",
    "stops": [
      [
        "Ahmedabad",
        "Shivranjni or CTM Express Highway"
      ],
      [
        "Vadodara",
        "Golden or Vaghodiya Chowkdi By Pass"
      ],
      [
        "Nadiad",
        "By Pass"
      ],
      [
        "Anand",
        "Gamdi or Rajodpura By Pass"
      ],
      [
        "Bharuch",
        "ABC Chowkdi By Pass"
      ],
      [
        "Surat",
        "Kamrej Chowkdi By Pass"
      ],
      [
        "Navsari",
        "By Pass"
      ]
    ],
    "stopsNote": "Fares are quoted from Ahmedabad, Vadodara and Surat. Boarding elsewhere — message us.",
    "packing": [
      [
        "Blanket and pillow — must",
        1
      ],
      [
        "Water bottle — must",
        1
      ],
      [
        "Personal medicines",
        0
      ],
      [
        "Warm clothes or jacket",
        0
      ],
      [
        "Trekking shoes",
        0
      ],
      [
        "Torch",
        0
      ],
      [
        "Extra clothes",
        0
      ],
      [
        "Raincoat or umbrella",
        0
      ],
      [
        "Sunscreen, sunglasses",
        0
      ],
      [
        "Power bank",
        0
      ],
      [
        "Toiletries",
        0
      ],
      [
        "Small backpack",
        0
      ],
      [
        "Snacks for the road",
        0
      ],
      [
        "ID proof and photocopy",
        0
      ],
      [
        "Cash — ATMs may not be available",
        0
      ],
      [
        "Mosquito repellent",
        0
      ]
    ],
    "cancelLede": "Advance payment is non-refundable, and cannot be transferred or exchanged.",
    "charges": [
      [
        "10%",
        "More than 15 days before"
      ],
      [
        "50%",
        "2 to 15 days before"
      ],
      [
        "90%",
        "Last 48 hours and after"
      ]
    ],
    "cancelNote": "No refund for unused accommodation, missed meals, transport or sightseeing.",
    "faqs": [
      {
        "q": "Is this alright for first-time campers?",
        "a": "Yes, as long as you know it is a camp. Shared tent, foam mattress, no hot water, and you bring your own blanket and pillow."
      },
      {
        "q": "Can couples get a private tent?",
        "a": "Yes, a couple dome tent is ₹500 extra per person."
      },
      {
        "q": "What if it rains heavily?",
        "a": "Rain is the reason for the trip, so the schedule runs through it. The trip captain can change activities if conditions turn unsafe."
      },
      {
        "q": "Do I have to reach Ahmedabad?",
        "a": "Not for this trip. The bus picks up at seven points between Ahmedabad and Navsari."
      },
      {
        "q": "Is the food vegetarian?",
        "a": "Pure vegetarian throughout — 3 breakfasts, 2 lunches and 2 dinners are included."
      }
    ]
  },
  {
    "slug": "jodhpur-jaisalmer",
    "terrain": "desert",
    "name": "Jodhpur & Jaisalmer",
    "kicker": "Desert trip · Ex Ahmedabad",
    "sub": "Blue city to golden city in three days, ending on a dune with the sun going down.",
    "duration": "3 days / 2 nights",
    "cardImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Jodhpur_from_Fort_%281580958429%29.jpg/900px-Jodhpur_from_Fort_%281580958429%29.jpg",
    "facts": [
      "<b>3</b> days / <b>2</b> nights",
      "From <b>₹8,500</b> pp",
      "<b>Swiss tent</b> at Sam",
      "<b>Jeep + camel</b> safari"
    ],
    "fareLabel": "Room & tent sharing",
    "gstPercent": 5,
    "seasonRate": 0,
    "seasonWindows": [],
    "fares": [
      {
        "id": "s4",
        "label": "4 sharing",
        "note": "₹8,500 pp",
        "price": 8500
      },
      {
        "id": "s3",
        "label": "3 sharing",
        "note": "₹9,000 pp",
        "price": 9000
      },
      {
        "id": "s2",
        "label": "2 sharing",
        "note": "₹9,500 pp",
        "price": 9500
      }
    ],
    "addons": [],
    "addonLabel": "",
    "dates": [],
    "scenes": [
      {
        "anchor": ".hero",
        "frac": 0.55,
        "type": "video",
        "src": "4285",
        "tint": "42,18,5,.30",
        "rain": 0.35
      },
      {
        "anchor": "#d1",
        "frac": 0.5,
        "type": "image",
        "tint": "30,22,26,.30",
        "rain": 0.3,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Jodhpur_from_Fort_%281580958429%29.jpg/1280px-Jodhpur_from_Fort_%281580958429%29.jpg"
      },
      {
        "anchor": "#d2",
        "frac": 0.25,
        "type": "video",
        "src": "4310",
        "tint": "52,22,5,.24",
        "rain": 0.6
      },
      {
        "anchor": "#d2",
        "frac": 0.9,
        "type": "video",
        "src": "4149",
        "tint": "58,26,6,.24",
        "rain": 0.85
      },
      {
        "anchor": "#d3",
        "frac": 0.55,
        "type": "image",
        "tint": "48,20,5,.30",
        "rain": 0.25,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Fort_Jaisalmer_at_sunset.jpg/1280px-Fort_Jaisalmer_at_sunset.jpg"
      },
      {
        "anchor": "#faq",
        "frac": 0.5,
        "type": "video",
        "src": "50199",
        "tint": "44,20,6,.34",
        "rain": 0.2
      }
    ],
    "days": [
      {
        "tag": "Day 0 · Departure",
        "title": "The night before",
        "meals": "",
        "acts": [
          "Reporting at the Ahmedabad pickup point, 30 minutes before departure",
          "Boarding point confirmed on WhatsApp the day before",
          "Overnight drive by AC bus or tempo traveller",
          "Wake up on the road to Jodhpur"
        ]
      },
      {
        "tag": "Day 1 · Jodhpur",
        "title": "The blue city",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Arrive in Jodhpur",
          "Check in, freshen up, breakfast",
          "Mehrangarh Fort",
          "Jaswant Thada",
          "Umaid Bhawan Palace",
          "Clock Tower and Ghantaghar market",
          "Blue city walk",
          "Dinner and night stay at the hotel"
        ]
      },
      {
        "tag": "Day 2 · Sam dunes",
        "title": "Into the Thar",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Breakfast at the hotel",
          "Check out and drive to Jaisalmer",
          "Scenic Thar desert route",
          "Arrive at the Sam desert camp",
          "Jeep safari on the sand dunes",
          "Sunset point at Sam",
          "DJ night, garba and folk dance",
          "Rajasthani dinner at camp",
          "Night stay in a Swiss tent"
        ]
      },
      {
        "tag": "Day 3 · Jaisalmer",
        "title": "The golden city",
        "meals": "Breakfast",
        "acts": [
          "Sunrise at the Sam sand dunes",
          "Camel safari on the dunes",
          "Breakfast at the desert camp",
          "Check out and drive to Jaisalmer city",
          "Jaisalmer Fort — Sonar Quila",
          "Patwon Ki Haveli",
          "Gadisar Lake",
          "Local market",
          "Depart for Ahmedabad"
        ]
      }
    ],
    "included": [
      "Travel by AC bus or tempo traveller",
      "1 night at a Jodhpur hotel",
      "1 night in a Swiss tent at Sam desert",
      "2 breakfasts and 2 dinners",
      "Jeep safari at Sam desert",
      "Camel safari in the Thar",
      "DJ night, garba and folk dance",
      "All sightseeing as per the itinerary",
      "Tour coordinator with the group"
    ],
    "excluded": [
      "Lunch and snacks",
      "Personal expenses",
      "Entry fees and boating charges",
      "Anything not listed under inclusions",
      "<strong>GST 5% extra</strong>"
    ],
    "excludedNote": "Prices are per person on a sharing basis and include stay, meals and transport. GST is charged on top.",
    "notesTitle": "Where you sleep",
    "notesLede": "One night in a hotel, one night on the sand. They are very different nights.",
    "notes": [
      {
        "h": "Night 1 — Jodhpur hotel",
        "p": "A hotel room on a sharing basis, dinner and breakfast included. Four, three or two to a room, which is what sets your price."
      },
      {
        "h": "Night 2 — Swiss tent at Sam",
        "p": "A Swiss tent at the desert camp with a Rajasthani dinner, folk dance and DJ night. Nights are cold from November to February even after a 40°C afternoon."
      },
      {
        "h": "Two safaris",
        "p": "Jeep safari the evening you arrive, camel safari at sunrise. Both included — nothing to pay at the camp."
      },
      {
        "h": "Food",
        "p": "Two breakfasts and two dinners included. <strong>Lunch and snacks are not</strong>, so carry cash."
      }
    ],
    "stopsTitle": "Where it starts",
    "stopsLede": "This trip runs from Ahmedabad. Travellers from elsewhere make their own way there.",
    "stops": [
      [
        "Ahmedabad",
        "Boarding point confirmed on WhatsApp"
      ],
      [
        "Reporting",
        "30 minutes before departure"
      ],
      [
        "Returns to",
        "Ahmedabad, evening of day 3"
      ]
    ],
    "stopsNote": "Coming from Surat, Vadodara or Rajkot? Message us and we will tell you what time to reach Ahmedabad.",
    "packing": [
      [
        "Warm jacket for the desert night — must",
        1
      ],
      [
        "ID proof and photocopy — must",
        1
      ],
      [
        "Sunscreen and sunglasses",
        0
      ],
      [
        "Cap or scarf for the dunes",
        0
      ],
      [
        "Comfortable walking shoes",
        0
      ],
      [
        "Light cotton clothes for the day",
        0
      ],
      [
        "Personal medicines",
        0
      ],
      [
        "Power bank",
        0
      ],
      [
        "Toiletries",
        0
      ],
      [
        "Cash for lunch, entry fees and markets",
        0
      ],
      [
        "Moisturiser and lip balm",
        0
      ],
      [
        "Small backpack",
        0
      ]
    ],
    "cancelLede": "Registration charges are non-refundable. Everything else depends on how early you tell us.",
    "charges": [
      [
        "100%",
        "Refunded more than 30 days before"
      ],
      [
        "30%",
        "Refunded more than 15 days before"
      ],
      [
        "0%",
        "Within 7 days, or once the tour has started"
      ]
    ],
    "cancelNote": "The itinerary depends on weather and road conditions. Disputes fall under Ahmedabad jurisdiction. A group coordinator is assigned for groups over 10.",
    "faqs": [
      {
        "q": "Is GST included in the price?",
        "a": "No. Prices include stay, meals and transport, and GST of 5% is charged on top. The price bar shows both, so the total you see is the total you pay."
      },
      {
        "q": "What does sharing mean?",
        "a": "How many people share a room in Jodhpur and a tent at Sam. Four sharing is ₹8,500, three is ₹9,000, two is ₹9,500 per person."
      },
      {
        "q": "How cold does the desert get at night?",
        "a": "Cold enough to need a proper jacket between November and February, even after a 40°C afternoon."
      },
      {
        "q": "Do I have to reach Ahmedabad myself?",
        "a": "Yes. This trip departs from Ahmedabad. Message us and we will tell you what time to arrive."
      },
      {
        "q": "Are the safaris extra?",
        "a": "No. Both the jeep and camel safari are included, along with the folk dance, garba and DJ night."
      }
    ]
  },
  {
    "slug": "shimla-manali-kullu-kasol",
    "terrain": "snow",
    "name": "Shimla Manali Kasol",
    "kicker": "By train · Ex Gandhinagar",
    "sub": "Eight days in Himachal, two of them on a train. Two nights Shimla, two Manali, one Kullu.",
    "duration": "8 days / 7 nights",
    "cardImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG/900px-Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG",
    "facts": [
      "<b>8</b> days / <b>7</b> nights",
      "From <b>₹12,499</b> pp",
      "<b>Train</b> from Gandhinagar",
      "<b>Snow point</b> & Rohtang"
    ],
    "fareLabel": "Fare",
    "gstPercent": 0,
    "seasonRate": 2000,
    "seasonWindows": [
      [
        "2026-11-07",
        "2026-11-14"
      ],
      [
        "2026-12-16",
        "2027-01-15"
      ]
    ],
    "fares": [
      {
        "id": "sl",
        "label": "Sleeper",
        "note": "Non-AC, Gandhinagar",
        "price": 12499,
        "child": 9999
      },
      {
        "id": "3a",
        "label": "3rd AC",
        "note": "Gandhinagar return",
        "price": 14499,
        "child": 11499
      },
      {
        "id": "2a",
        "label": "2nd AC",
        "note": "Gandhinagar return",
        "price": 15999,
        "child": 12999
      },
      {
        "id": "cdg",
        "label": "No train",
        "note": "Chandigarh to Chandigarh",
        "price": 11499,
        "child": 9499
      }
    ],
    "addons": [],
    "addonLabel": "",
    "childRates": true,
    "dates": [
      "2026-09-27",
      "2026-10-04",
      "2026-10-11",
      "2026-10-18",
      "2026-10-25",
      "2026-11-01",
      "2026-11-05",
      "2026-11-08",
      "2026-11-10",
      "2026-11-12",
      "2026-11-14",
      "2026-11-18",
      "2026-11-20",
      "2026-11-25",
      "2026-11-27",
      "2026-11-29",
      "2026-12-02",
      "2026-12-06",
      "2026-12-11",
      "2026-12-16",
      "2026-12-20",
      "2026-12-25",
      "2026-12-30",
      "2027-01-01",
      "2027-01-06",
      "2027-01-10",
      "2027-01-15",
      "2027-01-20",
      "2027-01-24",
      "2027-01-29",
      "2027-02-05",
      "2027-02-10",
      "2027-02-14",
      "2027-02-19",
      "2027-02-24",
      "2027-02-28",
      "2027-03-05",
      "2027-03-10",
      "2027-03-14",
      "2027-03-19",
      "2027-03-24",
      "2027-03-28",
      "2027-04-02",
      "2027-04-07",
      "2027-04-11",
      "2027-04-14"
    ],
    "scenes": [
      {
        "anchor": ".hero",
        "frac": 0.55,
        "type": "video",
        "src": "4396",
        "tint": "10,20,34,.30",
        "rain": 0.3
      },
      {
        "anchor": "#d1",
        "frac": 0.5,
        "type": "image",
        "tint": "8,14,24,.34",
        "rain": 0.2,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Train_at_Summer_Hill_railway_station_on_the_Kalka%E2%80%93Shimla_Railway%2C1.jpg/1280px-Train_at_Summer_Hill_railway_station_on_the_Kalka%E2%80%93Shimla_Railway%2C1.jpg"
      },
      {
        "anchor": "#d2",
        "frac": 0.5,
        "type": "image",
        "tint": "14,24,38,.30",
        "rain": 0.35,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Ridge_and_Mall_Road_-_Scandal_Point_-_Shimla_2014-05-07_1199.JPG/1280px-Ridge_and_Mall_Road_-_Scandal_Point_-_Shimla_2014-05-07_1199.JPG"
      },
      {
        "anchor": "#d3",
        "frac": 0.5,
        "type": "video",
        "src": "4283",
        "tint": "14,24,38,.26",
        "rain": 0.95
      },
      {
        "anchor": "#d4",
        "frac": 0.5,
        "type": "image",
        "tint": "10,22,30,.28",
        "rain": 0.45,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Water_stream_in_Kasol_Parvati_Valley.jpg/1280px-Water_stream_in_Kasol_Parvati_Valley.jpg"
      },
      {
        "anchor": "#d5",
        "frac": 0.5,
        "type": "video",
        "src": "3371",
        "tint": "12,22,32,.26",
        "rain": 0.4
      },
      {
        "anchor": "#d6",
        "frac": 0.5,
        "type": "image",
        "tint": "12,20,32,.24",
        "rain": 0.95,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG/1280px-Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG"
      },
      {
        "anchor": "#d7",
        "frac": 0.5,
        "type": "video",
        "src": "13916",
        "tint": "14,20,30,.32",
        "rain": 0.3
      },
      {
        "anchor": "#faq",
        "frac": 0.35,
        "type": "image",
        "tint": "16,22,32,.36",
        "rain": 0.2,
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Mountain_valleys_in_Manali%2C_Himachal_Pradesh%2C_India_%282015%29.jpg/1280px-Mountain_valleys_in_Manali%2C_Himachal_Pradesh%2C_India_%282015%29.jpg"
      }
    ],
    "days": [
      {
        "tag": "Day 1 · Journey",
        "title": "On the train",
        "meals": "",
        "acts": [
          "Board the train at Gandhinagar",
          "Overnight journey to Chandigarh",
          "Train tickets are booked through IRCTC, 60 days ahead"
        ]
      },
      {
        "tag": "Day 2 · Shimla",
        "title": "Shimla",
        "meals": "Dinner",
        "acts": [
          "Reach Chandigarh in the morning",
          "Depart for Shimla around 8 AM",
          "Afternoon check-in and rest",
          "Mall Road, Christ Church, The Ridge, Scandal Point",
          "Jakhoo Temple by local taxi — own cost, the tempo cannot climb it",
          "Dinner and overnight at the hotel"
        ]
      },
      {
        "tag": "Day 3 · Kufri",
        "title": "Kufri",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Breakfast, then on to Kufri",
          "Adventure activities — optional, own cost",
          "Green Valley",
          "Snow Point",
          "Back to Shimla for dinner and overnight"
        ]
      },
      {
        "tag": "Day 4 · Kasol",
        "title": "Kasol",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Breakfast and early check out",
          "Drive to Kasol",
          "Evening in Kasol valley",
          "Manikaran Gurudwara",
          "Kasol local market",
          "Dinner and overnight at the Kullu hotel"
        ]
      },
      {
        "tag": "Day 5 · Manali",
        "title": "Manali",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Breakfast and check out",
          "River rafting — included",
          "Vashisht Temple and Hadimba Devi Temple",
          "Manali Sanctuary, Tibetan monastery, Raghunath Temple, Van Vihar",
          "Mall Road in the evening",
          "Overnight at the Manali hotel"
        ]
      },
      {
        "tag": "Day 6 · Snow point",
        "title": "Solang or Rohtang",
        "meals": "Breakfast · Dinner",
        "acts": [
          "Full day excursion to a snow point",
          "Solang Valley, Sissu, Kokhsar or Rohtang Pass",
          "Subject to permits and weather",
          "Atal Tunnel if it is open",
          "Adventure activities at own cost",
          "Beyond where the tempo can go, a 4×4 is at your own expense",
          "Overnight at the Manali hotel"
        ]
      },
      {
        "tag": "Day 7 · Chandigarh",
        "title": "Back to the train",
        "meals": "Breakfast",
        "acts": [
          "Breakfast and check out",
          "Drive to Chandigarh railway station",
          "Overnight journey"
        ]
      },
      {
        "tag": "Day 8 · Journey",
        "title": "Home",
        "meals": "",
        "acts": [
          "Reach Gandhinagar",
          "Board your train home"
        ]
      }
    ],
    "included": [
      "All transfers from Chandigarh by non-AC traveller",
      "2 nights in Shimla",
      "2 nights in Manali",
      "1 night in Kullu",
      "5 breakfasts and 5 dinners",
      "River rafting",
      "Bonfire and music party",
      "Tolls, parking, transport taxes, fuel and driver allowance"
    ],
    "excluded": [
      "Personal expenses — laundry, calls, tips, water, drinks, porterage",
      "Rafting extras, rock climbing, paragliding, toy train joy rides",
      "Entrance fees and guide charges",
      "Sightseeing or vehicle use beyond the itinerary",
      "Costs from landslides, road blocks or strikes, payable on the spot",
      "Any rise in taxes or fuel before departure",
      "Travel insurance",
      "<strong>Hotel rooms are non-AC</strong>"
    ],
    "excludedNote": "AC does not work in the hills, so both the vehicle and the hotel rooms are non-AC by design.",
    "notesTitle": "Things worth knowing",
    "notesLede": "Hill roads and government train tickets set the rules on this trip, not us.",
    "notes": [
      {
        "h": "Train tickets are IRCTC",
        "p": "Tickets open <strong>60 days before departure at 8 AM</strong> and we book as early as we can. Agents get no quota. RAC or waiting status is IRCTC's allotment, as is your seat number, fixed 4 to 6 hours before departure."
      },
      {
        "h": "Snow can close the road",
        "p": "If it snows heavily the tempo will not run to Solang Valley or Atal Tunnel. You can book a local car yourself at your own cost, or wait for the weather."
      },
      {
        "h": "Jakhoo Temple",
        "p": "The tempo cannot climb to the temple in Shimla. A local car from the parking area is at your own cost."
      },
      {
        "h": "Rooms",
        "p": "Group tour, so rooms are allotted as they come — we cannot promise a balcony. All rooms are non-AC."
      }
    ],
    "stopsTitle": "Where it starts",
    "stopsLede": "This one leaves by train from Gandhinagar, and the road part begins at Chandigarh.",
    "stops": [
      [
        "Gandhinagar",
        "Board the train — platform confirmed on WhatsApp"
      ],
      [
        "Chandigarh",
        "Road transfers start here, around 8 AM on day 2"
      ],
      [
        "Chandigarh",
        "Back to the station on day 7"
      ],
      [
        "Gandhinagar",
        "Arrive on day 8"
      ]
    ],
    "stopsNote": "Reaching Chandigarh yourself? There is a Chandigarh to Chandigarh fare at ₹11,499 that leaves the train out.",
    "packing": [
      [
        "Warm or thermal jacket — must",
        1
      ],
      [
        "Government photo ID — must",
        1
      ],
      [
        "Prescribed medicines",
        0
      ],
      [
        "Lemon and salt for travel sickness",
        0
      ],
      [
        "Sports or trekking shoes",
        0
      ],
      [
        "Gloves",
        0
      ],
      [
        "Sunglasses",
        0
      ],
      [
        "Raincoat or umbrella",
        0
      ],
      [
        "Power bank and charger",
        0
      ],
      [
        "Water bottle",
        0
      ],
      [
        "Vaccination certificate",
        0
      ],
      [
        "Cash for taxis, entry fees and activities",
        0
      ]
    ],
    "cancelLede": "Registration charges are non-refundable, and the deposit is non-refundable in every case.",
    "charges": [
      [
        "Deposit",
        "Lost if you cancel 30 days or more before"
      ],
      [
        "50%",
        "15 to 29 days before"
      ],
      [
        "75%",
        "7 to 14 days before"
      ]
    ],
    "cancelNote": "Under 7 days before departure, or a no-show, is charged at 100%. Approved refunds reach the original payment method in 10 to 15 working days.",
    "faqs": [
      {
        "q": "What do the three prices mean?",
        "a": "Train classes for the Gandhinagar journey — sleeper ₹12,499, 3rd AC ₹14,499, 2nd AC ₹15,999. Everything on the ground is identical. There is also ₹11,499 if you reach Chandigarh yourself."
      },
      {
        "q": "What is the season rate?",
        "a": "₹2,000 extra per person between 7 and 14 November, and 16 December to 15 January. Pick a date and it is added automatically."
      },
      {
        "q": "Are there child rates?",
        "a": "Yes, for ages 5 to 10 — ₹9,999 sleeper, ₹11,499 in 3AC, ₹12,999 in 2AC, or ₹9,499 for the Chandigarh fare."
      },
      {
        "q": "Will we definitely reach Rohtang?",
        "a": "No, and nobody can promise it. Rohtang needs a permit and clear weather. The trip leader picks whichever snow point is open and safe."
      },
      {
        "q": "What if my train ticket comes as waiting?",
        "a": "Tickets open 60 days ahead and we book immediately, but IRCTC controls allotment and agents get no quota."
      }
    ]
  }
];

export const activeTrips = () => trips.filter((t) => t.active !== false);

export const getTrip = (slug) => trips.find((t) => t.slug === slug) || null;

/* Math.min() of an empty list is Infinity, which rendered as "₹∞" on
   any trip whose fares had not been filled in yet. Null means "no
   price to show", and every caller checks for it. */
/* Formatting and date helpers now live in lib/format.js so that a
   component needing money() does not pull this whole catalogue into
   the browser. Re-exported here for callers that already import from
   this module.

   waLink() used to live here and read site.whatsapp from the bundled
   copy above, which meant changing the number in the admin left every
   Book button pointing at the old one. Components take the number as
   a prop now, so it is gone rather than quietly stale. */
export { money, fmtDate, fmtLong, fromPrice, upcomingDates, isSeasonDate } from "./format";

/* ============================================================
   Places we run or are opening that do not have a page yet.

   They appear in their terrain section marked as opening, linking to
   WhatsApp rather than to a route that does not exist, so every season
   has something in it. They are deliberately NOT in the hero's
   departure list: that list promises real dates.

   Give one a slug and full data in the admin and it becomes a proper
   trip. If any of these now duplicate a live package, delete that entry
   here and it is gone.
   ============================================================ */
export const comingSoon = [
  {
    terrain: "snow", slug: null, name: "Full Himachal",
    days: "11D / 10N", priceFrom: 16499,
    blurb: "Shimla, Manali, Dalhousie and Khajjiar end to end. Dates on WhatsApp.",
  },
  {
    terrain: "monsoon", slug: null, name: "Matheran",
    days: "2D / 1N", priceFrom: null,
    blurb: "A hill town above Neral where cars stop at the gate.",
  },
  {
    terrain: "desert", slug: null, name: "Jaisalmer",
    days: "5D / 4N", priceFrom: 5000,
    blurb: "Camel and jeep safari at Sam, Swiss tents, Kuldhara and the fort.",
  },
  {
    terrain: "beach", slug: null, name: "Goa",
    days: "4D / 3N", priceFrom: null,
    blurb: "North and south in one loop, with the group.",
  },
];
