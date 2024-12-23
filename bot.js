const { Telegraf, Markup, session } = require("telegraf");

const mongoose = require("mongoose");
const TOKEN = "7712916176:AAF15UqOplv1hTdJVxILWoUOEefEKjGJOso";
const bot = new Telegraf(TOKEN);

// MongoDB Connection URLs
DATABASE_URL = process.env.DATABASE_URL;

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to Residency Database"))
  .catch((error) => console.error("Error connecting to MongoDB:", error.message));

  bot.use(session());

  bot.use((ctx, next) => {
    if (!ctx.session) {
      ctx.session = {}; // Initialize session if undefined
    }
    console.log("Session:", ctx.session); // Debug session data
    return next();
  });
 

  bot.use((ctx, next) => {
    if (!ctx.session) ctx.session = {};
    if (!ctx.session.webAppURL) {
      const user = ctx.from;
      const username = user.username || "No username";
      const userId = user.id;
      const firstName = user.first_name || "No first name";
      const lastName = user.last_name || "No last name";
  
      // Generate the WebApp URL dynamically
      ctx.session.webAppURL = `https://sheik-front.vercel.app?username=${encodeURIComponent(
        username
      )}&userId=${userId}&firstName=${encodeURIComponent(
        firstName
      )}&lastName=${encodeURIComponent(lastName)}`;
    }
    return next();
  });
  
  // Global WebApp URL Function
  let globalWebAppURL = "";
  const generateGlobalWebAppURL = (user) => {
    const username = user.username || "No username";
    const userId = user.id;
    const firstName = user.first_name || "No first name";
    const lastName = user.last_name || "No last name";
    return `https://sheik-front.vercel.app?username=${encodeURIComponent(
      username
    )}&userId=${userId}&firstName=${encodeURIComponent(
      firstName
    )}&lastName=${encodeURIComponent(lastName)}`;
  };

// Define the Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  address: String,
  price: Number,
  bathrooms: Number,
  rooms: Number,
  area: Number,
  type: String,
  images: [String],
  residencyType: String,
  description: String,
  status: String,
  propertyType: String,
  district: [String],
  city: String,
  parking: Boolean,
});

const Property = mongoose.model("Residency", propertySchema);


const userFilters = {};
const userStates = {}; // Tracks the current step for each user






