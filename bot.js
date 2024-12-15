const { Telegraf, Markup, session } = require("telegraf");
const mongoose = require("mongoose");

// Telegram Bot Token
const TOKEN = "YOUR_BOT_TOKEN_HERE"; // Replace with your bot token
const bot = new Telegraf(TOKEN);

// MongoDB Connection URLs
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_FILTER = process.env.DATABASE_URL_FILTER;

// MongoDB Connections
mongoose.connect(DATABASE_URL)
  .then(() => console.log("Connected to Residency Database"))
  .catch((error) => console.error("Error connecting to Residency Database:", error.message));

const filterDbConnection = mongoose.createConnection(DATABASE_URL_FILTER);

filterDbConnection.on("connected", () => {
  console.log("Connected to Estate Database");
});

filterDbConnection.on("error", (error) => {
  console.error("Error connecting to Estate Database:", error.message);
});

// Define the Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  address: String,
  price: Number,
  city: String,
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
  parking: Boolean,
});

// Models for Each Database
const Property = mongoose.model("Residency", propertySchema); // Primary database
const FilterProperty = filterDbConnection.model("Estate", propertySchema); // Secondary database

// Session Middleware
bot.use(session());

// Language Data
const MESSAGES = {
  en: {
    welcome: "🏠 Welcome to Rent In Tbilisi — your property companion!",
    description: `No registration or email is required to interact with the app or contact the author of a listing. Simply click "Open Application," specify your search parameters, and choose a suitable option on the map or in the list.`,
    choose_city: "Let's start filtering. Please choose a city:",
    choose_district: "Please choose a district in",
    post_ad: "📝 Post an Ad",
    all_properties: "🏠 All Properties",
    find_property: "✨ Find Your Dream Property",
  },
  ru: {
    welcome: "🏠 Добро пожаловать в Аренду в Тбилиси — ваш помощник по недвижимости!",
    description: `Регистрация или email не требуются для использования приложения или связи с автором объявления. Просто нажмите "Открыть приложение", укажите параметры поиска и выберите подходящий вариант на карте или в списке.`,
    choose_city: "Давайте начнем фильтрацию. Пожалуйста, выберите город:",
    choose_district: "Пожалуйста, выберите район в",
    post_ad: "📝 Разместить объявление",
    all_properties: "🏠 Все объекты",
    find_property: "✨ Найти недвижимость мечты",
  },
  ka: {
    welcome: "🏠 კეთილი იყოს თქვენი მობრძანება თბილისის ქირავნაში — თქვენი ქონების მეგზური!",
    description: `რეგისტრაცია ან ელ.ფოსტა არ არის საჭირო აპლიკაციასთან ურთიერთობისთვის ან განცხადების ავტორთან დასაკავშირებლად. უბრალოდ დააჭირეთ "აპლიკაციის გახსნა", მიუთითეთ თქვენი საძიებო პარამეტრები და რუკაზე ან სიაში აირჩიეთ სასურველი ვარიანტი.`,
    choose_city: "მოდით დავიწყოთ ფილტრაცია. გთხოვთ, აირჩიოთ ქალაქი:",
    choose_district: "გთხოვთ, აირჩიოთ უბანი ქალაქში",
    post_ad: "📝 განცხადების გამოქვეყნება",
    all_properties: "🏠 ყველა ქონება",
    find_property: "✨ იპოვეთ თქვენი ოცნების ქონება",
  },
};

// District Data
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

// User Filters and States
const userFilters = {};
const userStates = {};

// Start Command
bot.start((ctx) => {
  ctx.reply(
    "🌐 Please select your language:",
    Markup.inlineKeyboard([
      [{ text: "English", callback_data: "lang_en" }],
      [{ text: "Русский", callback_data: "lang_ru" }],
      [{ text: "ქართული", callback_data: "lang_ka" }],
    ])
  );
});

// Handle Language Selection
bot.action(/lang_(.+)/, (ctx) => {
  const selectedLang = ctx.match[1];
  ctx.session.language = selectedLang;
  const messages = MESSAGES[selectedLang];

  ctx.replyWithMarkdown(
    `*${messages.welcome}*\n\n${messages.description}`,
    Markup.inlineKeyboard([
      [{ text: messages.post_ad, web_app: { url: "https://add-bot.vercel.app" } }],
      [{ text: messages.all_properties, callback_data: "all_properties" }],
      [{ text: messages.find_property, callback_data: "find_property" }],
    ])
  );
});

// Helper Functions
const initializeUserFilters = (ctx) => {
  if (!userFilters[ctx.from.id]) {
    userFilters[ctx.from.id] = {};
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

// Handle "find_dream_property" callback
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


 








// Handle All Properties Command
bot.action("all_properties", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const properties = await Property.find();
    console.log("Found properties:", properties.length);
    await sendFilteredProperties(ctx, properties);
  } catch (error) {
    console.error("Error all properties:", error.message);
    await ctx.reply("An error occurred while fetching properties. Please try again later.");
  }
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

module.exports = { Property, FilterProperty };
