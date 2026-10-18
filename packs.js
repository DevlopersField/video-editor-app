/*
  Reel Studio industry packs. Real estate uses the templates built into the editors.
  {name} {city} {area} {phone} {web} {handle} {tagline} are filled from the active brand kit.
  Text in [brackets] is for you to replace with real details.
*/
window.REEL_PACKS = (function(){
  const contact = "{web}  |  {phone}";
  /* posts every business can use */
  const COMMON_POSTS = [
    { cat:"Trust and contact", name:"Contact us", sub:"Phone and website", style:{ theme:"slate" },
      pages:[{ layout:"split", f:{ badge:"Talk to us", eyebrow:"Call or WhatsApp", headline:"*{phone}*", body:"{tagline}", cta:"{web}" } }] },
    { cat:"Trust and contact", name:"Customer words", sub:"Use only real feedback", style:{ theme:"lime" },
      pages:[{ layout:"text", f:{ number:"“", headline:"[What your customer said, in their words]", body:"[Customer name], [what they bought or booked]", swipe:"" } }] },
    { cat:"Trust and contact", name:"Meet the team", sub:"Introduce the people", style:{ theme:"lime" },
      pages:[{ layout:"text", f:{ number:"Hi", headline:"We are *{name}*", body:"[Names]. [One line on what you do and why people trust you.]", swipe:"" } }] },
    { cat:"Festive", name:"Diwali greeting", sub:"Warm wishes", style:{ overlay:"full", align:"center" },
      pages:[{ layout:"feature", f:{ eyebrow:"From all of us at {name}", headline:"Happy *Diwali*", body:"May your days be bright and full of light." } }] },
    { cat:"Festive", name:"Any festival", sub:"Edit the festival name", style:{ theme:"deodar" },
      pages:[{ layout:"text", f:{ number:"", headline:"Happy *[Festival]*", body:"Warm wishes to you and your family from {name}.", swipe:"" } }] }
  ];
  const FESTIVE_REEL = { name:"Festival greeting", sub:"1 or 2 photos with warm wishes.", accept:"image/*", intro:{ on:false }, outro:{ cta:"Warm wishes from *{name}*" }, cap:{ style:"cinema" },
    scenes:[["gravity", { text:"Happy *[Festival]*" }]], slots:[{ text:"Wishing you and your family *joy*", textAnim:"word", textPos:"center", dur:4 }, { dur:4 }] };
  const TALK_REEL = (name, hook, follow) => ({ name, sub:"One clip of you talking. Big captions, quick hook.", accept:"video/*", intro:{ on:false }, outro:{ cta:follow }, cap:{ style:"bold", size:1.65, words:"short", anim:"word" },
    scenes:[["kinetic", { text:hook }]], slots:[{ frame:"full" }], tip:"Open Voiceover, choose Video's own sound, then Make captions from the voice." });

  return {
    restaurant:{
      label:"Restaurant or cafe",
      post:{
        defaults:{ badge:"Now open", eyebrow:"{area}, {city}", headline:"Fresh food, *made today*", body:"[Your signature dish or promise in one line.]", cta:"Order now", price:"From ₹[XX]", specs:"Dine in, Takeaway, Delivery", number:"01", handle:"{handle}", swipe:"Swipe", tagline:"{tagline}", contact },
        templates:[
          { cat:"Offers", name:"Today's special", sub:"Dish of the day", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"Today's special", eyebrow:"{name}, {city}", headline:"[Dish name], *made fresh*", body:"[What makes it good, in one line.]", cta:"Order now" } }] },
          { cat:"Offers", name:"Combo offer", sub:"Price and what's included", style:{ overlay:"auto", theme:"lime" },
            pages:[{ layout:"listing", f:{ badge:"Combo", eyebrow:"Lunch [time]", headline:"[Combo name] for *two*", specs:"[Item], [Item], [Drink]", price:"₹[XX]", cta:"Order on [app]" } }] },
          { cat:"Offers", name:"Happy hours", sub:"Time-bound offer", style:{ overlay:"full", align:"center" },
            pages:[{ layout:"feature", f:{ badge:"Happy hours", eyebrow:"[Days], [time]", headline:"*[X]% off* on [items]", body:"Dine in only. Ask our team.", cta:"Book a table" } }] },
          { cat:"Menu", name:"Menu highlights", sub:"4-page carousel", style:{ theme:"lime", indicator:"count" },
            pages:[
              { layout:"split", f:{ badge:"Menu", eyebrow:"{name}", headline:"What to order at *{name}*", cta:"Swipe" } },
              { layout:"text", f:{ number:"01", headline:"*[Dish]*", body:"[One line on taste and price.]" } },
              { layout:"text", f:{ number:"02", headline:"*[Dish]*", body:"[One line on taste and price.]" } },
              { layout:"text", f:{ number:"03", headline:"*[Dish]*", body:"[One line on taste and price.]" } } ] },
          { cat:"Menu", name:"New on the menu", sub:"Launch a dish", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"New", eyebrow:"Only at {name}", headline:"Say hello to *[Dish]*", body:"[Ingredients or story, one line.]", cta:"Try it this week" } }] },
          { cat:"Events", name:"Live music night", sub:"Date, time, place", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"This [day]", eyebrow:"[Date], [time]", headline:"Live music with *[Artist]*", body:"{area}, {city}. Tables fill fast.", cta:"Reserve a table" } }] },
          { cat:"Events", name:"Book a table", sub:"Reservations", style:{ theme:"lime" },
            pages:[{ layout:"split", f:{ badge:"Reservations", eyebrow:"Open [hours]", headline:"Planning a *dinner*?", body:"Birthdays, family meals, team lunches. Call or DM.", cta:"Call {phone}" } }] },
          ...COMMON_POSTS ]
      },
      video:{
        intro:{ title:"Fresh at *{name}*", sub:"{city}" }, outro:{ cta:"Order now or *book a table*" },
        reels:[
          { name:"Dish showcase", sub:"3 to 5 food photos with names on screen.", accept:"image/*", intro:{ title:"Taste *{name}*", sub:"{city}" }, outro:{ cta:"Order now" }, cap:{ style:"wordbox", size:1.05 },
            slots:[{ text:"*[Dish]*", textAnim:"pop", motion:"zoom-in" }, { text:"*[Dish]*", textAnim:"pop" }, { text:"*[Dish]*", textAnim:"pop" }, { text:"Made *fresh* daily", textAnim:"word" }, { text:"From *₹[XX]*", textAnim:"pop" }] },
          { name:"Offer of the week", sub:"2 photos and a clear offer.", accept:"image/*", intro:{ on:false }, outro:{ cta:"Valid till *[date]*" }, cap:{ style:"bold", size:1.3 },
            scenes:[["kinetic", { text:"*[X]% off* this week only" }]], slots:[{ text:"[What is on offer]", textAnim:"rise" }, { text:"Dine in or *takeaway*", textAnim:"rise" }] },
          { name:"Behind the kitchen", sub:"Clips of cooking. Fast cuts.", accept:"video/*", intro:{ on:false }, outro:{ cta:"Come hungry. *{name}*" }, cap:{ style:"bold", size:1.4 },
            scenes:[["kinetic", { text:"How we make *[Dish]*" }]], slots:[{ frame:"full" }] },
          TALK_REEL("Chef tip (talking)", "The *secret* to [dish]", "Follow for more kitchen tips"),
          { name:"Our story", sub:"Motion scenes only. No photos needed.", accept:"", intro:{ title:"Why *{name}*", sub:"{city}" }, outro:{ cta:"See you at *{name}*" }, cap:{ style:"bold" },
            scenes:[["icons", {}], ["steps", {}], ["jiggle", {}]] },
          FESTIVE_REEL ],
        scenes:{
          kinetic:{ text:"Hungry in *{city}*?" }, gravity:{ text:"Fresh food. *Every day.*" },
          prompt:{ prompt:"Best [cuisine] near me in {city}", title:"*{name}* is open", sub:"Dine in · Takeaway · Delivery" },
          deck:{ labels:"Starters\nMains\nDesserts\nDrinks" }, icons:{ title:"Why people *come back*", items:"Fresh ingredients\nFair prices\nQuick service\nCosy seating" },
          filedrop:{ docs:"Starters\nMains\nDesserts\nDrinks", stamp:"Chef's pick", folder:"{name}" }, steps:{ title:"From *order* to table", steps:"Order\nCooked fresh\nServed hot\nEnjoy\nCome back" },
          jiggle:{ items:"Frozen food\nLong waits\nHidden charges\nSoggy fries", final:"What's left: *real food*" }, grade:{ before:"Raw", after:"Plated" },
          eyedropper:{ label:"Colours of the kitchen" }, title:{ eyebrow:"{name} presents", title:"Taste of *[Dish]*", sub:"{area}, {city}" }, grid:{ title:"Inside *{name}*" },
          feed:{ handle:"{handlebare}", captions:"Fresh from the kitchen\nWeekend specials\nYour table is ready" },
          commentcta:{ headline:"Want the *menu*?", comment:"Comment *MENU* and we will send it to you", handle:"{handlebare}" },
          comments:{ title:"Questions we get *every day*", list:"[name]: Do you deliver?\n[name]: Is there veg?\n[name]: Can I book for 10 people?" } }
      }
    },

    beauty:{
      label:"Salon, spa or clinic",
      post:{
        defaults:{ badge:"Book now", eyebrow:"{area}, {city}", headline:"Look good, *feel better*", body:"[Your main service or promise in one line.]", cta:"Book an appointment", price:"From ₹[XX]", specs:"[Service], [Service], [Service]", number:"01", handle:"{handle}", swipe:"Swipe", tagline:"{tagline}", contact },
        templates:[
          { cat:"Offers", name:"Service offer", sub:"Price and booking", style:{ overlay:"auto", theme:"lime" },
            pages:[{ layout:"listing", f:{ badge:"Offer", eyebrow:"This month", headline:"[Service] at *₹[XX]*", specs:"[Duration], [What's included]", price:"₹[XX]", cta:"Book now" } }] },
          { cat:"Offers", name:"First visit offer", sub:"Bring in new clients", style:{ overlay:"full", align:"center" },
            pages:[{ layout:"feature", f:{ badge:"New here?", eyebrow:"{name}, {city}", headline:"*[X]% off* your first visit", body:"Mention this post when you book.", cta:"Call {phone}" } }] },
          { cat:"Services", name:"Our services", sub:"5-page carousel", style:{ theme:"lime", indicator:"count" },
            pages:[
              { layout:"split", f:{ badge:"Services", eyebrow:"{name}", headline:"What we do at *{name}*", cta:"Swipe" } },
              { layout:"text", f:{ number:"01", headline:"*[Service]*", body:"[Who it is for and how long it takes.]" } },
              { layout:"text", f:{ number:"02", headline:"*[Service]*", body:"[Who it is for and how long it takes.]" } },
              { layout:"text", f:{ number:"03", headline:"*[Service]*", body:"[Who it is for and how long it takes.]" } },
              { layout:"feature", f:{ eyebrow:"{name}", headline:"Ready for your *visit*?", body:"Book in a minute on WhatsApp.", cta:"Call {phone}" } } ] },
          { cat:"Services", name:"Before and after", sub:"Show a real result", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"Real result", eyebrow:"[Service]", headline:"[Result in a few words]", body:"Shared with the client's permission.", cta:"Book yours" } }] },
          { cat:"Tips", name:"Care tips", sub:"4-page carousel", style:{ theme:"deodar", indicator:"count" },
            pages:[
              { layout:"text", f:{ number:"", headline:"[X] tips for *[hair, skin or nails]*", body:"Save this for later." } },
              { layout:"text", f:{ number:"01", headline:"[Tip]", body:"[Why it helps, one line.]" } },
              { layout:"text", f:{ number:"02", headline:"[Tip]", body:"[Why it helps, one line.]" } },
              { layout:"text", f:{ number:"03", headline:"[Tip]", body:"[Why it helps, one line.]" } } ] },
          { cat:"Bookings", name:"Slots open", sub:"Fill empty slots", style:{ theme:"lime" },
            pages:[{ layout:"split", f:{ badge:"Slots open", eyebrow:"[Day], [time]", headline:"*[X] slots* left this week", body:"DM or call to book yours.", cta:"Call {phone}" } }] },
          ...COMMON_POSTS ]
      },
      video:{
        intro:{ title:"Welcome to *{name}*", sub:"{city}" }, outro:{ cta:"Book your *appointment*" },
        reels:[
          { name:"Before / after", sub:"2 photos: before, then the result.", accept:"image/*", compare:true, intro:{ title:"The *glow up*", sub:"{name}" }, outro:{ cta:"Book yours at *{name}*" }, cap:{ style:"bold" }, slots:[{ dur:5 }] },
          { name:"Service showcase", sub:"3 to 5 photos with service names.", accept:"image/*", intro:{ title:"At *{name}*", sub:"{city}" }, outro:{ cta:"Book now" }, cap:{ style:"wordbox", size:1.05 },
            slots:[{ text:"*[Service]*", textAnim:"pop" }, { text:"*[Service]*", textAnim:"pop" }, { text:"*[Service]*", textAnim:"pop" }, { text:"From *₹[XX]*", textAnim:"pop" }] },
          { name:"Transformation clip", sub:"One clip of a session. Speed it up.", accept:"video/*", intro:{ on:false }, outro:{ cta:"Book at *{name}*" }, cap:{ style:"bold", size:1.4 },
            scenes:[["kinetic", { text:"Watch this *transformation*" }]], slots:[{ frame:"full", speed:2 }] },
          TALK_REEL("Expert tip (talking)", "Stop doing *this* to your [hair or skin]", "Follow for more tips"),
          { name:"Why choose us", sub:"Motion scenes only. No photos needed.", accept:"", intro:{ title:"Why *{name}*", sub:"{city}" }, outro:{ cta:"Book your visit" }, cap:{ style:"bold" },
            scenes:[["icons", {}], ["steps", {}]] },
          FESTIVE_REEL ],
        scenes:{
          kinetic:{ text:"Need a *fresh look*?" }, gravity:{ text:"You deserve *this*." },
          prompt:{ prompt:"Best [service] near me in {city}", title:"*{name}* has slots", sub:"Trained team · Hygienic · Fair prices" },
          deck:{ labels:"Reception\nStations\nProducts\nResults" }, icons:{ title:"Why clients *trust us*", items:"Trained experts\nClean and safe\nGood products\nOn time" },
          filedrop:{ docs:"Consultation\nPatch test\nTreatment plan\nAftercare", stamp:"Done right", folder:"{name}" }, steps:{ title:"Your *visit*, step by step", steps:"Book\nConsult\nTreatment\nAftercare\nGlow" },
          jiggle:{ items:"Long waits\nPushy upselling\nHidden charges\nRushed work", final:"What's left: *care that shows*" }, grade:{ before:"Before", after:"After" },
          eyedropper:{ label:"Your colour, your way" }, title:{ eyebrow:"{name} presents", title:"The *[Service]* edit", sub:"{area}, {city}" }, grid:{ title:"Inside *{name}*" },
          feed:{ handle:"{handlebare}", captions:"Fresh looks this week\nSlots open on weekends\nReal clients, real results" },
          commentcta:{ headline:"Want the *price list*?", comment:"Comment *PRICE* and we will send it to you", handle:"{handlebare}" },
          comments:{ title:"Questions we get *every week*", list:"[name]: How long does it take?\n[name]: Is it safe for sensitive skin?\n[name]: Do you take walk-ins?" } }
      }
    },

    retail:{
      label:"Shop or retail",
      post:{
        defaults:{ badge:"New arrival", eyebrow:"{area}, {city}", headline:"Just in: *[Product]*", body:"[Why people will love it, in one line.]", cta:"Shop now", price:"₹[XX]", specs:"[Size], [Colour], [Material]", number:"01", handle:"{handle}", swipe:"Swipe", tagline:"{tagline}", contact },
        templates:[
          { cat:"Products", name:"New arrival", sub:"Photo-led product post", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"New arrival", eyebrow:"Only at {name}", headline:"Meet *[Product]*", body:"[What it is and why it's good, one line.]", cta:"Shop now" } }] },
          { cat:"Products", name:"Product card", sub:"Price and details", style:{ overlay:"auto", theme:"lime" },
            pages:[{ layout:"listing", f:{ badge:"In stock", eyebrow:"{name}", headline:"[Product] in *[colour]*", specs:"[Size], [Material], [Warranty]", price:"₹[XX]", cta:"Order on WhatsApp" } }] },
          { cat:"Offers", name:"Sale", sub:"Big discount announcement", style:{ overlay:"full", align:"center" },
            pages:[{ layout:"feature", f:{ badge:"Sale", eyebrow:"[Dates]", headline:"Up to *[X]% off*", body:"In store and on WhatsApp. While stocks last.", cta:"Visit us today" } }] },
          { cat:"Offers", name:"Buy more, save more", sub:"Bundle offer", style:{ theme:"lime" },
            pages:[{ layout:"split", f:{ badge:"Bundle", eyebrow:"This week", headline:"Buy [2], get *[1] free*", body:"On [category]. Ask in store.", cta:"Call {phone}" } }] },
          { cat:"Guides", name:"How to choose", sub:"4-page carousel", style:{ theme:"lime", indicator:"count" },
            pages:[
              { layout:"split", f:{ badge:"Guide", eyebrow:"Save this", headline:"How to choose the right *[product]*", cta:"Swipe" } },
              { layout:"text", f:{ number:"01", headline:"[Check this]", body:"[Why it matters, one line.]" } },
              { layout:"text", f:{ number:"02", headline:"[Check this]", body:"[Why it matters, one line.]" } },
              { layout:"feature", f:{ eyebrow:"{name}", headline:"Not sure? *Ask us*", body:"We help you pick, no pressure.", cta:"Call {phone}" } } ] },
          { cat:"Store", name:"Visit the store", sub:"Address and hours", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"Open today", eyebrow:"[Hours]", headline:"Find us in *{area}*", body:"[Landmark]. Parking available.", cta:"Get directions" } }] },
          ...COMMON_POSTS ]
      },
      video:{
        intro:{ title:"New at *{name}*", sub:"{city}" }, outro:{ cta:"Shop now or *order on WhatsApp*" },
        reels:[
          { name:"Product showcase", sub:"3 to 6 product photos with names and prices.", accept:"image/*", intro:{ title:"Just in at *{name}*", sub:"{city}" }, outro:{ cta:"Order on WhatsApp" }, cap:{ style:"wordbox", size:1.05 },
            slots:[{ text:"*[Product]*", textAnim:"pop", motion:"zoom-in" }, { text:"*[Product]*", textAnim:"pop" }, { text:"*[Product]*", textAnim:"pop" }, { text:"From *₹[XX]*", textAnim:"pop" }] },
          { name:"Sale countdown", sub:"2 photos and a deadline.", accept:"image/*", intro:{ on:false }, outro:{ cta:"Sale ends *[date]*" }, cap:{ style:"bold", size:1.3 },
            scenes:[["kinetic", { text:"*[X]% off* ends soon" }]], slots:[{ text:"[What's on sale]", textAnim:"rise" }, { text:"In store and *online*", textAnim:"rise" }] },
          { name:"Unboxing", sub:"One clip opening the product.", accept:"video/*", intro:{ on:false }, outro:{ cta:"Get yours at *{name}*" }, cap:{ style:"bold", size:1.4 },
            scenes:[["kinetic", { text:"Unboxing *[Product]*" }]], slots:[{ frame:"full" }] },
          TALK_REEL("Product tip (talking)", "Don't buy [product] *before* you check this", "Follow for more tips"),
          { name:"Why shop with us", sub:"Motion scenes only. No photos needed.", accept:"", intro:{ title:"Why *{name}*", sub:"{city}" }, outro:{ cta:"Visit us today" }, cap:{ style:"bold" },
            scenes:[["icons", {}], ["jiggle", {}]] },
          FESTIVE_REEL ],
        scenes:{
          kinetic:{ text:"Looking for *[product]* in {city}?" }, gravity:{ text:"Good stuff. *Fair prices.*" },
          prompt:{ prompt:"Where to buy [product] in {city}", title:"*{name}* has it", sub:"In stock · Fair prices · Easy returns" },
          deck:{ labels:"New in\nBest sellers\nOn sale\nGifts" }, icons:{ title:"Why people *shop here*", items:"Genuine products\nFair prices\nEasy returns\nHelpful staff" },
          filedrop:{ docs:"Bill\nWarranty card\nCare guide\nReturn policy", stamp:"Genuine", folder:"{name}" }, steps:{ title:"From *browse* to doorstep", steps:"Browse\nAsk us\nOrder\nPacked\nDelivered" },
          jiggle:{ items:"Fake products\nHidden charges\nNo returns\nRude service", final:"What's left: *honest shopping*" }, grade:{ before:"Plain", after:"Styled" },
          eyedropper:{ label:"Pick your colour" }, title:{ eyebrow:"{name} presents", title:"The *[collection]* drop", sub:"{area}, {city}" }, grid:{ title:"New at *{name}*" },
          feed:{ handle:"{handlebare}", captions:"New arrivals this week\nBest sellers back in stock\nGift ideas under ₹[XX]" },
          commentcta:{ headline:"Want the *price list*?", comment:"Comment *PRICE* and we will send it to you", handle:"{handlebare}" },
          comments:{ title:"Questions we get *every day*", list:"[name]: Do you deliver?\n[name]: Is it in stock?\n[name]: Can I return it?" } }
      }
    },

    general:{
      label:"Any business or service",
      post:{
        defaults:{ badge:"New", eyebrow:"{city}", headline:"[Your main message], *made simple*", body:"[What you do and who it's for, in one line.]", cta:"Get in touch", price:"From ₹[XX]", specs:"[Point], [Point], [Point]", number:"01", handle:"{handle}", swipe:"Swipe", tagline:"{tagline}", contact },
        templates:[
          { cat:"Announcements", name:"Announcement", sub:"Photo-led news post", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"News", eyebrow:"{name}", headline:"[Big news in a few words]", body:"[One line with the detail.]", cta:"Learn more" } }] },
          { cat:"Announcements", name:"Offer", sub:"Price or discount", style:{ overlay:"full", align:"center" },
            pages:[{ layout:"feature", f:{ badge:"Offer", eyebrow:"[Dates]", headline:"*[X]% off* [service or product]", body:"[Any condition, one line.]", cta:"Call {phone}" } }] },
          { cat:"Services", name:"Service card", sub:"What, price, CTA", style:{ overlay:"auto", theme:"lime" },
            pages:[{ layout:"listing", f:{ badge:"Service", eyebrow:"{name}", headline:"[Service name]", specs:"[Point], [Point], [Point]", price:"From ₹[XX]", cta:"Book now" } }] },
          { cat:"Services", name:"How it works", sub:"4-page carousel", style:{ theme:"lime", indicator:"count" },
            pages:[
              { layout:"split", f:{ badge:"How it works", eyebrow:"{name}", headline:"Working with us in *3 steps*", cta:"Swipe" } },
              { layout:"text", f:{ number:"01", headline:"[Step one]", body:"[One line.]" } },
              { layout:"text", f:{ number:"02", headline:"[Step two]", body:"[One line.]" } },
              { layout:"text", f:{ number:"03", headline:"[Step three]", body:"[One line.]" } } ] },
          { cat:"Tips", name:"Tips carousel", sub:"Save-worthy advice", style:{ theme:"deodar", indicator:"count" },
            pages:[
              { layout:"text", f:{ number:"", headline:"[X] tips for *[topic]*", body:"Save this for later." } },
              { layout:"text", f:{ number:"01", headline:"[Tip]", body:"[Why it helps.]" } },
              { layout:"text", f:{ number:"02", headline:"[Tip]", body:"[Why it helps.]" } },
              { layout:"feature", f:{ eyebrow:"{name}", headline:"Need help with *[topic]*?", body:"Talk to us. No pressure.", cta:"Call {phone}" } } ] },
          { cat:"Announcements", name:"Event or workshop", sub:"Date, time, place", style:{ overlay:"auto", align:"left" },
            pages:[{ layout:"feature", f:{ badge:"Event", eyebrow:"[Date], [time]", headline:"[Event name]", body:"[Place], {city}. [Free or price].", cta:"Register now" } }] },
          ...COMMON_POSTS ]
      },
      video:{
        intro:{ title:"Hello from *{name}*", sub:"{city}" }, outro:{ cta:"Get in touch *today*" },
        reels:[
          { name:"Photo showcase", sub:"3 to 6 photos with short lines on screen.", accept:"image/*", intro:{ title:"This is *{name}*", sub:"{city}" }, outro:{ cta:"Get in touch" }, cap:{ style:"wordbox", size:1.05 },
            slots:[{ text:"[Line one]", textAnim:"rise" }, { text:"[Line two]", textAnim:"rise" }, { text:"[Line three]", textAnim:"rise" }, { text:"*[Your promise]*", textAnim:"word" }] },
          { name:"Offer reel", sub:"2 photos and a clear offer.", accept:"image/*", intro:{ on:false }, outro:{ cta:"Valid till *[date]*" }, cap:{ style:"bold", size:1.3 },
            scenes:[["kinetic", { text:"*[Offer]* this week" }]], slots:[{ text:"[What you get]", textAnim:"rise" }, { text:"Call *{phone}*", textAnim:"rise" }] },
          TALK_REEL("Tip (talking)", "Most people get *[topic]* wrong", "Follow for more tips"),
          { name:"How it works", sub:"Motion scenes only. No photos needed.", accept:"", intro:{ title:"How *{name}* works", sub:"{city}" }, outro:{ cta:"Get started today" }, cap:{ style:"bold" },
            scenes:[["steps", {}], ["icons", {}], ["commentcta", {}]] },
          { name:"Before / after", sub:"2 photos: before, then the result.", accept:"image/*", compare:true, intro:{ title:"Before and *after*", sub:"{name}" }, outro:{ cta:"Want this too? *Call us*" }, cap:{ style:"bold" }, slots:[{ dur:5 }] },
          FESTIVE_REEL ],
        scenes:{
          kinetic:{ text:"Looking for *[service]* in {city}?" }, gravity:{ text:"Simple. Honest. *Done right.*" },
          prompt:{ prompt:"Best [service] in {city}", title:"*{name}* can help", sub:"Quick replies · Fair prices · Real people" },
          deck:{ labels:"Step one\nStep two\nStep three\nResult" }, icons:{ title:"Why people *choose us*", items:"Clear pricing\nQuick replies\nExperienced team\nOn time" },
          filedrop:{ docs:"Quote\nPlan\nWork done\nFollow-up", stamp:"Done", folder:"{name}" }, steps:{ title:"From *hello* to done", steps:"Call us\nWe plan\nWe do it\nYou check\nDone" },
          jiggle:{ items:"Hidden charges\nLate replies\nConfusing terms\nEndless delays", final:"What's left: *honest work*" }, grade:{ before:"Before", after:"After" },
          eyedropper:{ label:"Details that matter" }, title:{ eyebrow:"{name} presents", title:"Meet *[topic]*", sub:"{city}" }, grid:{ title:"Inside *{name}*" },
          feed:{ handle:"{handlebare}", captions:"What we did this week\nReal customers, real results\nAsk us anything" },
          commentcta:{ headline:"Want the *details*?", comment:"Comment *INFO* and we will send them to you", handle:"{handlebare}" },
          comments:{ title:"Questions we get *every week*", list:"[name]: How much does it cost?\n[name]: How long does it take?\n[name]: Do you work weekends?" } }
      }
    }
  };
})();