// Helper Function: Fetch Properties by Filters
const reverseMapping = {
  en: {
    cities: {
      "Tbilisi": "Tbilisi",
      "Batumi": "Batumi",
    },
    districts: {
      "Abanotubani": "Abanotubani",
  "Afrika": "Afrika",
  "Avchala": "Avchala",
  "Avlabari": "Avlabari",
  "Bagebi": "Bagebi",
  "Chugureti": "Chugureti",
  "DidiDighomi": "DidiDighomi",
  "Didgori": "Didgori",
  "Didube": "Didube",
  "Didube-Chughureti": "Didube-Chughureti",
  "Dighmi 1-9": "Dighmi 1-9",
  "Dighmis Chala": "Dighmis Chala",
  "Dighmis Massive": "Dighmis Massive",
  "Digomi 1-9": "Digomi 1-9",
  "Digomi Massive": "Digomi Massive",
  "Elia": "Elia",
  "Gldani": "Gldani",
  "Gldani-Nadzaladevi": "Gldani-Nadzaladevi",
  "Iveri Settlement": "Iveri Settlement",
  "Isani": "Isani",
  "Krtsanisi": "Krtsanisi",
  "Koshigora": "Koshigora",
  "KusTba": "KusTba",
  "Lisi": "Lisi",
  "Lisi Adjacent Area": "Lisi Adjacent Area",
  "Lisi Lake": "Lisi Lake",
  "Marjanishvili": "Marjanishvili",
  "Mtatsminda": "Mtatsminda",
  "Mukhatgverdi": "Mukhatgverdi",
  "Mukhattskaro": "Mukhattskaro",
  "Nutsubidze Plateau": "Nutsubidze Plateau",
  "Nutsubidze Plato": "Nutsubidze Plato",
  "Okrokana": "Okrokana",
  "Old Tbilisi": "Old Tbilisi",
  "Ortachala": "Ortachala",
  "Saburtalo": "Saburtalo",
  "Samgori": "Samgori",
  "Sof. Digomi": "Sof. Digomi",
  "Sololaki": "Sololaki",
  "State University": "State University",
  "Svaneti Quarter": "Svaneti Quarter",
  "Tsavkisi Valley": "Tsavkisi Valley",
  "Temqa": "Temqa",
  "Tkhinvali": "Tkhinvali",
  "Tskhneti": "Tskhneti",
  "Vake": "Vake",
  "Vake-Saburtalo": "Vake-Saburtalo",
  "Vasizubani": "Vasizubani",
  "Varketili": "Varketili",
  "Vashlijvari": "Vashlijvari",
  "Vera": "Vera",
  "Vezisi": "Vezisi",
    },
  },
  ru: {
    cities: {
      "Тбилиси": "Tbilisi",
      "Батуми": "Batumi",
    },
    districts: {
     "Абанотубани": "Abanotubani",
  "Африка": "Afrika",
  "Авчала": "Avchala",
  "Авлабари": "Avlabari",
  "Багеби": "Bagebi",
  "Чугурети": "Chugureti",
  "ДидиДигоми": "DidiDighomi",
  "Дидгори": "Didgori",
  "Дидубе": "Didube",
  "Дидубе-Чугурети": "Didube-Chughureti",
  "Дигми 1-9": "Dighmi 1-9",
  "Дигмис Чала": "Dighmis Chala",
  "Дигмис Массив": "Dighmis Massive",
  "Дигоми 1-9": "Digomi 1-9",
  "Дигоми Массив": "Digomi Massive",
  "Элиа": "Elia",
  "Глдани": "Gldani",
  "Глдани-Надзаладеви": "Gldani-Nadzaladevi",
  "Иверийское поселение": "Iveri Settlement",
  "Исани": "Isani",
  "Кртсаниси": "Krtsanisi",
  "Кошигора": "Koshigora",
  "Кустба": "KusTba",
  "Лиси": "Lisi",
  "Лиси Прилегающая Зона": "Lisi Adjacent Area",
  "Озеро Лиси": "Lisi Lake",
  "Марджанишвили": "Marjanishvili",
  "Мтацминда": "Mtatsminda",
  "Мухатгверди": "Mukhatgverdi",
  "Мухатцкаро": "Mukhattskaro",
  "Плато Нутсубидзе": "Nutsubidze Plateau",
  "Нутсубидзе Плато": "Nutsubidze Plato",
  "Окрекана": "Okrokana",
  "Старый Тбилиси": "Old Tbilisi",
  "Ортачала": "Ortachala",
  "Сабуртало": "Saburtalo",
  "Самгори": "Samgori",
  "Соф. Дигоми": "Sof. Digomi",
  "Сололаки": "Sololaki",
  "Государственный Университет": "State University",
  "Квартал Сванети": "Svaneti Quarter",
  "Долина Цавкиси": "Tsavkisi Valley",
  "Темка": "Temqa",
  "Тхинвали": "Tkhinvali",
  "Цхнети": "Tskhneti",
  "Ваке": "Vake",
  "Ваке-Сабуртало": "Vake-Saburtalo",
  "Васизубани": "Vasizubani",
  "Варкетили": "Varketili",
  "Вашлиджвари": "Vashlijvari",
  "Вера": "Vera",
  "Везиси": "Vezisi",

    },
  },
  ka: {
    cities: {
      "თბილისი": "Tbilisi",
      "ბათუმი": "Batumi",
    },
    districts: {
     "აბანოთუბანი": "Abanotubani",
  "აფრიკა": "Afrika",
  "ავჭალა": "Avchala",
  "ავლაბარი": "Avlabari",
  "ბაგები": "Bagebi",
  "ჩუღურეთი": "Chugureti",
  "დიდიდიღომი": "DidiDighomi",
  "დიდგორი": "Didgori",
  "დიდუბე": "Didube",
  "დიდუბე-ჩუღურეთი": "Didube-Chughureti",
  "დიღმის 1-9": "Dighmi 1-9",
  "დიღმის ჩალა": "Dighmis Chala",
  "დიღმის მასივი": "Dighmis Massive",
  "დიღომის 1-9": "Digomi 1-9",
  "დიღომის მასივი": "Digomi Massive",
  "ელია": "Elia",
  "გლდანი": "Gldani",
  "გლდანი-ნაძალადევი": "Gldani-Nadzaladevi",
  "ივერის დასახლება": "Iveri Settlement",
  "ისანი": "Isani",
  "კრწანისი": "Krtsanisi",
  "კოშიგორა": "Koshigora",
  "კუს ტბა": "KusTba",
  "ლისი": "Lisi",
  "ლისი მიმდებარე ტერიტორია": "Lisi Adjacent Area",
  "ლისი ტბა": "Lisi Lake",
  "მარჯანიშვილი": "Marjanishvili",
  "მთაწმინდა": "Mtatsminda",
  "მუხათგვერდი": "Mukhatgverdi",
  "მუხაწკარო": "Mukhattskaro",
  "ნუცუბიძის პლატო": "Nutsubidze Plateau",
  "ნუცუბიძის პლატო": "Nutsubidze Plato",
  "ოქროყანა": "Okrokana",
  "ძველი თბილისი": "Old Tbilisi",
  "ორთაჭალა": "Ortachala",
  "საბურთალო": "Saburtalo",
  "სამგორი": "Samgori",
  "სოფ. დიღომი": "Sof. Digomi",
  "სოლოლაკი": "Sololaki",
  "სახელმწიფო უნივერსიტეტი": "State University",
  "სვანეთის კვარტალი": "Svaneti Quarter",
  "წაღვის ხეობა": "Tsavkisi Valley",
  "თემქა": "Temqa",
  "ტყინვალი": "Tkhinvali",
  "ცხინეთი": "Tskhneti",
  "ვაკე": "Vake",
  "ვაკე-საბურთალო": "Vake-Saburtalo",
  "ვაზისუბანი": "Vasizubani",
  "ვარკეთილი": "Varketili",
  "ვაშლიჯვარი": "Vashlijvari",
  "ვერა": "Vera",
  "ვეზისი": "Vezisi",
    },
  },
};



