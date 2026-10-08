/* =====================================================================
   TROOP 134 WEBSITE DATA
   Edit this file for meeting details, leaders' addresses, links,
   Eagle Scouts, fundraisers and stats.
     EVENTS:  edit data/events.txt instead (plain text).
     PHOTOS:  add a folder per album in images/albums/, then run "Update Site".
   - Keep the commas between items and the quotes around text.
   - Leave a URL as "" to hide that button or link.
   - Youth protection: Scouts are listed by first name and last initial only.
   ===================================================================== */
window.SITE = {

  "troop": {
    "name": "Troop 134",
    "city": "Folsom, California",
    "program": "Scouts BSA",
    "charteredBy": "American Legion Post 383",
    "council": "Greater California Council",
    "district": "American River District"
  },

  "meeting": {
    "day": "Tuesday",
    "time": "7:00 PM",
    "place": "Journey Church, 450 Blue Ravine Road, Folsom, CA 95630",
    "placeShort": "Journey Church, 450 Blue Ravine Road",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=450+Blue+Ravine+Road+Folsom+CA+95630"
  },

  /* Main links used across the site */
  "urls": {
    "signup": "https://links.troop134.org/new-scout-signup",
    "instagram": "https://instagram.com/troop134",
    "trail": "https://trail.troop134.org",
    "scoutShop": "https://www.scoutshop.org",
    "donate": "",          /* Your PayPal donate link (e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX).
                              Used by the "Donate with PayPal" buttons. Empty = buttons go to the Support page. */
    "contactForm": ""      /* Optional Google Form for questions. Empty = hidden. */
  },

  /* Home page photo. Only use photos where every Scout's parent has given permission.
     Set "photo" to null to hide it. */
  "home": {
    "photo": null      /* No home photo until the committee confirms parent permission for every Scout
                          in it. Then add the file to images/home/ and set, for example:
                          "photo": { "src": "images/home/troop-134-parade.jpg",
                                     "alt": "Troop 134 Scouts and adult leaders in uniform holding the troop banner at a Folsom parade" } */
  },

  /* EVENTS now live in data/events.txt (plain text, easy to edit).
     PHOTO ALBUMS are the folders in images/albums/. After adding photos, run "Update Site". */

  /* Adult leadership roles: group addresses only, never personal contact info.
     key is used by the pages; do not change keys. */
  "leaders": [
    { "key": "sm",          "role": "Scoutmaster",               "email": "sm@troop134.org",          "about": "Coaches the Scout leaders and holds Scoutmaster conferences." },
    { "key": "committee",   "role": "Troop Committee",           "email": "committee@troop134.org",   "about": "General questions, Boards of Review, and troop business." },
    { "key": "join",        "role": "Joining the Troop",         "email": "join@troop134.org",        "about": "Visits, sign-up, and current costs for new families." },
    { "key": "advancement", "role": "Advancement",               "email": "advancement@troop134.org", "about": "Ranks, merit badges, and Scoutbook records." },
    { "key": "treasurer",   "role": "Treasurer",                 "email": "treasurer@troop134.org",   "about": "Dues, event payments, and reimbursements." },
    { "key": "fundraising", "role": "Fundraising and Donations", "email": "fundraising@troop134.org", "about": "Christmas tree recycling, popcorn, camp cards, and donations." },
    { "key": "web",         "role": "Website",                   "email": "web@troop134.org",         "about": "Corrections or updates to this site." }
  ],

  /* Eagle Scouts: first name and last initial, plus year. Source: council Eagle list sent
     2026-10-07 (59 names). The 5 Eagles from 1968 to 1988 are left off until leaders confirm
     they belong to this Troop 134 (the current charter dates from about 1992). */
  "eagles": [
    { "name": "Daiwik K.", "year": 2026 },
    { "name": "Angad S.", "year": 2025 },
    { "name": "Arnav K.", "year": 2025 },
    { "name": "Aryan K.", "year": 2025 },
    { "name": "Ajay R.", "year": 2024 },
    { "name": "Kabilan V.", "year": 2024 },
    { "name": "Mridul J.", "year": 2024 },
    { "name": "Ritvik S.", "year": 2024 },
    { "name": "Aadit M.", "year": 2022 },
    { "name": "Manav J.", "year": 2022 },
    { "name": "Nitin K.", "year": 2022 },
    { "name": "Javier D.", "year": 2021 },
    { "name": "Madhav A.", "year": 2021 },
    { "name": "Manu M.", "year": 2021 },
    { "name": "Manuel T.", "year": 2021 },
    { "name": "Raghuram P.", "year": 2021 },
    { "name": "Sehaj S.", "year": 2021 },
    { "name": "Aayush K.", "year": 2020 },
    { "name": "Ananth K.", "year": 2019 },
    { "name": "Anish S.", "year": 2019 },
    { "name": "Kai S.", "year": 2019 },
    { "name": "Shrey S.", "year": 2019 },
    { "name": "Ameya N.", "year": 2018 },
    { "name": "Jared S.", "year": 2018 },
    { "name": "Joyel J.", "year": 2018 },
    { "name": "Vikram B.", "year": 2018 },
    { "name": "Brodyn B.", "year": 2017 },
    { "name": "Gautam P.", "year": 2017 },
    { "name": "Jacob R.", "year": 2017 },
    { "name": "Kumarakuru V.", "year": 2017 },
    { "name": "Nikhil K.", "year": 2017 },
    { "name": "Rishabh V.", "year": 2017 },
    { "name": "Rohan N.", "year": 2017 },
    { "name": "Jacob S.", "year": 2016 },
    { "name": "Om A.", "year": 2016 },
    { "name": "Raj A.", "year": 2016 },
    { "name": "Raj V.", "year": 2016 },
    { "name": "Rohil V.", "year": 2016 },
    { "name": "Tejas S.", "year": 2016 },
    { "name": "Aditiya R.", "year": 2014 },
    { "name": "Akshay R.", "year": 2014 },
    { "name": "Tyler S.", "year": 2014 },
    { "name": "Balasabapathi C.", "year": 2013 },
    { "name": "Justin J.", "year": 2013 },
    { "name": "Tyler J.", "year": 2013 },
    { "name": "Anish V.", "year": 2012 },
    { "name": "Geoffrey S.", "year": 2012 },
    { "name": "Robert I.", "year": 2012 },
    { "name": "Saiyeesh R.", "year": 2012 },
    { "name": "Tejas P.", "year": 2012 },
    { "name": "Tyler T.", "year": 2010 },
    { "name": "Jonathan A.", "year": 2007 },
    { "name": "Anthony L.", "year": 2001 },
    { "name": "Christian H.", "year": 1993 }
  ],

  /* Forms and documents */
  "documents": [
    { "title": "Annual Health and Medical Record, Parts A and B (all events)", "url": "https://filestore.scouting.org/filestore/HealthSafety/pdf/680-001_AB.pdf" },
    { "title": "Annual Health and Medical Record, Parts A, B and C (camps and events over 72 hours)", "url": "https://filestore.scouting.org/filestore/HealthSafety/pdf/680-001_ABC.pdf" },
    { "title": "Troop 134 New Scout Sign-Up Form", "url": "https://links.troop134.org/new-scout-signup" }
  ],

  /* Useful Scouting links */
  "links": [
    { "title": "Scouting America", "url": "https://www.scouting.org" },
    { "title": "Greater California Council", "url": "https://gcc-scouting.org" },
    { "title": "Scoutbook", "url": "https://scoutbook.scouting.org" },
    { "title": "Scout Life magazine", "url": "https://scoutlife.org" },
    { "title": "Scout Shop", "url": "https://www.scoutshop.org" },
    { "title": "First Class Trail", "url": "https://trail.troop134.org" }
  ],

  /* Photo albums are read from the folders in images/albums/.
     The site is on Cloudflare, which cannot list folders: leave this "" and run Update Site
     so data/albums.js lists the albums (see HOW-TO-UPDATE.txt). */
  "photos": {
    "s3ListUrl": ""
  },

  /* Members-only tools (shown in the footer and on Resources). Empty url = hidden. */
  "members": [
    { "title": "Scoutbook", "url": "https://scoutbook.scouting.org" },
    { "title": "First Class Trail", "url": "https://trail.troop134.org" },
    { "title": "Troop Google Drive", "url": "" }
  ],

  /* Fundraisers on the Support page */
  "fundraisers": [
    { "title": "Christmas Tree Recycling", "when": "Early January", "summary": "Scouts collect Christmas trees from Folsom homes for recycling. Schedule a pickup and support the troop at the same time." },
    { "title": "Popcorn Sale", "when": "Fall", "summary": "Scouts sell popcorn at storefronts and to neighbors. A share of every sale funds campouts and gear." },
    { "title": "Camp Cards", "when": "Spring", "summary": "Discount cards for local businesses. Sales help Scouts pay for summer camp." }
  ],

  /* Troop at a glance (home page). Set a number to null to hide it. */
  "stats": {
    "yearsActive": 34,
    "scouts": 27,
    "eagles": 54,
    "campoutsThisYear": null
  }
};
