const { Telegraf, Markup, session } = require("telegraf");

const mongoose = require("mongoose");
const TOKEN = "7712916176:AAF15UqOplv1hTdJVxILWoUOEefEKjGJOso";
const bot = new Telegraf(TOKEN);

// MongoDB Connection URLs
DATABASE_URL = process.env.DATABASE_URL;

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
      ctx.session.webAppURL = `https://sheik-front.vercel.app/?username=${encodeURIComponent(
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
    return `https://sheik-front.vercel.app//?username=${encodeURIComponent(
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
      "Tblisi": "Tblisi",
      "Batumi": "Batumi",
    },
    districts: {
      "Vera": "Vera",
      "Mtatsminda": "Mtatsminda",
      "Vake": "Vake",
      "Sololaki": "Sololaki",
      "Sanzona": "Sanzona",
      "Chugureti": "Chugureti",
      "Saburtalo": "Saburtalo",
      "Dididighomi": "Dididighomi",
      "Old Boulevard": "Old Boulevard",
      "New Boulevard": "New Boulevard",
      "Gonio": "Gonio",
      "Kobuleti": "Kobuleti",
      "Chakvi": "Chakvi",
    },
  },
  ru: {
    cities: {
      "Тбилиси": "Tblisi",
      "Батуми": "Batumi",
    },
    districts: {
      "Вера": "Vera",
      "Мтацминда": "Mtatsminda",
      "Ваке": "Vake",
      "Сололаки": "Sololaki",
      "Санзона": "Sanzona",
      "Чугурети": "Chugureti",
      "Сабуртало": "Saburtalo",
      "Дидидигохми": "Dididighomi",
      "Старый Бульвар": "Old Boulevard",
      "Новый Бульвар": "New Boulevard",
      "Гонио": "Gonio",
      "Кобулети": "Kobuleti",
      "Чакви": "Chakvi",
    },
  },
  ka: {
    cities: {
      "თბილისი": "Tblisi",
      "ბათუმი": "Batumi",
    },
    districts: {
      "ვერა": "Vera",
      "მთაწმინდა": "Mtatsminda",
      "ვაკე": "Vake",
      "სოლოლაკი": "Sololaki",
      "სანზონა": "Sanzona",
      "ჩუღურეთი": "Chugureti",
      "საბურთალო": "Saburtalo",
      "დიდიდიღომი": "Dididighomi",
      "ძველი ბულვარი": "Old Boulevard",
      "ახალი ბულვარი": "New Boulevard",
      "გონიო": "Gonio",
      "ქობულეთი": "Kobuleti",
      "ჩაქვი": "Chakvi",
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
              `https://sheik-front.vercel.app/card/${property._id}` // Web app URL
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
            `https://sheik-front.vercel.app/card/${property._id}` // Web app URL
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
    cities: ["Tblisi", "Batumi"],
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
            url: globalWebAppURL
            },
          ],
          [
            {
              text: messages.open,
              url: "https://t.me/rent_tbilisi_ge",  
            },
          ],
          [{ text: messages.post_ad, web_app: { url: "https://sheik-front.vercel.app" } }],
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
    Tblisi: ["Vera", "Mtatsminda", "Vake", "Sololaki", "Sanzona", "Chugureti", "Saburtalo", "Dididighomi"],
    Batumi: ["Old Boulevard", "New Boulevard", "Gonio", "Kobuleti", "Chakvi"],
  },
  ru: {
    Tblisi: ["Вера", "Мтацминда", "Ваке", "Сололаки", "Санзона", "Чугурети", "Сабуртало", "Дидидигохми"],
    Batumi: ["Старый Бульвар", "Новый Бульвар", "Гонио", "Кобулети", "Чакви"],
  },
  ka: {
    Tblisi: ["ვერა", "მთაწმინდა", "ვაკე", "სოლოლაკი", "სანზონა", "ჩუღურეთი", "საბურთალო", "დიდიდიღომი"],
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
        Markup.inlineKeyboard([
          [Markup.button.callback("$100 - $500", "price_100_500")],
          [Markup.button.callback("$500 - $1000", "price_500_1000")],
          [Markup.button.callback("$1000 - $2000", "price_1000_2000")],
          [Markup.button.callback(messages.above_price_2000 || "Above $2000", "price_above_2000")],
          [Markup.button.callback(messages.back_to_district || "⬅️ Back", `back_to_district_${cityKey}`)], // Back to districts
        ])
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

bot.action("price_100_500", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 100;
  userFilters[ctx.from.id].maxPrice = 500;
  userStates[ctx.from.id] = "done"; // Filtering complete
  await applyFilters(ctx);
});

bot.action("price_500_1000", async (ctx) => {
  userFilters[ctx.from.id].minPrice = 500;
  userFilters[ctx.from.id].maxPrice = 1000;
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
bot.action("price_100_500", async (ctx) => {
  initializeUserFilters(ctx); // Ensure userFilters is initialized
  userFilters[ctx.from.id].minPrice = 100;
  userFilters[ctx.from.id].maxPrice = 500;
  userStates[ctx.from.id] = "done"; // Filtering complete

  await applyFilters(ctx);
});

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