const fetchPropertiesByFilters = async (filters) => {
  try {
    const query = {};
    const lang = filters.language || "en"; // Default to 'en' if no language is provided
    console.log("Language:", lang); // Debugging

    // Ensure city is converted to English
    if (filters.city) {
      query.city =
        reverseMapping.ru?.cities[filters.city] ||
        reverseMapping.ka?.cities[filters.city] ||
        filters.city; // Convert or fallback to original
    }

    // Ensure district is converted to English
    if (filters.district) {
      query.district =
        reverseMapping.ru?.districts[filters.district] ||
        reverseMapping.ka?.districts[filters.district] ||
        filters.district; // Convert or fallback to original
    }

    // Handle price range
    if (filters.minPrice && filters.maxPrice) {
      query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
    }

    console.log("Query:", JSON.stringify(query)); // Debugging query
    const properties = await Property.find(query);
    console.log("Found properties:", properties.length);
    return properties;
  } catch (error) {
    console.error("Error fetching properties by filters:", error.message);
    return [];
  }
};






// Helper Function: Format Property Data
const formatProperty = (property) => {
  return (
    `🏠 *${property.title || "Untitled"}*\n` +
    `📍 Location: ${property.address || "Not provided"}\n` +
    `🏙️ City: ${property.city || "Not provided"}\n` +
    `🏙️ District: ${property.district || "Not provided"}\n` +
    `💰 Price: $${property.price || "N/A"}\n` +
    `🛏️ Rooms: ${property.rooms || "N/A"}\n` +
    `🛁 Bathrooms: ${property.bathrooms || "N/A"}\n` +
    `📏 Area: ${property.area || "N/A"} sqft\n` +
    `🚗 Parking: ${property.parking ? "Yes" : "No"}\n`
   );
};

const sendFilteredProperties = async (ctx, properties) => {
  if (properties.length === 0) {
    await ctx.reply("No properties found matching your criteria.");
    return;
  }

  for (let property of properties) {
    if (property.images && property.images.length > 0) {
      await ctx.replyWithPhoto(
        { url: property.images[0] },
        {
          caption: formatProperty(property),
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            Markup.button.webApp(
              "View Details", // Button text
              `https://add-bot.vercel.app/card/${property._id}` // Web app URL
            ),
          ])
        }
      );
    } else {
      await ctx.replyWithMarkdown(
        formatProperty(property), // Function to format property details
        Markup.inlineKeyboard([
          Markup.button.webApp(
            "View Details", // Button text
            `https://add-bot.vercel.app/card/${property._id}` // Web app URL
          ),
        ])
      );
    }
  }
};
 
const MESSAGES = {
  en: {
    welcome: "🏠 Welcome to Rent In Tbilisi — your property companion!",
    description: `No registration or email is required to interact with the app or contact the author of a listing. Simply click "Open Application," specify your search parameters, and choose a suitable option on the map or in the list.`,
    open: "👉 Rent in Tbilisi",
    choose_city: "Let's start filtering. Please choose a city:",
    cities: ["Tbilisi", "Batumi"],
    choose_district:"Please choose a District in ",
    post_ad: "📝 Post an Ad",
     find_property: "✨ Find Your Dream Property",
  },
  ru: {
    choose_city: "Давайте начнем фильтрацию. Пожалуйста, выберите город:",
    cities: ["Тбилиси", "Батуми"],
    choose_district: "Пожалуйста, выберите район в",

    welcome: "🏠 Добро пожаловать в Аренду в Тбилиси — ваш помощник по недвижимости!",
    description: `Регистрация или email не требуются для использования приложения или связи с автором объявления. Просто нажмите "Открыть приложение", укажите параметры поиска и выберите подходящий вариант на карте или в списке.`,
    open: "👉 Аренда в Тбилиси", // Updated text
    post_ad: "📝 Разместить объявление",
     find_property: "✨ Найти недвижимость мечты",
  },
  ka: {
        choose_city: "მოდით დავიწყოთ ფილტრაცია. გთხოვთ, აირჩიოთ ქალაქი:",
        cities: ["თბილისი", "ბათუმი"],
        choose_district: "გთხოვთ, აირჩიოთ უბანი ქალაქში",

        welcome: "🏠 კეთილი იყოს თქვენი მობრძანება თბილისის ქირავნაში — თქვენი ქონების მეგზური!",
        description: `რეგისტრაცია ან ელ.ფოსტა არ არის საჭირო აპლიკაციასთან ურთიერთობისთვის ან განცხადების ავტორთან დასაკავშირებლად. უბრალოდ დააჭირეთ "აპლიკაციის გახსნა", მიუთითეთ თქვენი საძიებო პარამეტრები და რუკაზე ან სიაში აირჩიეთ სასურველი ვარიანტი.`,
    open: "👉 Tbilisi-ში ქირავდება", // Updated text
    post_ad: "📝 განცხადების გამოქვეყნება",
     find_property: "✨ იპოვეთ თქვენი ოცნების ქონება",
  },
};

  bot.start((ctx) => {
  const user = ctx.from;
  globalWebAppURL = generateGlobalWebAppURL(user);
  console.log("User Info:", user);
  console.log("Global WebApp URL:", globalWebAppURL);
  ctx.reply(
    "🌐 Please select your language:",
    Markup.inlineKeyboard([
      [{ text: "English", callback_data: "lang_en" }],
      [{ text: "Русский", callback_data: "lang_ru" }],
      [{ text: "ქართული", callback_data: "lang_ka" }],
    ])
  );
});

bot.action(/lang_(.+)/, (ctx) => {
  const selectedLang = ctx.match[1]; // Extract language code (en, ru, ka)
  ctx.session.language = selectedLang; // Save selected language in session
  console.log(`Language set to: ${selectedLang}`); // Debug log
  const messages = MESSAGES[selectedLang]; // Fetch messages in the selected language
  ctx.replyWithMarkdown(
    `*${messages.welcome}*\n\n${messages.description}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open",
           web_app: { url: globalWebAppURL}
            },
          ],
          [
            {
              text: messages.open,
              url: "https://t.me/rent_tbilisi_ge",  
            },
          ],
          [{ text: messages.post_ad, web_app: { url: "https://add-bot.vercel.app" } }],
           [{ text: messages.find_property, callback_data: "find_dream_property" }],
        ],
      },
    }
  );
});

const initializeUserFilters = (ctx) => {
  if (!userFilters[ctx.from.id]) {
    userFilters[ctx.from.id] = {}; // Initialize user filters for the user
  }
};

const DISTRICTS = {
  en: {
    Tbilisi: ["Vera", "Mtatsminda", "Vake", "Sololaki", "Sanzona", "Chugureti", "Saburtalo", "Dididighomi"],
    Batumi: ["Old Boulevard", "New Boulevard", "Gonio", "Kobuleti", "Chakvi"],
  },
  ru: {
    Tbilisi: ["Вера", "Мтацминда", "Ваке", "Сололаки", "Санзона", "Чугурети", "Сабуртало", "Дидидигохми"],
    Batumi: ["Старый Бульвар", "Новый Бульвар", "Гонио", "Кобулети", "Чакви"],
  },
  ka: {
    Tbilisi: ["ვერა", "მთაწმინდა", "ვაკე", "სოლოლაკი", "სანზონა", "ჩუღურეთი", "საბურთალო", "დიდიდიღომი"],
    Batumi: ["ძველი ბულვარი", "ახალი ბულვარი", "გონიო", "ქობულეთი", "ჩაქვი"],
  },
};

bot.action("find_dream_property", (ctx) => {
  const lang = ctx.session?.language || "en"; // Default to English if not set
  const messages = MESSAGES[lang]; // Fetch messages for the selected language

  initializeUserFilters(ctx); // Ensure userFilters is initialized
  userStates[ctx.from.id] = "choose_city"; // Set the state to choose city

  ctx.answerCbQuery();
  ctx.reply(
    messages.choose_city, // Language-specific message
    Markup.inlineKeyboard(
      Object.keys(DISTRICTS[lang]).map((cityKey) => [
        Markup.button.callback(messages.cities[Object.keys(DISTRICTS[lang]).indexOf(cityKey)], `city_${cityKey}`)
      ])
    )
  );
});

Object.keys(DISTRICTS.en).forEach((cityKey) => {
  bot.action(`city_${cityKey}`, async (ctx) => {
    const lang = ctx.session?.language || "en"; // Default to English
    const messages = MESSAGES[lang];
    const districts = DISTRICTS[lang][cityKey]; // Get districts for selected language and city

    initializeUserFilters(ctx); // Ensure userFilters is initialized
    userFilters[ctx.from.id].city = cityKey; // Store selected city
    userStates[ctx.from.id] = "choose_district"; // Move to next step

    await ctx.deleteMessage(); // Delete the current message

    ctx.reply(
      `${messages.choose_district} ${messages.cities[Object.keys(DISTRICTS[lang]).indexOf(cityKey)]}.`,
      Markup.inlineKeyboard([
        ...districts.map((district, index) => [
          Markup.button.callback(district, `district_${cityKey}_${index}`),
        ]),
        [Markup.button.callback(messages.back_to_city || "⬅️ Back", "back_to_city")], // Back button
      ])
    );
  });
});

Object.keys(DISTRICTS.en).forEach((cityKey) => {
  DISTRICTS.en[cityKey].forEach((_, index) => {
    bot.action(`district_${cityKey}_${index}`, async (ctx) => {
      const lang = ctx.session?.language || "en"; // Default to English
      const messages = MESSAGES[lang];
      const districts = DISTRICTS[lang][cityKey]; // Get language-specific districts
      const selectedDistrict = districts[index]; // Get the correct district by index

      initializeUserFilters(ctx);
      userFilters[ctx.from.id].district = selectedDistrict; // Store selected district
      userStates[ctx.from.id] = "choose_price";

      await ctx.deleteMessage(); // Delete the current message

      ctx.reply(
        `${messages.choose_price || "Please choose a price range:"} ${selectedDistrict}.`,
        Markup.inlineKeyboard(
          [
            [Markup.button.callback("$0 - $300", "price_0_300")],
            [Markup.button.callback("$300 - $500", "price_300_500")],
            [Markup.button.callback("$500 - $700", "price_500_700")],
            [Markup.button.callback("$700 - $900", "price_700_900")],
            [Markup.button.callback("$900 - $1200", "price_900_1200")],
            [Markup.button.callback("$1200 - $1500", "price_1200_1500")],
            [Markup.button.callback("$1500 - $1700", "price_1500_1700")],
            [Markup.button.callback("$1700 - $1900", "price_1700_1900")],
            [Markup.button.callback("$1900 - $2100", "price_1900_2100")],
            [Markup.button.callback("$2100 - $2500", "price_2100_2500")],
            [Markup.button.callback("$2500 - $3000", "price_2500_3000")],
            [Markup.button.callback("$3000 - $4000", "price_3000_4000")],
            [Markup.button.callback("$4000 - $5000", "price_4000_5000")],
            [Markup.button.callback(messages.above_price_5000 || "Above $5000", "price_above_5000")]
          ]
          
      
      )
      );
    });
  });
});

bot.action("back_to_city", async (ctx) => {
  const lang = ctx.session?.language || "en";
  const messages = MESSAGES[lang];

  await ctx.deleteMessage(); // Delete the current message

  ctx.reply(
    messages.choose_city || "Please choose a city:",
    Markup.inlineKeyboard(
      Object.keys(DISTRICTS[lang]).map((cityKey) => [
        Markup.button.callback(messages.cities[Object.keys(DISTRICTS[lang]).indexOf(cityKey)], `city_${cityKey}`),
      ])
    )
  );
});

Object.keys(DISTRICTS.en).forEach((cityKey) => {
  bot.action(`back_to_district_${cityKey}`, async (ctx) => {
    const lang = ctx.session?.language || "en"; // Default to English
    const messages = MESSAGES[lang];
    const districts = DISTRICTS[lang][cityKey]; // Retrieve districts for the selected city

    await ctx.deleteMessage(); // Delete the current message

    ctx.reply(
      `${messages.choose_district || "Please choose a district:"}`,
      Markup.inlineKeyboard([
        ...districts.map((district, index) => [
          Markup.button.callback(district, `district_${cityKey}_${index}`),
        ]),
        [Markup.button.callback(messages.back_to_city || "⬅️ Back", "back_to_city")], // Back to city
      ])
    );
  });
});

bot.action("price_0_300", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 0;
  userFilters[ctx.from.id].maxPrice = 300;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_300_500", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 300;
  userFilters[ctx.from.id].maxPrice = 500;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_500_700", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 500;
  userFilters[ctx.from.id].maxPrice = 700;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_700_900", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 700;
  userFilters[ctx.from.id].maxPrice = 900;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_900_1200", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 900;
  userFilters[ctx.from.id].maxPrice = 1200;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_1200_1500", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 1200;
  userFilters[ctx.from.id].maxPrice = 1500;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_1500_1700", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 1500;
  userFilters[ctx.from.id].maxPrice = 1700;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_1700_1900", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 1700;
  userFilters[ctx.from.id].maxPrice = 1900;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_1900_2100", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 1900;
  userFilters[ctx.from.id].maxPrice = 2100;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_2100_2500", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 2100;
  userFilters[ctx.from.id].maxPrice = 2500;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_2500_3000", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 2500;
  userFilters[ctx.from.id].maxPrice = 3000;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_3000_4000", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 3000;
  userFilters[ctx.from.id].maxPrice = 4000;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_4000_5000", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 4000;
  userFilters[ctx.from.id].maxPrice = 5000;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});


 


bot.action("back_to_city", (ctx) => {
  const lang = ctx.session?.language || "en"; // Get current language, default to 'en'
  const messages = MESSAGES[lang]; // Get messages in selected language

  initializeUserFilters(ctx); // Ensure userFilters is initialized
  delete userFilters[ctx.from.id].city; // Remove city filter
  userStates[ctx.from.id] = "choose_city";

  ctx.answerCbQuery();
  ctx.reply(
    messages.choose_city, // Correct language-specific "choose city" message
    Markup.inlineKeyboard(
      Object.keys(DISTRICTS[lang]).map((cityKey) => [
        Markup.button.callback(messages.cities[Object.keys(DISTRICTS[lang]).indexOf(cityKey)], `city_${cityKey}`)
      ])
    )
  );
});


bot.action("back_to_district", (ctx) => {
  initializeUserFilters(ctx); // Ensure userFilters is initialized
  delete userFilters[ctx.from.id].district; // Remove district filter
  userStates[ctx.from.id] = "choose_district";

  const city = userFilters[ctx.from.id].city; // Use the previously selected city
  ctx.answerCbQuery();
  ctx.reply("Please choose a district:", Markup.inlineKeyboard([
    ...DISTRICTS[city].map(district => [Markup.button.callback(district, `district_${district}`)]),
    [Markup.button.callback("⬅️ Back", "back_to_city")],
  ]));
});

// Handle Price Selection
 

// Apply Filters
const applyFilters = async (ctx) => {
  const filters = userFilters[ctx.from.id];
  ctx.reply("Applying filters... Please wait.");
  const properties = await fetchPropertiesByFilters(filters);
  await sendFilteredProperties(ctx, properties);
};

// Launch the bot
bot.launch().then(() => console.log("Telegram Bot is running"));

// Graceful Shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));



module.exports = { Property };
